// Tutor Profile Management
let currentTutorProfile = null;

document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'TUTOR') {
            loadTutorProfile(user.id);
        }
    }
});

async function loadTutorProfile(tutorId) {
    try {
        const response = await fetch(`${API_URL}/tutor-profiles/${tutorId}`);
        if (response.ok) {
            currentTutorProfile = await response.json();
            displayTutorProfile();
        }
    } catch (error) {
        console.error('Error loading tutor profile:', error);
    }
}

function displayTutorProfile() {
    const profileInfo = document.getElementById('tutorProfileInfo');
    if (!profileInfo) return;

    if (currentTutorProfile) {
        profileInfo.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h6>Name: ${currentTutorProfile.name}</h6>
                    <p><strong>Location:</strong> ${currentTutorProfile.location}</p>
                    <p><strong>Subjects:</strong> ${currentTutorProfile.subjects.join(', ')}</p>
                    <p><strong>Experience:</strong> ${currentTutorProfile.yearsOfExperience} years</p>
                    <p><strong>Availability:</strong></p>
                    <pre>${currentTutorProfile.availability}</pre>
                    <p><strong>Specialization:</strong> ${currentTutorProfile.specialization}</p>
                    <button class="btn btn-primary" onclick="showTutorProfileModal(true)">Edit Profile</button>
                </div>
            </div>`;
    } else {
        profileInfo.innerHTML = `
            <p>No tutor profile found.</p>
            <button id="addProfileBtn" class="btn btn-success" onclick="showTutorProfileModal()">Add Tutor Profile</button>`;
    }
}

function showTutorProfileModal(isEdit = false) {
    const modal = new bootstrap.Modal(document.getElementById('tutorProfileModal'));
    const modalTitle = document.getElementById('tutorProfileModalTitle');
    modalTitle.textContent = isEdit ? 'Edit Tutor Profile' : 'Add Tutor Profile';

    if (isEdit && currentTutorProfile) {
        document.getElementById('tutorName').value = currentTutorProfile.name;
        document.getElementById('tutorLocation').value = currentTutorProfile.location;
        document.getElementById('tutorSubjects').value = currentTutorProfile.subjects.join(';');
        document.getElementById('tutorExperience').value = currentTutorProfile.yearsOfExperience;
        document.getElementById('tutorAvailability').value = currentTutorProfile.availability;
        document.getElementById('tutorSpecialization').value = currentTutorProfile.specialization;
    } else {
        document.getElementById('tutorProfileForm').reset();
    }

    modal.show();
}

async function saveTutorProfile() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const tutorProfile = {
        tutorId: user.id,
        name: document.getElementById('tutorName').value,
        location: document.getElementById('tutorLocation').value,
        subjects: document.getElementById('tutorSubjects').value.split(';').map(s => s.trim()),
        yearsOfExperience: parseInt(document.getElementById('tutorExperience').value),
        availability: document.getElementById('tutorAvailability').value,
        specialization: document.getElementById('tutorSpecialization').value
    };

    try {
        const url = `${API_URL}/tutor-profiles${currentTutorProfile ? '/' + user.id : ''}`;
        const method = currentTutorProfile ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tutorProfile)
        });

        if (response.ok) {
            currentTutorProfile = method === 'POST' ? await response.json() : tutorProfile;
            displayTutorProfile();
            const modal = bootstrap.Modal.getInstance(document.getElementById('tutorProfileModal'));
            modal.hide();
            alert('Tutor profile saved successfully!');
        } else {
            alert('Failed to save tutor profile');
        }
    } catch (error) {
        console.error('Error saving tutor profile:', error);
        alert('Error saving tutor profile');
    }
}
