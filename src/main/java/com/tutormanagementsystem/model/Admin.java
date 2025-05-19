package com.tutormanagementsystem.model;

public class Admin {
    private String id;
    private String fullName;
    private String email;
    private String username;
    private String password;
    private String role;
    private String createdAt;

    public Admin() {
    }

    public Admin(String id, String fullName, String email, String username, String password, String role, String createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.username = username;
        this.password = password;
        this.role = role;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return id + "," + fullName + "," + email + "," + username + "," + password + "," + role + "," + createdAt;
    }

    public static Admin fromString(String line) {
        String[] parts = line.split(",");
        return new Admin(
            parts[0], // id
            parts[1], // fullName
            parts[2], // email
            parts[3], // username
            parts[4], // password
            parts[5], // role
            parts[6]  // createdAt
        );
    }
}
