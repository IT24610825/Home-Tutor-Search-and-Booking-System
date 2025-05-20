package com.tutormanagementsystem.model;

import lombok.Data;

@Data
public class User {
    private String id;
    private String username;
    private String password;
    private String role;
    private String contact;
    
    public User(String id, String username, String password, String role, String contact) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
        this.contact = contact;
    }
    
    // Default constructor
    public User() {}
}
