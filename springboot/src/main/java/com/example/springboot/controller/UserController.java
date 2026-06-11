package com.example.springboot.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.springboot.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    @PostMapping("/create-user")
    public ResponseEntity<Void> createUser(@RequestBody Map<String, Object> body) {
        userService.createUser(body);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
 
    @GetMapping("{email}/id")
    public Integer getId(@PathVariable String email) {
        return userService.getId(email);
    }
}
