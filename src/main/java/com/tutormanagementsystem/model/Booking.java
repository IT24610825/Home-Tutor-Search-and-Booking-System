package com.tutormanagementsystem.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Booking {
    private String bookingId;
    private String studentId;
    private String tutorId;
    private LocalDateTime dateTime;
    private String status; // PENDING, CONFIRMED, CANCELED, COMPLETED
    private String studentName;
    private String tutorName;
    
    public Booking() {}
    
    public Booking(String bookingId, String studentId, String tutorId, 
                  LocalDateTime dateTime, String status, 
                  String studentName, String tutorName) {
        this.bookingId = bookingId;
        this.studentId = studentId;
        this.tutorId = tutorId;
        this.dateTime = dateTime;
        this.status = status;
        this.studentName = studentName;
        this.tutorName = tutorName;
    }
    
    public String toCsvString() {
        return String.format("%s,%s,%s,%s,%s,%s,%s",
            bookingId,
            studentId,
            tutorId,
            dateTime.toString(),
            status,
            studentName,
            tutorName
        );
    }
    
    public static Booking fromCsvString(String csvLine) {
        String[] parts = csvLine.split(",");
        if (parts.length >= 7) {
            return new Booking(
                parts[0],
                parts[1],
                parts[2],
                LocalDateTime.parse(parts[3]),
                parts[4],
                parts[5],
                parts[6]
            );
        }
        throw new IllegalArgumentException("Invalid CSV line format");
    }
}
