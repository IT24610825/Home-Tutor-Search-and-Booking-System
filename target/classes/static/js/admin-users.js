// Load user statistics
function loadUserStats() {
    fetch('http://localhost:8080/api/users')
    .then(response => response.json())
    .then(users => {
        // Calculate stats from users array
        const stats = users.reduce((acc, user) => {
            if (user.isActive) acc.activeUsers++;
            else acc.inactiveUsers++;
            if (isToday(user.createdAt)) acc.newUsers++;
            return acc;
        }, { activeUsers: 0, inactiveUsers: 0, newUsers: 0 });

        document.getElementById('totalActiveUsers').textContent = stats.activeUsers;
        document.getElementById('newUsersToday').textContent = stats.newUsers;
        document.getElementById('inactiveUsers').textContent = stats.inactiveUsers;
    })
    .catch(error => console.error('Error loading user stats:', error));
}

// Load Users
function loadUsers() {
    fetch('http://localhost:8080/api/users')
    .then(response => response.json())
    .then(users => {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        if (!users || users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="bi bi-people fs-1 text-muted"></i>
                        <p class="text-muted mt-2">No users found</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Update stats
        updateUserStats(users);

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="form-check-input user-select" value="${user.id}">
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="user-avatar me-2">
                            <i class="bi bi-person-circle"></i>
                        </div>
                        ${user.username}
                    </div>
                </td>
                <td>${user.contact || 'N/A'}</td>
                <td>${formatDateTime(user.createdAt) || 'N/A'}</td>
                <td>
                    <span class="badge bg-${user.isActive ? 'success' : 'danger'}">
                        ${user.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-light" onclick="editUser('${user.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-light" onclick="toggleUserStatus('${user.id}', ${!user.active})">
                            <i class="bi bi-${user.active ? 'pause' : 'play'}"></i>
                        </button>
                        <button class="btn btn-sm btn-light text-danger" onclick="deleteUser('${user.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Initialize select all checkbox
        initializeSelectAll();
    })
    .catch(error => console.error('Error loading users:', error));
}

// Add new user
function addUser() {
    const form = document.getElementById('addUserForm');
    const formData = new FormData(form);
    
    const userData = {
        id: 'USER' + Date.now(),
        username: formData.get('fullName'),
        password: formData.get('password'),
        role: formData.get('userType').toUpperCase(),
        contact: formData.get('email'),
        isActive: true
    };

    fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
            loadUsers();
            form.reset();
        } else {
            alert('Failed to add user');
        }
    })
    .catch(error => {
        console.error('Error adding user:', error);
        alert('Failed to add user');
    });
}

// Edit user
function editUser(userId) {
    // Implementation for editing user
}

// Toggle user status
function toggleUserStatus(userId, newStatus) {
    fetch(`http://localhost:8080/api/users/${userId}`)
    .then(response => response.json())
    .then(user => {
        user.isActive = newStatus;
        
        return fetch(`http://localhost:8080/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });
    })
    .then(response => {
        if (response.ok) {
            loadUsers();
        } else {
            alert('Failed to update user status');
        }
    })
    .catch(error => {
        console.error('Error updating user:', error);
        alert('Failed to update user status');
    });
}

// Delete user
function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            loadUsers();
        } else {
            alert('Failed to delete user');
        }
    })
    .catch(error => {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
    });
}

// Update user stats
function updateUserStats(users) {
    const stats = users.reduce((acc, user) => {
        if (user.isActive) acc.active++;
        else acc.inactive++;
        if (isToday(user.createdAt)) acc.newToday++;
        return acc;
    }, { active: 0, inactive: 0, newToday: 0 });

    document.getElementById('totalActiveUsers').textContent = stats.active;
    document.getElementById('newUsersToday').textContent = stats.newToday;
    document.getElementById('inactiveUsers').textContent = stats.inactive;
}

// Helper functions
function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return 'N/A';
    const dateTime = new Date(dateTimeStr);
    return dateTime.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function isToday(dateTimeStr) {
    if (!dateTimeStr) return false;
    const date = new Date(dateTimeStr);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function initializeSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllUsers');
    const userCheckboxes = document.querySelectorAll('.user-select');

    selectAllCheckbox.addEventListener('change', function() {
        userCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });

    userCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const allChecked = Array.from(userCheckboxes).every(c => c.checked);
            selectAllCheckbox.checked = allChecked;
        });
    });
}

// Search users
const searchInput = document.getElementById('searchUsers');
let searchTimeout;

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        // Client-side search in existing users
        const rows = document.querySelectorAll('#usersTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }, 300);
});



// Select all users
document.getElementById('selectAllUsers').addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('.user-select');
    checkboxes.forEach(checkbox => checkbox.checked = this.checked);
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    loadUserStats();
});
