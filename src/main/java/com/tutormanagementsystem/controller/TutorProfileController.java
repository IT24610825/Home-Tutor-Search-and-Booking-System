package com.tutormanagementsystem.controller;

import com.tutormanagementsystem.model.TutorProfile;
import com.tutormanagementsystem.service.TutorProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tutor-profiles")
@CrossOrigin(origins = "http://localhost:63342")
public class TutorProfileController {

    @Autowired
    private TutorProfileService tutorProfileService;

    @PostMapping
    public ResponseEntity<TutorProfile> createProfile(@RequestBody TutorProfile profile) {
        return ResponseEntity.ok(tutorProfileService.createProfile(profile));
    }

    @GetMapping("/{tutorId}")
    public ResponseEntity<TutorProfile> getProfile(@PathVariable String tutorId) {
        return tutorProfileService.getProfileByTutorId(tutorId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<TutorProfile>> searchProfiles(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(tutorProfileService.searchProfiles(subject, location));
    }

    @GetMapping
    public ResponseEntity<List<TutorProfile>> getAllProfiles() {
        return ResponseEntity.ok(tutorProfileService.getAllProfiles());
    }

    @PutMapping("/{tutorId}")
    public ResponseEntity<Void> updateProfile(
            @PathVariable String tutorId,
            @RequestBody TutorProfile profile) {
        if (!tutorId.equals(profile.getTutorId())) {
            return ResponseEntity.badRequest().build();
        }
        tutorProfileService.updateProfile(profile);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{tutorId}")
    public ResponseEntity<Void> deleteProfile(@PathVariable String tutorId) {
        tutorProfileService.deleteProfile(tutorId);
        return ResponseEntity.ok().build();
    }
}
