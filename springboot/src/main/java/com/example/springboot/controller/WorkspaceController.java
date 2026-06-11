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
import org.springframework.web.bind.annotation.DeleteMapping;
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
    public void updateWorkspaceName(@PathVariable Long userId, @PathVariable Long workspaceId, @PathVariable String name) {
        workspaceService.updateWorkspaceName(userId, workspaceId, name);
    }

    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> deleteWorkspace(@PathVariable Long userId, @PathVariable Long workspaceId) {
        workspaceService.deleteWorkspace(userId, workspaceId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/{workspaceId}/files")
    public List<Map<String, Object>> getRedundantFiles(@PathVariable Long userId, @PathVariable Long workspaceId) {
        return workspaceService.getRedundantFiles(userId, workspaceId);
    }

    @GetMapping("/{workspaceId}/pending-approvals")
    public List<Map<String, Object>> getPendingApprovals(@PathVariable Long userId, @PathVariable Long workspaceId) {
        return workspaceService.getPendingApprovals(userId, workspaceId);
    }
    
    @GetMapping("/{workspaceId}/roles")
    public List<String> getRoles(@PathVariable Long userId, @PathVariable Long workspaceId) {
        return workspaceService.getRoles(userId, workspaceId);
    }
    
}
