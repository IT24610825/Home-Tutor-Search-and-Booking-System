package com.tutormanagementsystem.model;

import java.time.LocalDateTime;

public class Review {
    private String id;
    private String tutorId;
    private String studentId;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isVerified;
    private boolean isAnonymous;

    public Review() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTutorId() { return tutorId; }
    public void setTutorId(String tutorId) { this.tutorId = tutorId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }

    public boolean isAnonymous() { return isAnonymous; }
    public void setAnonymous(boolean anonymous) { isAnonymous = anonymous; }

    // Convert to CSV format for file storage
    public String toCsvString() {
        return String.join(",",
            id,
            tutorId,
            studentId,
            String.valueOf(rating),
            comment.replace(",", "\\,"),
            createdAt.toString(),
            updatedAt.toString(),
            String.valueOf(isVerified),
            String.valueOf(isAnonymous)
        );
    }

    // Create Review from CSV string
    public static Review fromCsvString(String csv) {
        String[] parts = csv.split(",(?=(?:[^\\\"]*\\\"[^\\\"]*\\\")*[^\\\"]*$)");
        Review review = new Review();
        review.setId(parts[0]);
        review.setTutorId(parts[1]);
        review.setStudentId(parts[2]);
        review.setRating(Integer.parseInt(parts[3]));
        review.setComment(parts[4].replace("\\,", ","));
        review.setCreatedAt(LocalDateTime.parse(parts[5]));
        review.setUpdatedAt(LocalDateTime.parse(parts[6]));
        review.setVerified(Boolean.parseBoolean(parts[7]));
        review.setAnonymous(Boolean.parseBoolean(parts[8]));
        return review;
    }
}
