package com.tutormanagementsystem.service;

import com.tutormanagementsystem.model.User;
import com.tutormanagementsystem.model.Student;
import com.tutormanagementsystem.model.Tutor;
import org.springframework.stereotype.Service;
import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    private static final String USERS_FILE = "users.txt";
    private static final String DELIMITER = ",";

    public User createUser(User user) {
        user.setId(UUID.randomUUID().toString());
        List<User> users = getAllUsers();
        users.add(user);
        saveUsers(users);
        return user;
    }

    public Optional<User> getUserById(String id) {
        return getAllUsers().stream()
                .filter(user -> user.getId().equals(id))
                .findFirst();
    }

    public Optional<User> getUserByUsername(String username) {
        return getAllUsers().stream()
                .filter(user -> user.getUsername().equals(username))
                .findFirst();
    }

    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(USERS_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(DELIMITER);
                if (parts.length >= 5) {
                    User user;
                    if (parts[3].equals("STUDENT")) {
                        user = new Student(parts[0], parts[1], parts[2], parts[4]);
                    } else if (parts[3].equals("TUTOR")) {
                        String qualifications = parts.length > 5 ? parts[5] : "";
                        user = new Tutor(parts[0], parts[1], parts[2], parts[4], qualifications);
                    } else {
                        user = new User(parts[0], parts[1], parts[2], parts[3], parts[4]);
                    }
                    users.add(user);
                }
            }
        } catch (IOException e) {
            // File might not exist yet
        }
        return users;
    }

    public void updateUser(User user) {
        List<User> users = getAllUsers();
        for (int i = 0; i < users.size(); i++) {
            if (users.get(i).getId().equals(user.getId())) {
                users.set(i, user);
                break;
            }
        }
        saveUsers(users);
    }

    public void deleteUser(String id) {
        List<User> users = getAllUsers();
        users.removeIf(user -> user.getId().equals(id));
        saveUsers(users);
    }

    private void saveUsers(List<User> users) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(USERS_FILE))) {
            for (User user : users) {
                StringBuilder sb = new StringBuilder();
                sb.append(user.getId()).append(DELIMITER)
                  .append(user.getUsername()).append(DELIMITER)
                  .append(user.getPassword()).append(DELIMITER)
                  .append(user.getRole()).append(DELIMITER)
                  .append(user.getContact());
                
                if (user instanceof Tutor) {
                    sb.append(DELIMITER).append(((Tutor) user).getQualifications());
                }
                
                writer.println(sb.toString());
            }
        } catch (IOException e) {
            throw new RuntimeException("Error saving users", e);
        }
    }
}
