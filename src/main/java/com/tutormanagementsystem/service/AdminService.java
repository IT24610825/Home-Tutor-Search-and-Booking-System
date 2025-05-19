package com.tutormanagementsystem.service;

import com.tutormanagementsystem.model.Admin;
import com.tutormanagementsystem.dto.AdminRegistrationDto;
import com.tutormanagementsystem.dto.AdminLoginDto;
import com.tutormanagementsystem.dto.DashboardStatsDto;
import com.tutormanagementsystem.dto.AdminProfileUpdateDto;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private static final String ADMIN_FILE = "data/admins.txt";
    private static final String ACTIVITY_FILE = "data/admin_activity.txt";

    public AdminService() {
        initializeDataFiles();
    }

    private void initializeDataFiles() {
        try {
            Files.createDirectories(Paths.get("data"));
            if (!Files.exists(Paths.get(ADMIN_FILE))) {
                Files.createFile(Paths.get(ADMIN_FILE));
            }
            if (!Files.exists(Paths.get(ACTIVITY_FILE))) {
                Files.createFile(Paths.get(ACTIVITY_FILE));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public Admin registerAdmin(AdminRegistrationDto registrationDto) {
        // Validate if username or email already exists
        if (isUsernameTaken(registrationDto.getUsername()) || isEmailTaken(registrationDto.getEmail())) {
            throw new RuntimeException("Username or email already exists");
        }

        Admin admin = new Admin();
        admin.setId(UUID.randomUUID().toString());
        admin.setFullName(registrationDto.getFullName());
        admin.setEmail(registrationDto.getEmail());
        admin.setUsername(registrationDto.getUsername());
        admin.setPassword(registrationDto.getPassword()); // In production, hash the password
        admin.setRole(registrationDto.getRole());
        admin.setCreatedAt(LocalDateTime.now().toString());

        saveAdmin(admin);
        logActivity("New admin registered: " + admin.getUsername(), "REGISTRATION");

        return admin;
    }

    public Admin loginAdmin(AdminLoginDto loginDto) {
        try {
            List<String> lines = Files.readAllLines(Paths.get(ADMIN_FILE));
            for (String line : lines) {
                Admin admin = Admin.fromString(line);
                if (admin.getUsername().equals(loginDto.getUsername()) && 
                    admin.getPassword().equals(loginDto.getPassword())) {
                    logActivity("Admin logged in: " + admin.getUsername(), "LOGIN");
                    return admin;
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        
        try {
            // Count users from users.txt
            if (Files.exists(Paths.get("data/users.txt"))) {
                stats.setTotalUsers((int) Files.lines(Paths.get("data/users.txt")).count());
            }

            // Count tutors from tutors.txt
            if (Files.exists(Paths.get("data/tutors.txt"))) {
                stats.setTotalTutors((int) Files.lines(Paths.get("data/tutors.txt")).count());
            }

            // Count bookings from bookings.txt
            if (Files.exists(Paths.get("data/bookings.txt"))) {
                stats.setTotalBookings((int) Files.lines(Paths.get("data/bookings.txt")).count());
            }

            // Calculate total revenue from payments.txt
            if (Files.exists(Paths.get("data/payments.txt"))) {
                double totalRevenue = Files.lines(Paths.get("data/payments.txt"))
                    .map(line -> line.split(","))
                    .mapToDouble(parts -> Double.parseDouble(parts[2])) // Assuming amount is at index 2
                    .sum();
                stats.setTotalRevenue(totalRevenue);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return stats;
    }

    public List<Map<String, String>> getRecentActivity() {
        List<Map<String, String>> activities = new ArrayList<>();
        try {
            List<String> lines = Files.readAllLines(Paths.get(ACTIVITY_FILE));
            Collections.reverse(lines); // Most recent first
            
            return lines.stream()
                .limit(10) // Only return last 10 activities
                .map(line -> {
                    String[] parts = line.split(",");
                    Map<String, String> activity = new HashMap<>();
                    activity.put("timestamp", parts[0]);
                    activity.put("description", parts[1]);
                    activity.put("type", parts[2]);
                    return activity;
                })
                .collect(Collectors.toList());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return activities;
    }

    private void saveAdmin(Admin admin) {
        try {
            Files.write(
                Paths.get(ADMIN_FILE),
                (admin.toString() + System.lineSeparator()).getBytes(),
                StandardOpenOption.APPEND
            );
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void logActivity(String description, String type) {
        String activity = LocalDateTime.now() + "," + description + "," + type + System.lineSeparator();
        try {
            Files.write(
                Paths.get(ACTIVITY_FILE),
                activity.getBytes(),
                StandardOpenOption.APPEND
            );
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private boolean isUsernameTaken(String username) {
        try {
            return Files.lines(Paths.get(ADMIN_FILE))
                .map(Admin::fromString)
                .anyMatch(admin -> admin.getUsername().equals(username));
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    private boolean isEmailTaken(String email, String excludeId) {
        try {
            return Files.lines(Paths.get(ADMIN_FILE))
                .map(Admin::fromString)
                .anyMatch(admin -> admin.getEmail().equals(email) && !admin.getId().equals(excludeId));
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    private boolean isEmailTaken(String email) {
        return isEmailTaken(email, null);
    }

    public Admin updateAdminProfile(AdminProfileUpdateDto updateDto) {
        try {
            List<String> lines = Files.readAllLines(Paths.get(ADMIN_FILE));
            List<Admin> admins = lines.stream()
                .map(Admin::fromString)
                .collect(Collectors.toList());

            // Find the admin to update (in a real application, get the admin ID from the security context)
            Admin adminToUpdate = admins.stream()
                .filter(admin -> admin.getEmail().equals(updateDto.getEmail()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Admin not found"));

            // Check if new email is already taken by another admin
            if (!updateDto.getEmail().equals(adminToUpdate.getEmail()) && 
                isEmailTaken(updateDto.getEmail(), adminToUpdate.getId())) {
                throw new RuntimeException("Email already in use");
            }

            // Update admin details
            adminToUpdate.setFullName(updateDto.getFullName());
            adminToUpdate.setEmail(updateDto.getEmail());
            if (updateDto.getPassword() != null && !updateDto.getPassword().isEmpty()) {
                adminToUpdate.setPassword(updateDto.getPassword()); // In production, hash the password
            }

            // Save all admins back to file
            String updatedContent = admins.stream()
                .map(Admin::toString)
                .collect(Collectors.joining(System.lineSeparator()));
            Files.write(Paths.get(ADMIN_FILE), updatedContent.getBytes());

            logActivity("Admin profile updated: " + adminToUpdate.getUsername(), "PROFILE_UPDATE");

            return adminToUpdate;
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to update admin profile");
        }
    }
}
