package com.tutormanagementsystem.service;

import com.tutormanagementsystem.model.Payment;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.time.LocalDateTime;

public class PaymentService {
    private static final String PAYMENTS_FILE = "payments.txt";

    // Create a new payment
    public Payment createPayment(Payment payment) throws IOException {
        payment.setId(UUID.randomUUID().toString());
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        payment.setActive(true);

        List<Payment> payments = getAllPayments();
        payments.add(payment);
        saveAllPayments(payments);
        return payment;
    }

    // Get all payments
    public List<Payment> getAllPayments() throws IOException {
        List<Payment> payments = new ArrayList<>();
        if (!Files.exists(Paths.get(PAYMENTS_FILE))) {
            return payments;
        }

        List<String> lines = Files.readAllLines(Paths.get(PAYMENTS_FILE));
        for (String line : lines) {
            if (!line.trim().isEmpty()) {
                payments.add(Payment.fromCsvString(line));
            }
        }
        return payments;
    }

    // Get payment by ID
    public Optional<Payment> getPaymentById(String id) throws IOException {
        return getAllPayments().stream()
                .filter(p -> p.getId().equals(id))
                .findFirst();
    }

    // Get payments by student ID
    public List<Payment> getPaymentsByStudentId(String studentId) throws IOException {

        return getAllPayments();

    }


    // Get payments by tutor ID
    public List<Payment> getPaymentsByTutorId(String tutorId) throws IOException {
        return getAllPayments().stream()
                .filter(p -> p.getTutorId().equals(tutorId) && p.isActive())
                .toList();
    }

    // Update payment
    public Payment updatePayment(String id, Payment updatedPayment) throws IOException {
        List<Payment> payments = getAllPayments();
        for (int i = 0; i < payments.size(); i++) {
            Payment payment = payments.get(i);
            if (payment.getId().equals(id)) {
                updatedPayment.setId(id);
                updatedPayment.setUpdatedAt(LocalDateTime.now());
                updatedPayment.setActive(true);
                updatedPayment.setPaymentMethod(payments.get(i).getPaymentMethod());
                updatedPayment.setAmount(payments.get(i).getAmount());
                updatedPayment.setStudentId(payments.get(i).getStudentId());
                payments.set(i, updatedPayment);
                saveAllPayments(payments);
                return updatedPayment;
            }
        }
        throw new IllegalArgumentException("Payment not found with id: " + id);
    }

    // Deactivate payment
    public void deactivatePayment(String id) throws IOException {
        List<Payment> payments = getAllPayments();
        for (Payment payment : payments) {
            if (payment.getId().equals(id)) {
                payment.setActive(false);
                payment.setUpdatedAt(LocalDateTime.now());
                saveAllPayments(payments);
                return;
            }
        }
        throw new IllegalArgumentException("Payment not found with id: " + id);
    }

    // Delete payment
    public void deletePayment(String id) throws IOException {
        List<Payment> payments = getAllPayments();
        if (payments.removeIf(p -> p.getId().equals(id))) {
            saveAllPayments(payments);
        } else {
            throw new IllegalArgumentException("Payment not found with id: " + id);
        }
    }

    // Save all payments to file
    private void saveAllPayments(List<Payment> payments) throws IOException {
        List<String> lines = new ArrayList<>();
        for (Payment payment : payments) {
            lines.add(payment.toCsvString());
        }
        Files.write(Paths.get(PAYMENTS_FILE), lines);
    }
}
