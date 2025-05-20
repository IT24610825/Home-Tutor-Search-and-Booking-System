const API_URL = 'http://localhost:8080/api';
let currentUser = null;



document.addEventListener('DOMContentLoaded', () => {
    loadBookings();
    loadTutors();
});

async function loadTutors() {
    try {
        const response = await fetch(`${API_URL}/tutor-profiles`);
        if (response.ok) {
            const tutors = await response.json();
            const tutorSelect = document.getElementById('tutorSelect');
            
            tutors.forEach(tutor => {
                const option = document.createElement('option');
                option.value = tutor.tutorId;
                option.textContent = `${tutor.name} - ${tutor.subjects.join(', ')}`;
                option.dataset.availability = tutor.availability;
                tutorSelect.appendChild(option);
            });

            // Add event listener for tutor selection
            tutorSelect.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const availabilityDiv = document.getElementById('tutorAvailability');
                const availabilityPre = availabilityDiv.querySelector('pre');

                if (this.value) {
                    availabilityDiv.classList.remove('d-none');
                    availabilityPre.textContent = selectedOption.dataset.availability;
                } else {
                    availabilityDiv.classList.add('d-none');
                }
            });
        }
    } catch (error) {
        console.error('Error loading tutors:', error);
    }
}



async function loadBookings() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(userStr);
    
    try {
        // Load upcoming bookings
        const upcomingResponse = await fetch(
            `${API_URL}/bookings/upcoming?userId=${user.id}&role=${user.role}`
        );
        const upcomingBookings = await upcomingResponse.json();
        displayUpcomingBookings(upcomingBookings);

        // Load past bookings
        const pastResponse = await fetch(
            `${API_URL}/bookings/past?userId=${user.id}&role=${user.role}`
        );
        const pastBookings = await pastResponse.json();
        displayPastBookings(pastBookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
        showError('Error loading bookings');
    }
}

function displayUpcomingBookings(bookings) {
    const container = document.getElementById('upcomingBookings');
    if (bookings.length === 0) {
        container.innerHTML = '<p class="text-muted">No upcoming sessions</p>';
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Tutor</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${bookings.map(booking => `
                        <tr>
                            <td>${booking.tutorName}</td>
                            <td>${new Date(booking.dateTime).toLocaleDateString()}</td>
                            <td>${new Date(booking.dateTime).toLocaleTimeString()}</td>
                            <td><span class="badge bg-${getStatusBadgeClass(booking.status)}">${booking.status}</span></td>
                            <td>
                                ${booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? `
                                    <button class="btn btn-sm btn-danger" onclick="cancelBooking('${booking.bookingId}')">
                                        Cancel
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}

function displayPastBookings(bookings) {
    const container = document.getElementById('pastBookings');
    if (bookings.length === 0) {
        container.innerHTML = '<p class="text-muted">No past sessions</p>';
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Tutor</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${bookings.map(booking => `
                        <tr>
                            <td>${booking.tutorName}</td>
                            <td>${new Date(booking.dateTime).toLocaleDateString()}</td>
                            <td>${new Date(booking.dateTime).toLocaleTimeString()}</td>
                            <td><span class="badge bg-${getStatusBadgeClass(booking.status)}">${booking.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'PENDING':
            return 'warning';
        case 'CONFIRMED':
            return 'success';
        case 'CANCELED':
            return 'danger';
        case 'COMPLETED':
            return 'info';
        default:
            return 'secondary';
    }
}

// Make cancelBooking available globally
window.cancelBooking = async function(bookingId) {
    if (!confirm('Are you sure you want to cancel this session?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bookingId: bookingId,
                status: 'CANCELED'
            })
        });

        if (response.ok) {
            alert('Session canceled successfully');
            loadBookings(); // Refresh the bookings display
        } else {
            alert('Failed to cancel session');
        }
    } catch (error) {
        console.error('Error canceling booking:', error);
        alert('Error canceling session');
    }
}

function showError(message) {
    const upcomingContainer = document.getElementById('upcomingBookings');
    const pastContainer = document.getElementById('pastBookings');
    upcomingContainer.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    pastContainer.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}
