package com.tutormanagementsystem.service;

import com.tutormanagementsystem.model.Review;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReviewService {
    private static final String REVIEWS_FILE = "reviews.txt";
    private final Path filePath;

    public ReviewService() {
        // Create reviews.txt in the project root directory
        this.filePath = Paths.get(REVIEWS_FILE);
        try {
            if (!Files.exists(filePath)) {
                Files.createFile(filePath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize reviews file", e);
        }
    }

    // Create a new review
    public Review createReview(Review review) throws IOException {
        review.setId(UUID.randomUUID().toString());
        List<Review> reviews = getAllReviews();
        reviews.add(review);
        saveAllReviews(reviews);
        return review;
    }

    // Get all reviews
    public List<Review> getAllReviews() throws IOException {
        if (Files.size(filePath) == 0) {
            return new ArrayList<>();
        }

        return Files.lines(filePath)
                .filter(line -> !line.trim().isEmpty())
                .map(Review::fromCsvString)
                .collect(Collectors.toList());
    }

    // Get reviews for a specific tutor
    public List<Review> getReviewsByTutorId(String tutorId) throws IOException {
        return getAllReviews().stream()
                .filter(review -> review.getTutorId().equals(tutorId))
                .collect(Collectors.toList());
    }

    public List<Review> getReviews() throws IOException {
        return getAllReviews();
    }

    // Get reviews by a specific student
    public List<Review> getReviewsByStudentId(String studentId) throws IOException {
        return getAllReviews().stream()
                .filter(review -> review.getStudentId().equals(studentId))
                .collect(Collectors.toList());
    }

    public Review getReviewsByReviewId(String reviewId) throws IOException {
        for (Review review : getAllReviews()) {
            if (review.getId().equals(reviewId)) {
                return review;
            }

        }
        return null;
    }

    // Update an existing review
    public Review updateReview(String reviewId, Review updatedReview) throws IOException {
        List<Review> reviews = getAllReviews();
        for (int i = 0; i < reviews.size(); i++) {
            if (reviews.get(i).getId().equals(reviewId)) {
                updatedReview.setId(reviewId);
                updatedReview.setUpdatedAt(java.time.LocalDateTime.now());
                reviews.set(i, updatedReview);
                saveAllReviews(reviews);
                return updatedReview;
            }
        }
        throw new NoSuchElementException("Review not found with id: " + reviewId);
    }

    // Delete a review
    public void deleteReview(String reviewId) throws IOException {
        List<Review> reviews = getAllReviews();
        if (reviews.removeIf(review -> review.getId().equals(reviewId))) {
            saveAllReviews(reviews);
        } else {
            throw new NoSuchElementException("Review not found with id: " + reviewId);
        }
    }

    // Save all reviews to file
    private void saveAllReviews(List<Review> reviews) throws IOException {
        String content = reviews.stream()
                .map(Review::toCsvString)
                .collect(Collectors.joining("\n"));
        Files.write(filePath, content.getBytes());
    }

    // Get average rating for a tutor
    public double getAverageTutorRating(String tutorId) throws IOException {
        return getReviewsByTutorId(tutorId).stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
    }

    // Get verified reviews only
    public List<Review> getVerifiedReviews() throws IOException {
        return getAllReviews().stream()
                .filter(Review::isVerified)
                .collect(Collectors.toList());
    }
}
