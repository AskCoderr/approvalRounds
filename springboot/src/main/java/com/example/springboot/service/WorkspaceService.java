package com.example.springboot.service;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> getWorkspaces(Long userId) {
        return jdbcTemplate.queryForList(
            """
        with workspace_mapping as
        (select w.name, w.id from (select DISTINCT workspace_id from roles where user_id=?) as wid
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
}
