package com.tutormanagementsystem.model;

import java.time.LocalDateTime;

public class Payment {
    private String id;
    private String bookingId;
    private String studentId;
    private String tutorId;
    private double amount;
    private String status; // PENDING, PAID, REFUNDED
    private String paymentMethod;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isActive;

    // Default constructor
    public Payment() {
        this.isActive = true;
        this.status = "PENDING";
    }

    // Constructor with fields
    public Payment(String bookingId, String studentId, String tutorId, double amount) {
        this.id = java.util.UUID.randomUUID().toString();
        this.bookingId = bookingId;
        this.studentId = studentId;
        this.tutorId = tutorId;
        this.amount = amount;
        this.status = "PENDING";
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getTutorId() { return tutorId; }
    public void setTutorId(String tutorId) { this.tutorId = tutorId; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    // Convert to CSV string
    public String toCsvString() {
        return String.join(",",
            id,
            bookingId,
            studentId,
            tutorId,
            String.valueOf(amount),
            status,
            paymentMethod != null ? paymentMethod : "",
            createdAt.toString(),
            updatedAt.toString(),
            String.valueOf(isActive)
        );
    }

    // Create from CSV string
    public static Payment fromCsvString(String csvLine) {
        String[] parts = csvLine.split(",");
        Payment payment = new Payment();
        payment.setId(parts[0]);
        payment.setBookingId(parts[1]);
        payment.setStudentId(parts[2]);
        payment.setTutorId(parts[3]);
        payment.setAmount(Double.parseDouble(parts[4]));
        payment.setStatus(parts[5]);
        payment.setPaymentMethod(parts[6].isEmpty() ? null : parts[6]);
        payment.setCreatedAt(LocalDateTime.parse(parts[7]));
        payment.setUpdatedAt(LocalDateTime.parse(parts[8]));
        payment.setActive(Boolean.parseBoolean(parts[9]));
        return payment;
    }
}
