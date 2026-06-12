package com.example.springboot.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.springboot.exception.ForbiddenException;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class PendingApprovalService {
    private final JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> getPendingApprovals(Integer userId, Integer workspaceId) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
            select pa.node_id, ar.id, ar.title, ar.subject, ar.first_name || ' ' || ar.last_name as author, pa.arrived_at as time_ago
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

    @Transactional
    public void approveRejectApproval(Integer userId, Integer workspaceId, Integer approvalId, Map<String, Object> body) {
       /*
       update node status
       if approve
        if parallel
            remove from pending_approval
            if level completed
                set level status approved
                fire next level
            else
                do nothing
        if parallel (any)
            remove pending_approval from all nodes in level
            set level status approved
            fire next level
        if series
            remove from pending_approval
            if level completed
                set level status approved
                fire next level
            else
                fire next node
       if reject
        if parallel
            remove pending_approval from all nodes in level
            set level status rejected
            set approval status rejected
        if parallel (any)
            remove from pending_approval
            if level completed
                set level status rejected
                set approval status rejected
            else
                do nothing
        if series
            remove from pending approval
            set level status rejected
            set approval status rejected

       
       function fire next level (nextLevel) {
        if !nextLevel
            set approval status approved
        if nextLevel in (parallel any, parallel all)
            add approval to all level users' pending_approval
       } else {
            add approval to pending_approval of first node
        }
            */

        Integer nodeId = (Integer) body.get("node_id");
        Boolean permission = jdbcTemplate.queryForObject("""
            select exists (select 1 from node_data where id=? and user_id=?)
            """, Boolean.class, nodeId, userId);
               
        if (permission) {
            String status = (String) body.get("status");

            // get node's level
            Integer levelId = jdbcTemplate.queryForObject(
                "SELECT level_data_id FROM node_data WHERE id=?",
                Integer.class, nodeId
            );

            // get level type
            String levelType = jdbcTemplate.queryForObject(
                "SELECT type FROM level_data WHERE id=?",
                String.class, levelId
            );

            // update node status
            jdbcTemplate.update(
                "UPDATE node_data SET status=? WHERE id=?",
                status, nodeId
            );

            if (status.equals("approved")) {
                if (levelType.equals("parallel_all")) {
                    // remove this user from pending_approvals
                    jdbcTemplate.update(
                        "DELETE FROM pending_approvals WHERE node_id=?",
                        nodeId
                    );
                    // check if all nodes in level are approved
                    Boolean levelComplete = jdbcTemplate.queryForObject(
                        "SELECT NOT EXISTS (SELECT 1 FROM node_data WHERE level_data_id=? AND status != 'approved')",
                        Boolean.class, levelId
                    );
                    if (levelComplete) {
                        jdbcTemplate.update(
                            "UPDATE level_data SET status='approved' WHERE id=?",
                            levelId
                        );
                        fireNextLevel(approvalId, levelId);
                    }

                } else if (levelType.equals("parallel_any")) {
                    // remove all pending approvals for this level
                    jdbcTemplate.update("""
                        DELETE FROM pending_approvals WHERE appr_id=? AND node_id IN
                        (SELECT id FROM node_data WHERE level_data_id=?)
                    """, approvalId, levelId);
                    // set level approved
                    jdbcTemplate.update(
                        "UPDATE level_data SET status='approved' WHERE id=?",
                        levelId
                    );
                    fireNextLevel(approvalId, levelId);

                } else if (levelType.equals("series")) {
                    // remove this user from pending_approvals
                    jdbcTemplate.update(
                        "DELETE FROM pending_approvals WHERE node_id=?",
                        nodeId
                    );
                    // check if all nodes in level are approved
                    Boolean levelComplete = jdbcTemplate.queryForObject(
                        "SELECT NOT EXISTS (SELECT 1 FROM node_data WHERE level_data_id=? AND status != 'approved')",
                        Boolean.class, levelId
                    );
                    if (levelComplete) {
                        jdbcTemplate.update(
                            "UPDATE level_data SET status='approved' WHERE id=?",
                            levelId
                        );
                        fireNextLevel(approvalId, levelId);
                    } else {
                        // get current node's order
                        Integer currentOrder = jdbcTemplate.queryForObject(
                            "SELECT node_order FROM node_data WHERE id=?",
                            Integer.class, nodeId
                        );
                        // find next pending node by order
                        jdbcTemplate.update("""
                            INSERT INTO pending_approvals (appr_id, user_id, node_id)
                            SELECT ?, user_id, id FROM node_data
                            WHERE level_data_id=? AND node_order > ? AND status='pending'
                            ORDER BY node_order LIMIT 1
                        """, approvalId, levelId, currentOrder);
                    }
                }

            } else if (status.equals("rejected")) {
                if (levelType.equals("parallel_all")) {
                    // remove all pending approvals for this level
                    jdbcTemplate.update("""
                        DELETE FROM pending_approvals WHERE appr_id=? AND node_id IN
                        (SELECT id FROM node_data WHERE level_data_id=?)
                    """, approvalId, levelId);
                    jdbcTemplate.update("UPDATE level_data SET status='rejected' WHERE id=?", levelId);
                    jdbcTemplate.update("UPDATE approval_rounds SET status='rejected' WHERE id=?", approvalId);

                } else if (levelType.equals("parallel_any")) {
                    // remove this user from pending_approvals
                    jdbcTemplate.update(
                        "DELETE FROM pending_approvals WHERE node_id=?",
                        nodeId
                    );
                    // check if all nodes in level are rejected
                    Boolean levelComplete = jdbcTemplate.queryForObject(
                        "SELECT NOT EXISTS (SELECT 1 FROM node_data WHERE level_data_id=? AND status != 'rejected')",
                        Boolean.class, levelId
                    );
                    if (levelComplete) {
                        jdbcTemplate.update("UPDATE level_data SET status='rejected' WHERE id=?", levelId);
                        jdbcTemplate.update("UPDATE approval_rounds SET status='rejected' WHERE id=?", approvalId);
                    }

                } else if (levelType.equals("series")) {
                    // remove all pending approvals for this level
                    jdbcTemplate.update("""
                        DELETE FROM pending_approvals WHERE appr_id=? AND node_id IN
                        (SELECT id FROM node_data WHERE level_data_id=?)
                    """, approvalId, levelId);
                    jdbcTemplate.update("UPDATE level_data SET status='rejected' WHERE id=?", levelId);
                    jdbcTemplate.update("UPDATE approval_rounds SET status='rejected' WHERE id=?", approvalId);
                }
            }
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }

    private void fireNextLevel(Integer approvalId, Integer currentLevelId) {
        // get current level number
        Integer currentLevelNumber = jdbcTemplate.queryForObject(
            "SELECT level FROM level_data WHERE id=?",
            Integer.class, currentLevelId
        );

        // get next level
        Map<String, Object> nextLevel = null;
        try {
            nextLevel = jdbcTemplate.queryForMap("""
                SELECT id, type FROM level_data WHERE appr_id=? AND level=?
            """, approvalId, currentLevelNumber + 1);
        } catch (Exception e) {
            // no next level exists
        }

        if (nextLevel == null) {
            // all levels complete, set approval as approved
            jdbcTemplate.update(
                "UPDATE approval_rounds SET status='approved' WHERE id=?",
                approvalId
            );
        } else {
            Integer nextLevelId = (Integer) nextLevel.get("id");
            String nextLevelType = (String) nextLevel.get("type");

            if (nextLevelType.equals("series")) {
                // add only first node to pending_approvals
                jdbcTemplate.update("""
                    INSERT INTO pending_approvals (appr_id, user_id, node_id)
                    SELECT ?, user_id, id FROM node_data
                    WHERE level_data_id=? ORDER BY id LIMIT 1
                """, approvalId, nextLevelId);
            } else {
                // parallel_any or parallel_all - add all nodes
                jdbcTemplate.update("""
                    INSERT INTO pending_approvals (appr_id, user_id, node_id)
                    SELECT ?, user_id, id FROM node_data WHERE level_data_id=?
                """, approvalId, nextLevelId);
            }
        }
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
