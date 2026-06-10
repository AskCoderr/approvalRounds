package com.example.springboot.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.springboot.service.WorkspaceService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users/{userId}/workspace")
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    @GetMapping
    public List<Map<String, Object>> getWorkspaces(@PathVariable Long userId) {
        return workspaceService.getWorkspaces(userId);
    }
    

    // @PostMapping
    // public ResponseEntity<Void> createWorkspace (@PathVariable int userId, @RequestBody Map<String, Object> createWorkspaceData) {
        
    // }
}
