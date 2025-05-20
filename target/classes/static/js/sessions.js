// Function to load all booking sessions
async function loadBookingSessions() {
    try {
        const response = await fetch('http://localhost:8080/api/bookings/all');
        const bookings = await response.json();
        displayBookings(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
        alert('Failed to load booking sessions. Please try again later.');
    }
}

// Function to display bookings in the table
function displayBookings(bookings) {
    const tableBody = document.getElementById('sessionsTableBody');
    tableBody.innerHTML = '';

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.studentName}</td>
            <td>${booking.bookingId}</td>
            <td>${booking.tutorId}</td>
            <td>${booking.dateTime}</td>
            <td><span class="badge bg-${getStatusBadgeColor(booking.status)}">${booking.status}</span></td>
            <td>
                ${getActionButtons(booking)}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Helper function to get appropriate badge color based on status
function getStatusBadgeColor(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'warning';
        case 'confirmed':
            return 'success';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Helper function to generate action buttons based on booking status
function getActionButtons(booking) {
    const status = booking.status.toLowerCase();
    if (status === 'pending') {
        const confirmedBooking = {...booking, status: 'confirmed'};
        const cancelledBooking = {...booking, status: 'cancelled'};
        return `
            <button class="btn btn-sm btn-success me-1" onclick='updateBookingStatus("${booking.bookingId}", ${JSON.stringify(confirmedBooking)})'>
                Confirm
            </button>
            <button class="btn btn-sm btn-danger" onclick='updateBookingStatus("${booking.bookingId}", ${JSON.stringify(cancelledBooking)})'>
                Cancel
            </button>
        `;
    }
    return '';
}

// Function to update booking status
async function updateBookingStatus(bookingId, booking) {
    try {
        const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(booking)
        });

        if (response.ok) {
            // Reload the bookings after successful update
            loadBookingSessions();
        } else {
            throw new Error('Failed to update booking status');
        }
    } catch (error) {
        console.error('Error updating booking status:', error);
        alert('Failed to update booking status. Please try again later.');
    }
}

// Function to handle logout
function logout() {
    // Clear any stored session/token
    localStorage.removeItem('token');
    // Redirect to login page
    window.location.href = 'index.html';
}

// Load booking sessions when the page loads
document.addEventListener('DOMContentLoaded', loadBookingSessions);
