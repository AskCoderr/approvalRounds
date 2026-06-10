package com.example.springboot.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.springboot.service.WorkspaceService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users/{userId}/workspace")
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    @GetMapping
    public List<Map<String, Object>> getWorkspaces(@PathVariable Long userId) {
        return workspaceService.getWorkspaces(userId);
    }
    

    @PostMapping
    public ResponseEntity<Void> createWorkspace(@PathVariable Long userId, @RequestBody Map<String, Object> createWorkspaceData) {
        workspaceService.createWorkspace(userId, createWorkspaceData);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PatchMapping("/{workspaceId}/name/{name}")
    public ResponseEntity<Void> updateWorkspaceName(@PathVariable Long userId, @PathVariable Long workspaceId, @PathVariable String name) {
        workspaceService.updateWorkspaceName(userId, workspaceId, name);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
