package com.example.springboot.service;

import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class UserService {
    private final JdbcTemplate jdbcTemplate;

    public void createUser(Map<String, Object> body) {
        jdbcTemplate.update("insert into users (email, first_name, last_name) values (?, ?, ?)", (String) body.get("email"), (String) body.get("firstName"), (String) body.get("lastName"));
    }

    public Long getId(String email) {
        Long id = jdbcTemplate.queryForObject("select id from users where email=?", Long.class ,email);
        return id;
    }
}
