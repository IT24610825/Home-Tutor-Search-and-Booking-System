package com.tutormanagementsystem.service;

import com.tutormanagementsystem.model.TutorProfile;
import org.springframework.stereotype.Service;
import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TutorProfileService {
    private static final String TUTORS_FILE = "tutors.txt";

    public TutorProfile createProfile(TutorProfile profile) {
        List<TutorProfile> profiles = getAllProfiles();
        profiles.add(profile);
        saveProfiles(profiles);
        return profile;
    }

    public List<TutorProfile> getAllProfiles() {
        List<TutorProfile> profiles = new ArrayList<>();
        File file = new File(TUTORS_FILE);
        
        if (!file.exists()) {
            return profiles;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                try {
                    profiles.add(TutorProfile.fromCsvString(line));
                } catch (IllegalArgumentException e) {
                    // Skip invalid lines
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return profiles;
    }

    public Optional<TutorProfile> getProfileByTutorId(String tutorId) {
        return getAllProfiles().stream()
                .filter(profile -> profile.getTutorId().equals(tutorId))
                .findFirst();
    }

    public List<TutorProfile> searchProfiles(String subject, String location) {
        return getAllProfiles().stream()
                .filter(profile -> 
                    (subject == null || profile.getSubjects().stream()
                        .anyMatch(s -> s.toLowerCase().contains(subject.toLowerCase()))) &&
                    (location == null || profile.getLocation().toLowerCase()
                        .contains(location.toLowerCase()))
                )
                .collect(Collectors.toList());
    }

    public void updateProfile(TutorProfile updatedProfile) {
        List<TutorProfile> profiles = getAllProfiles();
        for (int i = 0; i < profiles.size(); i++) {
            if (profiles.get(i).getTutorId().equals(updatedProfile.getTutorId())) {
                profiles.set(i, updatedProfile);
                break;
            }
        }
        saveProfiles(profiles);
    }

    public void deleteProfile(String tutorId) {
        List<TutorProfile> profiles = getAllProfiles();
        profiles.removeIf(profile -> profile.getTutorId().equals(tutorId));
        saveProfiles(profiles);
    }

    private void saveProfiles(List<TutorProfile> profiles) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(TUTORS_FILE))) {
            for (TutorProfile profile : profiles) {
                writer.println(profile.toCsvString());
            }
        } catch (IOException e) {
            throw new RuntimeException("Error saving tutor profiles", e);
        }
    }
}
