package com.example.springboot.controller;

import org.springframework.web.bind.annotation.RestController;

import com.example.springboot.service.RoundService;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users/{userId}/workspace/{workspaceId}/rounds")
public class RoundController {
    private final RoundService roundService;

    @GetMapping
    public List<Map<String, Object>> getApprovalRounds(@PathVariable Integer userId, @PathVariable Integer workspaceId) {
        return roundService.getApprovalRounds(userId, workspaceId);
    }

    @GetMapping("/{approvalId}")
    public Map<String, Object> getApprovalRound(@PathVariable Integer userId, @PathVariable Integer workspaceId, @PathVariable Integer approvalId) {
        return roundService.getApprovalRound(userId, workspaceId, approvalId);
    }
    
    @PostMapping
    public ResponseEntity<Void> createApprovalRound(@PathVariable Integer userId, @PathVariable Integer workspaceId, @RequestBody Map<String, Object> data) {
        roundService.createApprovalRound(userId, workspaceId, data);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
