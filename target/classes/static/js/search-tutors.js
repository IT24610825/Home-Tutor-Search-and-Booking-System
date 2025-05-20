const API_URL = 'http://localhost:8080/api';
let selectedTutor = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = JSON.parse(userStr);
    if (currentUser.role !== 'STUDENT') {
        window.location.href = 'index.html';
        return;
    }

    // Set up search form handler
    document.getElementById('searchForm').addEventListener('submit', (e) => {
        e.preventDefault();
        searchTutors();
    });

    // Load all tutors initially
    searchTutors();
});

async function searchTutors() {
    const subject = document.getElementById('subject').value;
    const location = document.getElementById('location').value;
    
    try {
        const queryParams = new URLSearchParams();
        if (subject) queryParams.append('subject', subject);
        if (location) queryParams.append('location', location);
        
        const response = await fetch(`${API_URL}/tutor-profiles/search?${queryParams}`);
        if (response.ok) {
            const tutors = await response.json();
            displaySearchResults(tutors);
        } else {
            showError('Failed to fetch tutors');
        }
    } catch (error) {
        console.error('Error searching tutors:', error);
        showError('Error searching tutors');
    }
}

function displaySearchResults(tutors) {
    const resultsDiv = document.getElementById('searchResults');
    
    if (tutors.length === 0) {
        resultsDiv.innerHTML = '<div class="alert alert-info">No tutors found matching your criteria.</div>';
        return;
    }

    resultsDiv.innerHTML = `
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            ${tutors.map(tutor => `
                <div class="col">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${tutor.name}</h5>
                            <p class="card-text">
                                <strong>Location:</strong> ${tutor.location}<br>
                                <strong>Subjects:</strong> ${tutor.subjects.join(', ')}<br>
                                <strong>Experience:</strong> ${tutor.yearsOfExperience} years
                            </p>
                            <button class="btn btn-primary" onclick="showTutorDetails(${JSON.stringify(tutor)})">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>`;
}

function showTutorDetails(tutor) {
    selectedTutor = tutor;
    const modalContent = document.getElementById('tutorDetailsContent');
    modalContent.innerHTML = `
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">
                    <h4>${tutor.name}</h4>
                    <hr>
                    <p><strong>Location:</strong> ${tutor.location}</p>
                    <p><strong>Subjects:</strong> ${tutor.subjects.join(', ')}</p>
                    <p><strong>Years of Experience:</strong> ${tutor.yearsOfExperience}</p>
                    <p><strong>Specialization:</strong> ${tutor.specialization}</p>
                    <div class="mt-3">
                        <h5>Weekly Availability</h5>
                        <pre class="bg-light p-3 rounded">${tutor.availability}</pre>
                    </div>
                </div>
            </div>
        </div>`;
    
    const modal = new bootstrap.Modal(document.getElementById('tutorDetailsModal'));
    modal.show();
}

function showBookingModal() {
    // Close the tutor details modal
    const detailsModal = bootstrap.Modal.getInstance(document.getElementById('tutorDetailsModal'));
    detailsModal.hide();

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').min = today;

    // Show the booking modal
    const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
    bookingModal.show();
}

async function createBooking() {
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    
    if (!date || !time) {
        alert('Please select both date and time');
        return;
    }

    const dateTime = new Date(date + 'T' + time);
    
    const booking = {
        studentId: currentUser.id,
        tutorId: selectedTutor.tutorId,
        dateTime: dateTime.toISOString(),
        studentName: currentUser.username,
        tutorName: selectedTutor.name,
        status: 'PENDING'
    };

    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(booking)
        });

        if (response.ok) {
            alert('Booking created successfully!');
            const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
            modal.hide();
        } else {
            const error = await response.text();
            alert('Failed to create booking: ' + error);
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        alert('Error creating booking');
    }
}

function showError(message) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
