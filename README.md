# Tutor Management System

A Spring Boot application for managing tutors and students. The application uses file-based storage (users.txt) to maintain user data.

## Features

- User Registration (Students and Tutors)
- User Login
- Profile Management
- View Available Tutors (for Students)
- View Registered Students (for Tutors)
- Basic CRUD operations for user management

## Prerequisites

- Java 21
- Maven 3.6+

## Running the Application

1. Clone the repository
2. Navigate to the project directory
3. Build the project:
   ```bash
   mvn clean install
   ```
4. Run the application:
   ```bash
   mvn spring-boot:run
   ```
5. Access the application at: http://localhost:8080

## Project Structure

- `src/main/java/com/tutormanagementsystem`
  - `model/` - Contains User, Student, and Tutor classes
  - `service/` - Contains UserService for business logic
  - `controller/` - Contains REST endpoints
  - `config/` - Contains Security configuration
- `src/main/resources`
  - `static/` - Contains frontend files (HTML, CSS, JavaScript)
  - `application.properties` - Application configuration

## Storage

The application uses a text file (`users.txt`) to store user data. The file is automatically created in the project root directory when the first user is registered.

## Security

The application uses Spring Security for basic security configuration. All endpoints are currently accessible without authentication for demonstration purposes.
