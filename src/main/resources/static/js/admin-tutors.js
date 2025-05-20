// Load Tutors Grid
function loadTutors() {
    fetch('http://localhost:8080/api/tutor-profiles')
    .then(response => response.json())
    .then(data => {
        const tutorGrid = document.getElementById('tutorGrid');
        const emptyState = document.getElementById('tutorEmptyState');
        
        if (!data || data.length === 0) {
            tutorGrid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tutorGrid.innerHTML = '';

        data.forEach(tutor => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            col.innerHTML = `
                <div class="card tutor-card h-100 animate-fade-in-up">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="tutor-avatar">
                                <i class="bi bi-person-circle fs-1"></i>
                            </div>
                        </div>
                        <h5 class="card-title mb-1">${tutor.name}</h5>
                        <p class="text-muted small mb-2">${tutor.specialization}</p>
                        <div class="tutor-info mb-3">
                            <div class="info-item">
                                <i class="bi bi-geo-alt me-2"></i>
                                ${tutor.location}
                            </div>
                            <div class="info-item">
                                <i class="bi bi-clock me-2"></i>
                                ${tutor.availability}
                            </div>
                            <div class="info-item">
                                <i class="bi bi-book me-2"></i>
                                ${tutor.subjects.join(', ')}
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="experience">
                                <i class="bi bi-briefcase me-2"></i>
                                <span>${tutor.yearsOfExperience} years</span>
                            </div>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-light" onclick="editTutor('${tutor.tutorId}')">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-light text-danger" onclick="deleteTutor('${tutor.tutorId}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            tutorGrid.appendChild(col);
        });
    })
    .catch(error => {
        console.error('Error loading tutors:', error);
        document.getElementById('tutorEmptyState').style.display = 'block';
    });
}

// Add new tutor
function addTutor() {
    const form = document.getElementById('addTutorForm');
    const formData = new FormData(form);
    const tutorData = {
        tutorId: 'TUT' + Date.now(),
        name: formData.get('name'),
        location: formData.get('location'),
        subjects: formData.get('subjects').split(',').map(s => s.trim()),
        yearsOfExperience: parseInt(formData.get('yearsOfExperience')),
        availability: formData.get('availability'),
        specialization: formData.get('specialization')
    };

    fetch('http://localhost:8080/api/tutor-profiles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tutorData)
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            bootstrap.Modal.getInstance(document.getElementById('addTutorModal')).hide();
            loadTutors();
            form.reset();
        } else {
            alert('Failed to add tutor');
        }
    })
    .catch(error => {
        console.error('Error adding tutor:', error);
        alert('Failed to add tutor');
    });
}

// Edit tutor
function editTutor(tutorId) {
    // Implementation for editing tutor
    console.log('Edit tutor:', tutorId);
}

// Delete tutor
function deleteTutor(tutorId) {
    if (!confirm('Are you sure you want to delete this tutor?')) {
        return;
    }

    fetch(`http://localhost:8080/api/tutor-profiles/${tutorId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            loadTutors();
        } else {
            alert('Failed to delete tutor');
        }
    })
    .catch(error => {
        console.error('Error deleting tutor:', error);
        alert('Failed to delete tutor');
    });
}

// Search tutors
const searchInput = document.getElementById('searchTutors');
let searchTimeout;

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            searchTutors(searchTerm);
        } else {
            loadTutors();
        }
    }, 300);
});

function searchTutors(term) {
    fetch(`http://localhost:8080/api/tutor-profiles/search?subject=${encodeURIComponent(term)}`)
    .then(response => response.json())
    .then(data => {
        const tutorGrid = document.getElementById('tutorGrid');
        tutorGrid.innerHTML = '';
        
        if (!data || data.length === 0) {
            document.getElementById('tutorEmptyState').style.display = 'block';
            return;
        }
        
        document.getElementById('tutorEmptyState').style.display = 'none';
        data.forEach(tutor => {
            // Same tutor card creation as in loadTutors
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            // ... rest of the card creation code
            tutorGrid.appendChild(col);
        });
    })
    .catch(error => console.error('Error searching tutors:', error));
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadTutors();
});
