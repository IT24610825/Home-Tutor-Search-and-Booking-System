package com.tutormanagementsystem.controller;

import com.tutormanagementsystem.model.Booking;
import com.tutormanagementsystem.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        try {
            return ResponseEntity.ok(bookingService.createBooking(booking));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Booking>> getStudentBookings(@PathVariable String studentId) {
        return ResponseEntity.ok(bookingService.getBookingsByStudent(studentId));
    }

    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<Booking>> getTutorBookings(@PathVariable String tutorId) {
        return ResponseEntity.ok(bookingService.getBookingsByTutor(tutorId));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Booking>> getUpcomingBookings(
            @RequestParam String userId,
            @RequestParam String role) {
        return ResponseEntity.ok(bookingService.getUpcomingBookings(userId, role));
    }

    @GetMapping("/past")
    public ResponseEntity<List<Booking>> getPastBookings(
            @RequestParam String userId,
            @RequestParam String role) {
        return ResponseEntity.ok(bookingService.getPastBookings(userId, role));
    }

    @PutMapping("/{bookingId}")
    public ResponseEntity<Void> updateBooking(
            @PathVariable String bookingId,
            @RequestBody Booking booking) {
        if (!bookingId.equals(booking.getBookingId())) {
            return ResponseEntity.badRequest().build();
        }
        try {
            bookingService.updateBooking(booking);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String bookingId) {
        bookingService.deleteBooking(bookingId);
        return ResponseEntity.ok().build();
    }
}
