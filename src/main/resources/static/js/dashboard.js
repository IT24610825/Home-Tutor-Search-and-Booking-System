const API_URL = 'http://localhost:8080/api';
let currentUser = null;

// Load user data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = JSON.parse(userStr);
    loadProfile();
    if (currentUser.role === 'STUDENT') {
        loadTutors();
    } else {
        loadStudents();
    }
});

function loadProfile() {
    const profileInfo = document.getElementById('profileInfo');
    let html = `
        <p><strong>Username:</strong> ${currentUser.username}</p>
        <p><strong>Contact:</strong> ${currentUser.contact}</p>
    `;
    
    if (currentUser.role === 'TUTOR') {
        html += `<p><strong>Qualifications:</strong> ${currentUser.qualifications}</p>`;
    }
    
    profileInfo.innerHTML = html;
}

async function loadTutors() {
    try {
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();
        const tutors = users.filter(user => user.role === 'TUTOR');
        
        const tutorsList = document.getElementById('tutorsList');
        tutorsList.innerHTML = tutors.map(tutor => `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">${tutor.username}</h5>
                    <p class="card-text"><strong>Contact:</strong> ${tutor.contact}</p>
                    <p class="card-text"><strong>Qualifications:</strong> ${tutor.qualifications}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading tutors:', error);
    }
}

async function loadStudents() {
    try {
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();
        const students = users.filter(user => user.role === 'STUDENT');
        
        const studentsList = document.getElementById('studentsList');
        studentsList.innerHTML = students.map(student => `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">${student.username}</h5>
                    <p class="card-text"><strong>Contact:</strong> ${student.contact}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

function showEditProfile() {
    const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    document.getElementById('editContact').value = currentUser.contact;

    const qualificationsField = document.getElementById('qualificationsField');
    if (currentUser.role === 'TUTOR') {
        qualificationsField.style.display = 'block';
        document.getElementById('editQualifications').value = currentUser.qualifications || '';
    } else {
        qualificationsField.style.display = 'none';
    }

    modal.show();
}

async function loadAllTheBookings() {
    console.log(currentUser)

    try {
        if (!currentUser || !currentUser.id) {
            console.error('No user data available');
            return;
        }

        console.log('Loading bookings for user:', currentUser.id);

        // Load past bookings
        const pastResponse = await fetch(`${API_URL}/bookings/past?userId=${currentUser.id}&role=STUDENT`);
        if (!pastResponse.ok) {
            throw new Error(`Failed to load past bookings: ${pastResponse.status}`);
        }
        const pastBookings = await pastResponse.json();
        console.log('Past bookings loaded:', pastBookings);
        return pastBookings;
    } catch (error) {
        console.error('Error loading bookings:', error);
        showError('Failed to load bookings. Please refresh the page.');
        return [];
    }



}



async function updateProfile() {
    const contact = document.getElementById('editContact').value;
    const password = document.getElementById('editPassword').value;
    const qualifications = currentUser.role === 'TUTOR' ? document.getElementById('editQualifications').value : null;

    const updatedUser = {
        ...currentUser,
        contact,
        ...(password && { password }),
        ...(qualifications && { qualifications })
    };

    try {
        const response = await fetch(`${API_URL}/users/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser)
        });

        if (response.ok) {
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            currentUser = updatedUser;
            loadProfile();
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            modal.hide();
            alert('Profile updated successfully!');
        } else {
            alert('Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
