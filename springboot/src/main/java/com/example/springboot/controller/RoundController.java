package com.example.springboot.controller;

import org.springframework.web.bind.annotation.RestController;

import com.example.springboot.service.RoundService;

import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users/{userId}/workspace/{workspaceId}/round")
public class RoundController {
    private final RoundService roundService;
}
