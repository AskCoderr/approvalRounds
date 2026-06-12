package com.example.springboot.service;

import java.sql.SQLException;
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

    public List<Map<String, Object>> getWorkspaces(Integer userId) {
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
    public void createWorkspace(Integer userId, Map<String, Object> createWorkspaceData) {
        // create workspace and get id
        Integer workspaceId = jdbcTemplate.queryForObject("insert into workspaces (name) values (?) returning id", Integer.class, createWorkspaceData.get("workspaceName"));
        
        // add member and admin privileges to creator
        jdbcTemplate.update("insert into roles (user_id, workspace_id, role_name) values (?, ?, 'member')", userId, workspaceId);
        jdbcTemplate.update("insert into roles (user_id, workspace_id, role_name) values (?, ?, 'admin')", userId, workspaceId);
        
        // assign member privileges to each email if it exists
        String[] emails = ((String) createWorkspaceData.get("members")).split("\\s*,\\s*");
        try {
            java.sql.Array emailArray = jdbcTemplate.getDataSource().getConnection().createArrayOf("text", emails);
            jdbcTemplate.update("insert into roles (user_id, workspace_id, role_name) select id, ?, 'member' from users where email=ANY(?)", workspaceId, emailArray);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to create email array", e);
        }
    }

    public void updateWorkspaceName(Integer userId, Integer workspaceId, String name) {
        // check whether user has admin role_name in workspace, 
            // if not send forbiddenException 
            // otherwise update workspace name
        if (jdbcTemplate.queryForObject("select exists (select 1 from roles where user_id=? and workspace_id=? and role_name='admin')", Boolean.class, userId, workspaceId)) {
            jdbcTemplate.update("update workspaces set name=? where id=?", name, workspaceId);
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }

    public void deleteWorkspace(Integer userId, Integer workspaceId) {
        if (jdbcTemplate.queryForObject("select exists (select 1 from roles where user_id=? and workspace_id=? and role_name='admin')", Boolean.class, userId, workspaceId)) {
            jdbcTemplate.update("delete from workspaces where id=?", workspaceId);
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }

    public List<Map<String, Object>> getRedundantFiles(Integer userId, Integer workspaceId) {
        if (jdbcTemplate.queryForObject("select exists (select 1 from roles where user_id=? and workspace_id=? and role_name='admin')", Boolean.class, userId, workspaceId)) {
            return jdbcTemplate.queryForList("""
                select f.file_url from approval_rounds as ar inner join files as f on ar.id = f.appr_id where ar.workspace_id=?;
            """, workspaceId);
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }

    public List<String> getRoles(Integer userId, Integer workspaceId) {
        List<Map<String, Object>> roles = jdbcTemplate.queryForList("""
            select role_name from roles where workspace_id=? and user_id=?
                """, workspaceId, userId);

        List<String> formattedRoles = new ArrayList<>();
        for (Map<String, Object> role: roles) {
            formattedRoles.add((String) role.get("role_name"));
        }
        return formattedRoles;
    }

    public List<Map<String, Object>> getUsers(Integer userId, Integer workspaceId) {
        Boolean hasAccess = jdbcTemplate.queryForObject("""
            select exists (select 1 from roles where user_id=? and workspace_id=?)
            """, Boolean.class, userId, workspaceId);

        if (hasAccess) {
            List<Map<String, Object>> response = jdbcTemplate.queryForList("""
                select u.id, u.first_name, u.first_name || ' ' || u.last_name as user_name, email from users as u
                inner join roles as r on u.id = r.user_id where r.workspace_id=?
            """, workspaceId);
            
            for (Map<String, Object> user: response) {
                List<String> roles = jdbcTemplate.queryForList("""
                    select role_name from roles where user_id=? and workspace_id=?
                """, String.class, (Integer) user.get("id"), workspaceId);
                user.put("roles", roles);
            }
            return response;
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }

    public void addUsers(Integer userId, Integer workspaceId, Map<String, Object> body) {
        Boolean permission = jdbcTemplate.queryForObject("""
            select exists (select 1 from roles where user_id=? and workspace_id=? and role_name in ('admin', 'addUser'))
                """, Boolean.class, userId, workspaceId);

        if (permission) {
            String[] emails = ((String) body.get("users")).split("\\s*,\\s*");
            try {
                java.sql.Array emailArray = jdbcTemplate.getDataSource().getConnection().createArrayOf("text", emails);
                jdbcTemplate.update("insert into roles (user_id, workspace_id, role_name) select id, ?, 'member' from users where email=ANY(?)", workspaceId, emailArray);
            } catch (SQLException e) {
                throw new RuntimeException("Failed to create email array", e);
            }
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }

    @Transactional
    public void deleteUser(Integer userId, Integer workspaceId, Integer deleteUserId) {
        Boolean permission = jdbcTemplate.queryForObject("""
            select exists (select 1 from roles where user_id=? and workspace_id=? and role_name in ('admin', 'removeUser'))
                """, Boolean.class, userId, workspaceId);

        if (permission) {
            jdbcTemplate.update("""
                delete from approval_rounds where user_id=? and workspace_id=?
                    """, deleteUserId, workspaceId);
            jdbcTemplate.update("""
                delete from roles where user_id=? and workspace_id=?
                    """, deleteUserId, workspaceId);
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }

    public List<Map<String, Object>> getUserRedundantFiles(Integer userId, Integer workspaceId, Integer deleteUserId) {
        Boolean permission = jdbcTemplate.queryForObject("""
            select exists (select 1 from roles where user_id=? and workspace_id=? and role_name in ('admin', 'removeUser'))
                """, Boolean.class, userId, workspaceId);
        if (permission) {
            return jdbcTemplate.queryForList("""
                select f.file_url from approval_rounds as ar inner join files as f on ar.id = f.appr_id where ar.workspace_id=? and ar.user_id=?;
            """, workspaceId, deleteUserId);
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }

    @Transactional
    public void updateRoles(Integer userId, Integer workspaceId, Integer editUserId, Map<String, Object> body) {
        Boolean permission = jdbcTemplate.queryForObject("""
            select (exists (select 1 from roles where user_id=? and workspace_id=? and role_name in ('admin', 'editRoles')))
            and (exists (select 1 from roles where user_id=? and workspace_id=?))
                """, Boolean.class, userId, workspaceId, editUserId, workspaceId);

        if (permission) {
            jdbcTemplate.update("""
                delete from roles where user_id=? and workspace_id=? and role_name != 'member'
                    """, editUserId, workspaceId);
            List<String> roles = (List<String>) body.get("roles");
            for (String role: roles) {
                jdbcTemplate.update("""
                    insert into roles (user_id, workspace_id, role_name) values (?, ?, ?)
                """, editUserId, workspaceId, role);
            }
        } else {
            throw new ForbiddenException("Access Denied");
        }
    }
}
