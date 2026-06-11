package com.example.springboot.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.springboot.exception.ForbiddenException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> getWorkspaces(Long userId) {
        return jdbcTemplate.queryForList(
            """
        with workspace_mapping as
        (select w.name, w.id from (select workspace_id from roles where user_id=? and role_name='member') as wid
        inner join workspaces as w on wid.workspace_id=w.id), 
        approval_mapping as 
        (select ar.workspace_id from (select * from pending_approvals where user_id=?) as apprid 
        inner join approval_rounds as ar on apprid.appr_id = ar.id)
        select workspace_mapping.name as title, count(approval_mapping.workspace_id) as pending, workspace_mapping.id
        from workspace_mapping left join approval_mapping
        on workspace_mapping.id = approval_mapping.workspace_id
        group by workspace_mapping.id, workspace_mapping.name;
            """,
        userId, userId);
    }

    @Transactional
    public void createWorkspace(Long userId, Map<String, Object> createWorkspaceData) {
        // create workspace and get id
        Long workspaceId = jdbcTemplate.queryForObject("insert into workspaces (name) values (?) returning id", Long.class, createWorkspaceData.get("workspaceName"));
        
        // add member and admin privileges to creator
        jdbcTemplate.update("insert into roles (user_id, workspace_id, role_name) values (?, ?, 'member')", userId, workspaceId);
        jdbcTemplate.update("insert into roles (user_id, workspace_id, role_name) values (?, ?, 'admin')", userId, workspaceId);
        
        // assign member privileges to each email if it exists
        String[] emails = ((String) createWorkspaceData.get("members")).split(",");
        jdbcTemplate.update("insert into roles (user_id, workspace_id, role_name) select id, ?, 'member' from users where email=ANY(?)", workspaceId, emails);
    }

    public void updateWorkspaceName(Long userId, Long workspaceId, String name) {
        // check whether user has admin role_name in workspace, 
            // if not send forbiddenException 
            // otherwise update workspace name
        if (jdbcTemplate.queryForObject("select exists (select 1 from roles where user_id=? and workspace_id=? and role_name='admin')", Boolean.class, userId, workspaceId)) {
            jdbcTemplate.update("update workspaces set name=? where id=?", name, workspaceId);
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }

    public void deleteWorkspace(Long userId, Long workspaceId) {
        if (jdbcTemplate.queryForObject("select exists (select 1 from roles where user_id=? and workspace_id=? and role_name='admin')", Boolean.class, userId, workspaceId)) {
            jdbcTemplate.update("delete from workspaces where id=?", workspaceId);
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }

    public List<Map<String, Object>> getRedundantFiles(Long userId, Long workspaceId) {
        if (jdbcTemplate.queryForObject("select exists (select 1 from roles where user_id=? and workspace_id=? and role_name='admin')", Boolean.class, userId, workspaceId)) {
            return jdbcTemplate.queryForList("""
                select f.file_url from approval_rounds as ar inner join files as f on ar.id = f.appr_id where ar.workspace_id=?;
            """, workspaceId);
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }

    public List<String> getRoles(Long userId, Long workspaceId) {
        List<Map<String, Object>> roles = jdbcTemplate.queryForList("""
            select role_name from roles where workspace_id=? and user_id=?
                """, workspaceId, userId);

        List<String> formattedRoles = new ArrayList<>();
        for (Map<String, Object> role: roles) {
            formattedRoles.add((String) role.get("role_name"));
        }
        return formattedRoles;
    }
}
