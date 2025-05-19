package com.tutormanagementsystem.controller;

import com.tutormanagementsystem.model.Admin;
import com.tutormanagementsystem.service.AdminService;
import com.tutormanagementsystem.dto.AdminRegistrationDto;
import com.tutormanagementsystem.dto.AdminLoginDto;
import com.tutormanagementsystem.dto.DashboardStatsDto;
import com.tutormanagementsystem.dto.AdminProfileUpdateDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(@RequestBody AdminRegistrationDto registrationDto) {
        try {
            Admin admin = adminService.registerAdmin(registrationDto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Admin registered successfully");
            response.put("admin", admin);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(@RequestBody AdminLoginDto loginDto) {
        Admin admin = adminService.loginAdmin(loginDto);
        if (admin != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("admin", admin);
            response.put("token", generateToken(admin)); // In production, use proper JWT
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid credentials");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/dashboard/activity")
    public ResponseEntity<?> getRecentActivity() {
        Map<String, Object> response = new HashMap<>();
        response.put("activities", adminService.getRecentActivity());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(@RequestBody AdminProfileUpdateDto updateDto) {
        try {
            Admin updatedAdmin = adminService.updateAdminProfile(updateDto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("admin", updatedAdmin);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private String generateToken(Admin admin) {
        // In production, use proper JWT token generation
        return "admin-" + admin.getId() + "-" + System.currentTimeMillis();
    }
}
