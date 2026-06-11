package com.example.springboot.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.springboot.exception.ForbiddenException;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class PendingApprovalService {
    private final JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> getPendingApprovals(Integer userId, Integer workspaceId) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
            select ar.id, ar.title, ar.subject, ar.first_name || ' ' || ar.last_name as author, pa.arrived_at as time_ago
            from (select a.workspace_id, a.id, a.title, a.subject, u.first_name, u.last_name from approval_rounds as a
            inner join users as u on a.user_id = u.id) as ar inner join pending_approvals as pa
            on ar.id = pa.appr_id where pa.user_id=? and ar.workspace_id=?
        """, userId, workspaceId);

        for (Map<String, Object> row : rows) {
            LocalDateTime arrivedAt = ((Timestamp) row.get("time_ago")).toLocalDateTime();
            row.put("time_ago", calculateTimeAgo(arrivedAt));
        }
        return rows;
    }

    private String calculateTimeAgo(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        long days = ChronoUnit.DAYS.between(dateTime, now);

        if (minutes < 60) return minutes + " minutes ago";
        if (hours < 24) return hours + " hours ago";
        return days + " days ago";
    }

    public Map<String, Object> getPendingApproval(Integer userId, Integer workspaceId, Integer approvalId) {
        Boolean permission = jdbcTemplate.queryForObject("""
            select exists (select 1 from pending_approvals where user_id=? and appr_id=?)
                """, Boolean.class, userId, approvalId);
        
        if (permission) {
            Map<String, Object> response = jdbcTemplate.queryForMap("""
                select ar.id, ar.title, ar.subject, u.first_name || ' ' || u.last_name as initiated_by,
                ar.body from approval_rounds as ar inner join users as u on
                ar.user_id=u.id where ar.workspace_id=? and ar.id=?
                    """, workspaceId, approvalId);
            List<Map<String, Object>> response2 = jdbcTemplate.queryForList("""
                select original_name, file_url from files where appr_id=?
            """, approvalId);
            List<Map<String, Object>> response3 = jdbcTemplate.queryForList("""
                select u.first_name || ' ' || u.last_name as author, c.comment
                from comments as c inner join users as u on c.user_id=u.id
                where c.appr_id=?
            """, approvalId);
            response.put("attachment_links", response2);
            response.put("comments", response3);
            return response;
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }

    public void approveRejectApproval(Integer userId, Integer workspaceId, Integer approvalId) {
        // come back to this later
    }

    public void createComment(Integer userId, Integer workspaceId, Integer approvalId, Map<String, Object> commentData) {
        Boolean permission = jdbcTemplate.queryForObject("""
                    select exists (select 1 from roles where user_id=? and workspace_id=? and role_name='admin')
                """, Boolean.class, userId, workspaceId);
        Boolean permission2 = jdbcTemplate.queryForObject("""
                    select exists (select 1 from pending_approvals as pa where user_id=? and appr_id=?)
                """, Boolean.class, userId, approvalId);
        Boolean permission3 = jdbcTemplate.queryForObject("""
                    select exists (select 1 from approval_rounds as ar where id=? and user_id=?)
                """, Boolean.class, approvalId, userId);

        if (permission || permission2 || permission3) {
            jdbcTemplate.update("""
                    insert into comments (user_id, appr_id, comment) values (?, ?, ?)
                    """, userId, approvalId, commentData.get("comment"));
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }
}
