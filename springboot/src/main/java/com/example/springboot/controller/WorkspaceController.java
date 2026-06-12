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
    public List<Map<String, Object>> getWorkspaces(@PathVariable Integer userId) {
        return workspaceService.getWorkspaces(userId);
    }
    
    @PostMapping
    public ResponseEntity<Void> createWorkspace(@PathVariable Integer userId, @RequestBody Map<String, Object> createWorkspaceData) {
        workspaceService.createWorkspace(userId, createWorkspaceData);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PatchMapping("/{workspaceId}/name/{name}")
    public void updateWorkspaceName(@PathVariable Integer userId, @PathVariable Integer workspaceId, @PathVariable String name) {
        workspaceService.updateWorkspaceName(userId, workspaceId, name);
    }

    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> deleteWorkspace(@PathVariable Integer userId, @PathVariable Integer workspaceId) {
        workspaceService.deleteWorkspace(userId, workspaceId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/{workspaceId}/files")
    public List<Map<String, Object>> getRedundantFiles(@PathVariable Integer userId, @PathVariable Integer workspaceId) {
        return workspaceService.getRedundantFiles(userId, workspaceId);
    }
    
    @GetMapping("/{workspaceId}/roles")
    public List<String> getRoles(@PathVariable Integer userId, @PathVariable Integer workspaceId) {
        return workspaceService.getRoles(userId, workspaceId);
    }

    @GetMapping("/{workspaceId}/users")
    public List<Map<String, Object>> getUsers(@PathVariable Integer userId, @PathVariable Integer workspaceId) {
        return workspaceService.getUsers(userId, workspaceId);
    }

    @PostMapping("/{workspaceId}")
    public ResponseEntity<Void> addUsers(@PathVariable Integer userId, @PathVariable Integer workspaceId, @RequestBody Map<String, Object> body) {
        workspaceService.addUsers(userId, workspaceId, body);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{workspaceId}/users/{deleteUserId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer userId, @PathVariable Integer workspaceId, @PathVariable Integer deleteUserId) {
        workspaceService.deleteUser(userId, workspaceId, deleteUserId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/{workspaceId}/users/{deleteUserId}/files")
    public List<Map<String, Object>> getUserRedundantFiles(@PathVariable Integer userId, @PathVariable Integer workspaceId, @PathVariable Integer deleteUserId) {
        return workspaceService.getUserRedundantFiles(userId, workspaceId, deleteUserId);
    }

    @PostMapping("/{workspaceId}/users/{editUserId}/roles")
    public ResponseEntity<Void> updateRoles(@PathVariable Integer userId, @PathVariable Integer workspaceId, @PathVariable Integer editUserId, @RequestBody Map<String, Object> body) {
        workspaceService.updateRoles(userId, workspaceId, editUserId, body);
        return ResponseEntity.ok().build();
    }
}
