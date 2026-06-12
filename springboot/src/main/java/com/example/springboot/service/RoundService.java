package com.example.springboot.service;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.springboot.exception.ForbiddenException;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class RoundService {
    private final JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> getApprovalRounds(Integer userId, Integer workspaceId) {
        Boolean isAdmin = jdbcTemplate.queryForObject("""
            select exists (select 1 from roles where user_id=? and workspace_id=? and role_name='admin')
                """, Boolean.class, userId, workspaceId);
        if (isAdmin) {
            return jdbcTemplate.queryForList("""
                select ar.id, ar.title as name,
                case when ar.user_id=? then 'You' else u.first_name || ' ' || u.last_name end as author,
                ar.status, DATE(ar.created_at) as created_at from approval_rounds as ar
                inner join users as u on ar.user_id = u.id where ar.workspace_id=?
                    """, userId, workspaceId);
        } else {
            return jdbcTemplate.queryForList("""
                select id, title as name, 'You' as author, status, DATE(created_at) as created_at
                from approval_rounds where workspace_id=? and user_id=?
                    """, workspaceId, userId);
        }
    }

    public Map<String, Object> getApprovalRound(Integer userId, Integer workspaceId, Integer approvalId) {
        Boolean isAdmin = jdbcTemplate.queryForObject("""
            select exists (select 1 from roles where user_id=? and workspace_id=? and role_name='admin')
                """, Boolean.class, userId, workspaceId);
        Boolean isCreator = jdbcTemplate.queryForObject("""
            select exists (select 1 from approval_rounds where id=? and user_id=?)
                """, Boolean.class, approvalId, userId);
        if (isAdmin || isCreator) {
            List<Map<String, Object>> levels = jdbcTemplate.queryForList("""
                select id, status, type from level_data where appr_id=? order by level
            """, approvalId);
            for (Map<String, Object> level: levels) {
                List<Map<String, Object>> nodes = jdbcTemplate.queryForList("""
                    select nd.id, u.first_name || ' ' || u.last_name as user_name, u.first_name,
                    u.email as user_mail, nd.status from node_data as nd inner join
                    users as u on nd.user_id = u.id where nd.level_data_id=?
                """, (Integer) level.get("id"));
                level.put("nodes", nodes);
            }
            Map<String, Object> response = jdbcTemplate.queryForMap("""
                select id, title from approval_rounds where id=?
            """, approvalId);
            response.put("levels", levels);
            return response;
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }

    @Transactional
    public void createApprovalRound(Integer userId, Integer workspaceId, Map<String, Object> data) {
        // insert title subject body and get the approval id
        // loop through levels => level {
        //      create level connect it with approval id and put data and get level id
        //      insert new nodes connecting with the new formed level id
        // }

        Boolean isAdmin = jdbcTemplate.queryForObject("""
            select exists (select 1 from roles where user_id=? and workspace_id=? and role_name='admin')
                """, Boolean.class, userId, workspaceId);
        Boolean isApprovalCreator = jdbcTemplate.queryForObject("""
            select exists (select 1 from roles where user_id=? and workspace_id=? and role_name='approvalCreator')
                """, Boolean.class, userId, workspaceId);

        if (isAdmin || isApprovalCreator) {
            Integer approvalId = jdbcTemplate.queryForObject("""
                insert into approval_rounds (user_id, workspace_id, title, subject, body)
                values (?, ?, ?, ?, ?) returning id
                    """, Integer.class, userId, workspaceId, (String) data.get("title"), (String) data.get("subject"), (String) data.get("body"));
                
            List<Map<String, Object>> files = (List<Map<String, Object>>) data.get("files");
            if (files != null) {
                for (Map<String, Object> file : files) {
                    jdbcTemplate.update("""
                        insert into files (appr_id, file_url, original_name) values (?, ?, ?)
                    """, approvalId, (String) file.get("url"), (String) file.get("name"));
                }
            }

            int count = 1;
            for (Map<String, Object> level: (List<Map<String, Object>>) data.get("levels")) {
                Integer levelId = jdbcTemplate.queryForObject("""
                    insert into level_data (appr_id, level, type) values (?, ?, ?::level_type) returning id
                    """, Integer.class, approvalId, count, (String) level.get("type"));
                String[] emails = ((String) level.get("members")).split("\\s*,\\s*");
                int nodeCount = 1;
                for (String email: emails) {
                    jdbcTemplate.update("""
                        insert into node_data (level_data_id, node_order, user_id)
                        values (?, ?, (select id from users where email=?))
                    """, levelId, nodeCount, email);
                    nodeCount++;
                }
                count++;
                }

            // get first level
            Map<String, Object> firstLevel = jdbcTemplate.queryForMap("""
                select id, type from level_data where appr_id=? and level=1
            """, approvalId);

            Integer firstLevelId = (Integer) firstLevel.get("id");
            String firstLevelType = (String) firstLevel.get("type");

            if (firstLevelType.equals("series")) {
                // add only first node
                jdbcTemplate.update("""
                    insert into pending_approvals (appr_id, user_id, node_id)
                    select ?, user_id, id from node_data
                    where level_data_id=? order by node_order limit 1
                """, approvalId, firstLevelId);
            } else {
                // parallel_any or parallel_all — add all nodes
                jdbcTemplate.update("""
                    insert into pending_approvals (appr_id, user_id, node_id)
                    select ?, user_id, id from node_data where level_data_id=?
                """, approvalId, firstLevelId);
            }
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }
}
