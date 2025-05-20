// Admin Authentication
function registerAdmin(event) {
    event.preventDefault();

    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        role: document.getElementById('adminRole').value
    };

    if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return false;
    }

    fetch('http://localhost:8080/api/admin/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Admin registered successfully!');
            window.location.href = 'admin-login.html';
        } else {
            alert(data.message || 'Registration failed!');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Registration failed! Please try again.');
    });

    return false;
}

function loginAdmin(event) {
    event.preventDefault();

    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        rememberMe: document.getElementById('rememberMe').checked
    };

    fetch('http://localhost:8080/api/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminData', JSON.stringify(data.admin));
            window.location.href = 'admin-dashboard.html';
        } else {
            alert(data.message || 'Login failed!');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Login failed! Please try again.');
    });

    return false;
}

function logoutAdmin() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    window.location.href = 'admin-login.html';
}

// Dashboard Functions
function loadDashboardStats() {
    fetch('http://localhost:8080/api/admin/dashboard/stats', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('totalUsers').textContent = data.totalUsers;
        document.getElementById('totalTutors').textContent = data.totalTutors;
        document.getElementById('totalBookings').textContent = data.totalBookings;
        document.getElementById('totalRevenue').textContent = '$' + data.totalRevenue;
    })
    .catch(error => console.error('Error loading stats:', error));
}

function loadRecentActivity() {
    fetch('http://localhost:8080/api/admin/dashboard/activity', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
        }
    })
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('activityTableBody');
        tbody.innerHTML = '';

        data.activities.forEach(activity => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${activity.description}</td>
                <td>${activity.user}</td>
                <td>${activity.type}</td>
                <td>${formatDate(activity.timestamp)}</td>
                <td>
                    <span class="badge bg-${getStatusColor(activity.status)}">
                        ${activity.status}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(error => console.error('Error loading activity:', error));
}

// Utility Functions
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function getStatusColor(status) {
    const colors = {
        'completed': 'success',
        'pending': 'warning',
        'failed': 'danger',
        'in_progress': 'info'
    };
    return colors[status.toLowerCase()] || 'secondary';
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.bi-eye');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.replace('bi-eye-slash', 'bi-eye');
    }
}

// Load Tutors Grid
function loadTutors(filter = 'all') {
    fetch('http://localhost:8080/api/tutor-profiles', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
        }
    })
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

        data.filter(tutor => filter === 'all')
            .forEach(tutor => {
                const col = document.createElement('div');
                col.className = 'col-md-6 col-lg-4';
                col.innerHTML = `
                    <div class="card tutor-card h-100 animate-fade-in-up">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div class="tutor-avatar">
                                    <i class="bi bi-person-circle fs-1"></i>
                                </div>
                                <span class="badge bg-${tutor.active ? 'success' : 'danger'}">
                                    ${tutor.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <h5 class="card-title mb-1">${tutor.name}</h5>
                            <p class="text-muted small mb-2">${tutor.subject}</p>
                            <div class="tutor-info mb-3">
                                <div class="info-item">
                                    <i class="bi bi-geo-alt me-2"></i>
                                    ${tutor.location}
                                </div>
                                <div class="info-item">
                                    <i class="bi bi-clock me-2"></i>
                                    ${tutor.availability || 'N/A'}
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
                                    <button class="btn btn-sm btn-light" onclick="viewTutorDetails('${tutor.id}')">
                                        <i class="bi bi-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-light" onclick="editTutor('${tutor.id}')">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-light" onclick="toggleTutorStatus('${tutor.id}')">
                                        <i class="bi bi-${tutor.active ? 'pause' : 'play'}"></i>
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

function filterTutors(filter) {
    loadTutors(filter);
}

function searchTutors(term) {
    fetch(`http://localhost:8080/api/tutor-profiles/search?subject=${encodeURIComponent(term)}`, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
        }
    })
    .then(response => response.json())
    .then(data => {
        const tutorGrid = document.getElementById('tutorGrid');
        tutorGrid.innerHTML = '';
        // Use the same rendering logic as loadTutors
        if (data.tutors && data.tutors.length > 0) {
            data.tutors.forEach(tutor => {
                // Same tutor card creation as in loadTutors
            });
        } else {
            document.getElementById('tutorEmptyState').style.display = 'block';
        }
    })
    .catch(error => console.error('Error searching tutors:', error));
}

// Update Admin Profile
function updateAdminProfile() {
    const formData = {
        fullName: document.getElementById('adminFullName').value,
        email: document.getElementById('adminEmail').value,
        password: document.getElementById('adminPassword').value,
        confirmPassword: document.getElementById('adminConfirmPassword').value
    };

    if (formData.password && formData.password !== formData.confirmPassword) {
        alert('New passwords do not match!');
        return;
    }

    // If password fields are empty, remove them from the request
    if (!formData.password) {
        delete formData.password;
        delete formData.confirmPassword;
    }

    fetch('http://localhost:8080/api/admin/profile/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update stored admin data
            const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
            adminData.fullName = formData.fullName;
            adminData.email = formData.email;
            localStorage.setItem('adminData', JSON.stringify(adminData));

            // Update displayed name
            document.getElementById('adminName').textContent = formData.fullName;

            // Close modal and show success message
            const modal = bootstrap.Modal.getInstance(document.getElementById('updateProfileModal'));
            modal.hide();
            alert('Profile updated successfully!');
        } else {
            alert(data.message || 'Failed to update profile!');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to update profile! Please try again.');
    });
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the dashboard page
    if (window.location.pathname.includes('admin-dashboard.html')) {
        // Check authentication
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            window.location.href = 'admin-login.html';
            return;
        }

        // Load admin data
        const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
        document.getElementById('adminName').textContent = adminData.fullName || 'Admin';

        // Populate profile form when modal is shown
        const updateProfileModal = document.getElementById('updateProfileModal');
        if (updateProfileModal) {
            updateProfileModal.addEventListener('show.bs.modal', function() {
                document.getElementById('adminFullName').value = adminData.fullName || '';
                document.getElementById('adminEmail').value = adminData.email || '';
                // Clear password fields for security
                document.getElementById('adminPassword').value = '';
                document.getElementById('adminConfirmPassword').value = '';
            });
        }

        // Load dashboard data
        loadDashboardStats();
        loadRecentActivity();
        loadTutors();

        // Setup tutor search
        const searchInput = document.getElementById('searchTutors');
        let searchTimeout;

        if (searchInput) {
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
        }
    }
});
