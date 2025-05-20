package com.tutormanagementsystem.controller;

import com.tutormanagementsystem.model.Review;
import com.tutormanagementsystem.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        try {
            Review createdReview = reviewService.createReview(review);
            return ResponseEntity.ok(createdReview);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<Review>> getReviewsByTutor(@PathVariable String tutorId) {
        try {
            List<Review> reviews = reviewService.getReviewsByTutorId(tutorId);
            return ResponseEntity.ok(reviews);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Review>> getReviews() {
        try {
            List<Review> reviews = reviewService.getReviews();
            return ResponseEntity.ok(reviews);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Review>> getReviewsByStudent(@PathVariable String studentId) {
        try {
            List<Review> reviews = reviewService.getReviewsByStudentId(studentId);
            return ResponseEntity.ok(reviews);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<Review> updateReview(
            @PathVariable String reviewId,
            @RequestBody Review review) {
        try {
            Review updatedReview = reviewService.updateReview(reviewId, review);
            return ResponseEntity.ok(updatedReview);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable String reviewId) {
        try {
            reviewService.deleteReview(reviewId);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/verified")
    public ResponseEntity<List<Review>> getVerifiedReviews() {
        try {
            List<Review> reviews = reviewService.getVerifiedReviews();
            return ResponseEntity.ok(reviews);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/review/{reviewId}")
    public ResponseEntity<Review> getReviewsByReviewId(@PathVariable String reviewId) {
        try {
            Review reviews = reviewService.getReviewsByReviewId(reviewId);
            return ResponseEntity.ok(reviews);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/tutor/{tutorId}/rating")
    public ResponseEntity<Double> getTutorRating(@PathVariable String tutorId) {
        try {
            double rating = reviewService.getAverageTutorRating(tutorId);
            return ResponseEntity.ok(rating);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
