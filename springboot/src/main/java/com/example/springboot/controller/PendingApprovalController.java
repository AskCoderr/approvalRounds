package com.example.springboot.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.springboot.service.PendingApprovalService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users/{userId}/workspace/{workspaceId}/pending-approvals")
public class PendingApprovalController {
    private final PendingApprovalService pendingApprovalService;

    @GetMapping
    public List<Map<String, Object>> getPendingApprovals(@PathVariable Long userId, @PathVariable Long workspaceId) {
        return pendingApprovalService.getPendingApprovals(userId, workspaceId);
    }


    @GetMapping("/{approvalId}")
    public Map<String, Object> getPendingApproval(@PathVariable Long userId, @PathVariable Long workspaceId, @PathVariable Long approvalId) {
        return pendingApprovalService.getPendingApproval(userId, workspaceId, approvalId);
    }

    @PostMapping("/{approvalId}")
    public ResponseEntity<Void> approveRejectApproval(@PathVariable Long userId, @PathVariable Long workspaceId, @PathVariable Long approvalId) {
        // come back to this later
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @PostMapping("/{approvalId}/comments")
    public ResponseEntity<Void> createComment(@PathVariable Long userId, @PathVariable Long workspaceId, @PathVariable Long approvalId, @RequestBody Map<String, Object> commentData) {
        pendingApprovalService.createComment(userId, workspaceId, approvalId, commentData);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
