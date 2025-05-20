// Load Bookings
function loadBookings(filter = 'all') {
    fetch('http://localhost:8080/api/bookings/all')
    .then(response => response.json())
    .then(data => {
        const bookingsTableBody = document.getElementById('bookingsTableBody');
        bookingsTableBody.innerHTML = '';

        if (!data || data.length === 0) {
            bookingsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="bi bi-calendar2-x fs-1 text-muted"></i>
                        <p class="text-muted mt-2">No bookings found</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Update stats
        updateBookingStats(data);

        // Filter bookings if needed
        const filteredBookings = filter === 'all' 
            ? data 
            : data.filter(booking => booking.status.toLowerCase() === filter.toLowerCase());

        filteredBookings.forEach(booking => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${booking.bookingId}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="user-avatar me-2">
                            <i class="bi bi-person-circle"></i>
                        </div>
                        ${booking.studentName}
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="user-avatar me-2">
                            <i class="bi bi-person-workspace"></i>
                        </div>
                        ${booking.tutorName}
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-calendar2-event me-2"></i>
                        ${formatDateTime(booking.dateTime)}
                    </div>
                </td>
                <td>
                    <span class="badge bg-${getStatusColor(booking.status)}">
                        ${booking.status}
                    </span>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-light" onclick="updateBookingStatus('${booking.bookingId}', 'CONFIRMED')" 
                                ${booking.status === 'CONFIRMED' ? 'disabled' : ''}>
                            <i class="bi bi-check-circle"></i>
                        </button>
                        <button class="btn btn-sm btn-light" onclick="updateBookingStatus('${booking.bookingId}', 'CANCELED')"
                                ${booking.status === 'CANCELED' ? 'disabled' : ''}>
                            <i class="bi bi-x-circle"></i>
                        </button>
                        <button class="btn btn-sm btn-light text-danger" onclick="deleteBooking('${booking.bookingId}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            bookingsTableBody.appendChild(tr);
        });
    })
    .catch(error => {
        console.error('Error loading bookings:', error);
        document.getElementById('bookingsTableBody').innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="bi bi-exclamation-circle fs-1 text-danger"></i>
                    <p class="text-danger mt-2">Error loading bookings</p>
                </td>
            </tr>
        `;
    });
}

// Update booking stats
function updateBookingStats(bookings) {
    const stats = bookings.reduce((acc, booking) => {
        acc.total++;
        acc[booking.status.toLowerCase()]++;
        return acc;
    }, { total: 0, confirmed: 0, pending: 0, canceled: 0 });

    document.getElementById('totalBookings').textContent = stats.total;
    document.getElementById('confirmedBookings').textContent = stats.confirmed;
    document.getElementById('pendingBookings').textContent = stats.pending;
    document.getElementById('canceledBookings').textContent = stats.canceled;
}

// Add new booking
function addBooking() {
    const form = document.getElementById('addBookingForm');
    const formData = new FormData(form);
    
    const bookingData = {
        bookingId: 'BK' + Date.now(),
        studentId: formData.get('studentId'),
        tutorId: formData.get('tutorId'),
        dateTime: formData.get('dateTime'),
        status: 'PENDING',
        studentName: formData.get('studentName'),
        tutorName: formData.get('tutorName')
    };

    fetch('http://localhost:8080/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            bootstrap.Modal.getInstance(document.getElementById('addBookingModal')).hide();
            loadBookings();
            form.reset();
        } else {
            alert('Failed to add booking');
        }
    })
    .catch(error => {
        console.error('Error adding booking:', error);
        alert('Failed to add booking');
    });
}

// Update booking status
function updateBookingStatus(bookingId, newStatus) {
    fetch(`http://localhost:8080/api/bookings/${bookingId}`)
    .then(response => response.json())
    .then(booking => {
        booking.status = newStatus;
        return fetch(`http://localhost:8080/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(booking)
        });
    })
    .then(response => {
        if (response.ok) {
            loadBookings();
        } else {
            alert('Failed to update booking status');
        }
    })
    .catch(error => {
        console.error('Error updating booking:', error);
        alert('Failed to update booking status');
    });
}

// Delete booking
function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) {
        return;
    }

    fetch(`http://localhost:8080/api/bookings/${bookingId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            loadBookings();
        } else {
            alert('Failed to delete booking');
        }
    })
    .catch(error => {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking');
    });
}

// Filter bookings
function filterBookings(status) {
    loadBookings(status);
}

// Helper functions
function formatDateTime(dateTimeStr) {
    const dateTime = new Date(dateTimeStr);
    return dateTime.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusColor(status) {
    switch (status.toUpperCase()) {
        case 'CONFIRMED':
            return 'success';
        case 'PENDING':
            return 'warning';
        case 'CANCELED':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Search bookings
const searchInput = document.getElementById('searchBookings');
let searchTimeout;

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        // Client-side search in existing bookings
        const rows = document.querySelectorAll('#bookingsTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }, 300);
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadBookings();
});
