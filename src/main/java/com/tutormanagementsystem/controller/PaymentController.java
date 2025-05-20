package com.tutormanagementsystem.controller;

import com.tutormanagementsystem.model.Payment;
import com.tutormanagementsystem.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController() {
        this.paymentService = new PaymentService();
    }

    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody Payment payment) {
        try {
            Payment createdPayment = paymentService.createPayment(payment);
            return ResponseEntity.ok(createdPayment);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to create payment: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllPayments() {
        try {
            List<Payment> payments = paymentService.getAllPayments();
            return ResponseEntity.ok(payments);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to get payments: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable String id) {
        try {
            return paymentService.getPaymentById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to get payment: " + e.getMessage());
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getPaymentsByStudentId(@PathVariable String studentId) {
        try {
            List<Payment> payments = paymentService.getPaymentsByStudentId(studentId);
            return ResponseEntity.ok(payments);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to get student payments: " + e.getMessage());
        }
    }

    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<?> getPaymentsByTutorId(@PathVariable String tutorId) {
        try {
            List<Payment> payments = paymentService.getPaymentsByTutorId(tutorId);
            return ResponseEntity.ok(payments);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to get tutor payments: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePayment(@PathVariable String id, @RequestBody Payment payment) {
        try {
            if (null!=payment){
                payment.setCreatedAt(LocalDateTime.now());
            }
            Payment updatedPayment = paymentService.updatePayment(id, payment);
            return ResponseEntity.ok(updatedPayment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to update payment: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivatePayment(@PathVariable String id) {
        try {
            paymentService.deactivatePayment(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to deactivate payment: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePayment(@PathVariable String id) {
        try {
            paymentService.deletePayment(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to delete payment: " + e.getMessage());
        }
    }
}
