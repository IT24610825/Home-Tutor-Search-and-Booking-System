package com.tutormanagementsystem.service;

import com.tutormanagementsystem.model.Booking;
import org.springframework.stereotype.Service;
import java.io.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {
    private static final String BOOKINGS_FILE = "bookings.txt";

    public Booking createBooking(Booking booking) {
        booking.setBookingId(UUID.randomUUID().toString());
        if (booking.getStatus() == null) {
            booking.setStatus("PENDING");
        }
        
        List<Booking> bookings = getAllBookings();
        
        // Check for time slot conflicts
        boolean hasConflict = bookings.stream()
            .filter(b -> b.getTutorId().equals(booking.getTutorId()))
            .filter(b -> !b.getStatus().equals("CANCELED"))
            .anyMatch(b -> isTimeSlotConflict(b.getDateTime(), booking.getDateTime()));
            
        if (hasConflict) {
            throw new RuntimeException("Selected time slot is not available");
        }
        
        bookings.add(booking);
        saveBookings(bookings);
        return booking;
    }

    public List<Booking> getAllBookings() {
        List<Booking> bookings = new ArrayList<>();
        File file = new File(BOOKINGS_FILE);
        
        if (!file.exists()) {
            return bookings;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                try {
                    bookings.add(Booking.fromCsvString(line));
                } catch (IllegalArgumentException e) {
                    // Skip invalid lines
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return bookings;
    }

    public List<Booking> getBookingsByStudent(String studentId) {
        return getAllBookings().stream()
                .filter(booking -> booking.getStudentId().equals(studentId))
                .collect(Collectors.toList());
    }

    public List<Booking> getBookingsByTutor(String tutorId) {
        return getAllBookings().stream()
                .filter(booking -> booking.getTutorId().equals(tutorId))
                .collect(Collectors.toList());
    }

    public List<Booking> getUpcomingBookings(String userId, String role) {
        LocalDateTime now = LocalDateTime.now();
        return getAllBookings().stream()
                .filter(booking -> 
                    (role.equals("STUDENT") && booking.getStudentId().equals(userId)) ||
                    (role.equals("TUTOR") && booking.getTutorId().equals(userId)))
                .filter(booking -> booking.getDateTime().isAfter(now))
                .filter(booking -> !booking.getStatus().equals("CANCELED"))
                .collect(Collectors.toList());
    }

    public List<Booking> getPastBookings(String userId, String role) {
        List<Booking> allBookings = getAllBookings();
        List<Booking> objects = new ArrayList<>();
        for (Booking booking : allBookings) {
            if (role.equals("STUDENT") && booking.getStudentId().equals(userId)) {
                objects.add(booking);
            }
        }
       return objects;
    }

    public void updateBooking(Booking updatedBooking) {
        List<Booking> bookings = getAllBookings();
        for (int i = 0; i < bookings.size(); i++) {
            if (bookings.get(i).getBookingId().equals(updatedBooking.getBookingId())) {
                // Check for conflicts if the time is being updated
                if (!bookings.get(i).getDateTime().equals(updatedBooking.getDateTime())) {
                    boolean hasConflict = bookings.stream()
                        .filter(b -> b.getTutorId().equals(updatedBooking.getTutorId()))
                        .filter(b -> !b.getStatus().equals("CANCELED"))
                        .filter(b -> !b.getBookingId().equals(updatedBooking.getBookingId()))
                        .anyMatch(b -> isTimeSlotConflict(b.getDateTime(), updatedBooking.getDateTime()));
                        
                    if (hasConflict) {
                        throw new RuntimeException("Selected time slot is not available");
                    }
                }
                bookings.set(i, updatedBooking);
                break;
            }
        }
        saveBookings(bookings);
    }

    public void deleteBooking(String bookingId) {
        List<Booking> bookings = getAllBookings();
        bookings.removeIf(booking -> booking.getBookingId().equals(bookingId));
        saveBookings(bookings);
    }

    private void saveBookings(List<Booking> bookings) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(BOOKINGS_FILE))) {
            for (Booking booking : bookings) {
                writer.println(booking.toCsvString());
            }
        } catch (IOException e) {
            throw new RuntimeException("Error saving bookings", e);
        }
    }

    private boolean isTimeSlotConflict(LocalDateTime time1, LocalDateTime time2) {
        // Consider a booking duration of 1 hour
        return Math.abs(time1.getHour() - time2.getHour()) < 1 &&
               time1.toLocalDate().equals(time2.toLocalDate());
    }
}
