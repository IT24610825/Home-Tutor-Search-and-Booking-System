// Global variables
const API_URL = 'http://localhost:8080/api';
let currentUser = null;

// Initialize dashboard
async function loadPaymentSummary() {
    try {
        const response = await fetch(`${API_URL}/payments/student/${currentUser.id}`);
        if (!response.ok) {
            throw new Error(`Failed to load payments: ${response.status}`);
        }
        const payments = await response.json();
        
        // Calculate totals
        let totalPaid = 0;
        let pendingAmount = 0;
        let nextPayment = null;
        
        payments.forEach(payment => {
            if (payment.status === 'PAID') {
                totalPaid += payment.amount;
            } else if (payment.status === 'PENDING') {
                pendingAmount += payment.amount;
                if (!nextPayment || new Date(payment.createdAt) < new Date(nextPayment.createdAt)) {
                    nextPayment = payment;
                }
            }
        });

        // Update dashboard
        document.getElementById('dashboardPendingPayments').textContent = `$${pendingAmount.toFixed(2)}`;
        document.getElementById('dashboardTotalPaid').textContent = `$${totalPaid.toFixed(2)}`;
        document.getElementById('dashboardNextPayment').textContent = nextPayment ? 
            `$${nextPayment.amount.toFixed(2)} due ${new Date(nextPayment.createdAt).toLocaleDateString()}` : 
            'No pending payments';

    } catch (error) {
        console.error('Error loading payment summary:', error);
        document.getElementById('dashboardPendingPayments').textContent = 'Error';
        document.getElementById('dashboardTotalPaid').textContent = 'Error';
        document.getElementById('dashboardNextPayment').textContent = 'Error';
    }
}

async function loadUserDetails() {
    try {
        const response = await fetch(`${API_URL}/users/${currentUser.id}`);
        if (response.ok) {
            const user = await response.json();
            const displayName = user.name || user.username || 'Student';
            const firstName = displayName.split(' ')[0];
            console.log(user)
            // Update welcome message
            document.getElementById('welcomeName').textContent = firstName;
            
            // Update profile details
            document.getElementById('userName').textContent = displayName;
           // document.getElementById('userEmail').textContent = user.email || 'Not set';
            document.getElementById('userPhone').textContent = user.contact || user.phone || 'Not set';
            
            // Update profile fields in edit modal
            document.getElementById('editName').value = displayName;
            document.getElementById('editEmail').value = user.email || '';
            document.getElementById('editPhone').value = user.contact || user.phone || '';
            
            return user;
        } else {
            console.error('Failed to load user details:', response.status);
            document.getElementById('welcomeName').textContent = 'Student';
            document.getElementById('userName').textContent = 'Error loading';
            document.getElementById('userEmail').textContent = 'Error loading';
            document.getElementById('userPhone').textContent = 'Error loading';
            throw new Error('Failed to load user details');
        }
    } catch (error) {
        console.error('Error loading user details:', error);
        throw error;
    }
}

async function initializeDashboard() {
    try {
        // Get current user from localStorage
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

        // Load user details
        await loadUserDetails();
        
        // Load dashboard stats
        await loadDashboardStats();
        
        // Load payment summary
        await loadPaymentSummary();
        
        // Load bookings after user details are loaded
        await loadBookings();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);

async function showBookingForm() {
    try {
        // Hide other cards and show booking form
        document.getElementById('tutorsCard').style.display = 'none';
        document.getElementById('pastSessionsCard').style.display = 'none';
        document.getElementById('bookingFormCard').style.display = 'block';

        // Load tutors
        const response = await fetch(`${API_URL}/tutor-profiles`);
        if (!response.ok) {
            throw new Error(`Failed to load tutors: ${response.status}`);
        }
        const tutors = await response.json();

        // Populate tutor select
        const tutorSelect = document.getElementById('tutorSelect');
        tutorSelect.innerHTML = '<option value="">Choose a tutor...</option>';
        tutors.forEach(tutor => {
            if (tutor!=null) {
                const option = document.createElement('option');
                option.value = tutor.tutorId;
                option.textContent = `${tutor.name} - ${tutor.specialization || 'General'}`;
                tutorSelect.appendChild(option);
            }
        });

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('bookingDate').min = today;

        // Reset time field
        document.getElementById('bookingTime').value = '';

        // Scroll the booking form into view
        const bookingFormCard = document.getElementById('bookingFormCard');
        bookingFormCard.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error showing booking form:', error);
        alert('Failed to load tutors. Please try again.');
    }
    document.getElementById('pastSessionsCard').style.display = 'none';
    
    // Show booking form
    document.getElementById('bookingFormCard').style.display = 'block';
    
    // Load tutors and populate select
    const tutors = await loadTutors();
    await populateTutorSelect(tutors);
    
    // If tutorId is provided, select that tutor
    if (tutorId) {
        const tutorSelect = document.getElementById('tutorSelect');
        tutorSelect.value = tutorId;
        // Trigger change event to show availability
        tutorSelect.dispatchEvent(new Event('change'));
    }
}

function hideBookingForm() {
    document.getElementById('bookingFormCard').style.display = 'none';
    // Reset form
    document.getElementById('bookingForm').reset();
    document.getElementById('tutorAvailability').classList.add('d-none');
}

async function loadTutors() {
    try {
        const response = await fetch(`${API_URL}/tutor-profiles`);
        if (!response.ok) {
            throw new Error(`Failed to load tutors: ${response.status}`);
        }
        const tutors = await response.json();
        return tutors;
    } catch (error) {
        console.error('Error loading tutors:', error);
        showError('Failed to load tutors. Please try again.');
        return [];
    }
}

async function populateTutorSelect(tutors) {
    const tutorSelect = document.getElementById('tutorSelect');
    if (!tutorSelect) return;

    tutorSelect.innerHTML = '<option value="">Choose a tutor...</option>';
    tutors.forEach(tutor => {
        const option = document.createElement('option');
        option.value = tutor.id;
        option.textContent = tutor.name;
        option.dataset.availability = tutor.availability || 'Contact for availability';
        tutorSelect.appendChild(option);
    });

    // Add event listener for tutor selection
    tutorSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const availabilityDiv = document.getElementById('tutorAvailability');
        if (!availabilityDiv) return;

        const availabilityPre = availabilityDiv.querySelector('pre');
        if (this.value && availabilityPre) {
            availabilityDiv.classList.remove('d-none');
            availabilityPre.textContent = selectedOption.dataset.availability;
        } else {
            availabilityDiv.classList.add('d-none');
        }
    });
}

async function showTutors() {
    try {
        console.log('Starting showTutors function');
        // Hide other cards
        document.getElementById('bookingFormCard').style.display = 'none';
        document.getElementById('pastSessionsCard').style.display = 'none';

        // Show tutors card
        const tutorsCard = document.getElementById('tutorsCard');
        console.log('tutorsCard element:', tutorsCard);
        tutorsCard.style.display = 'block';

        // Load tutors
        console.log('Fetching tutors from:', `${API_URL}/tutors`);
        const response = await fetch(`${API_URL}/tutor-profiles`);
        if (!response.ok) {
            throw new Error(`Failed to load tutors: ${response.status}`);
        }
        const tutors = await response.json();
        console.log('Loaded tutors:', tutors);

        // Display tutors
        const tutorsContainer = document.getElementById('tutorsList');
        console.log('tutorsList element:', tutorsContainer);
        if (!tutors || tutors.length === 0) {
            tutorsContainer.innerHTML = '<div class="alert alert-info">No tutors available at the moment.</div>';
            return;
        }

        console.log('Building tutors HTML');
        let html = '<div class="row g-4">';
        tutors.forEach(tutor => {
            console.log('Processing tutor:', tutor);
            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="flex-shrink-0">
                                    <div class="avatar bg-primary text-white rounded p-2">
                                        <i class="bi bi-person-circle fs-2"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h5 class="card-title mb-0">${tutor.name || 'Unknown'}</h5>
                                    <small class="text-muted">${tutor.location || 'Location not specified'}</small>
                                </div>
                            </div>
                            <div class="mb-3">
                                <h6 class="text-muted">Subjects</h6>
                                <div class="d-flex flex-wrap gap-1">
                                    ${tutor.subjects ? tutor.subjects.map(subject => 
                                        `<span class="badge bg-light text-dark">${subject}</span>`
                                    ).join('') : 'No subjects listed'}
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-briefcase me-2"></i>
                                    <span>${tutor.yearsOfExperience} years of experience</span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <i class="bi bi-star-fill text-warning"></i>
                                    <span class="ms-1">${tutor.rating || '0.0'}</span>
                                </div>
                                <button class="btn btn-primary btn-sm" onclick="showBookingForm('${tutor.tutorId}')">
                                    <i class="bi bi-calendar-plus"></i> Book Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        console.log('Final HTML:', html);
        tutorsContainer.innerHTML = html;
        console.log('HTML set to container');

        // Scroll the tutors card into view
        tutorsCard.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading tutors:', error);
        alert('Failed to load tutors. Please try again.');
    }
}

async function loadBookings() {
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
      //  showError('Failed to load bookings. Please refresh the page.');
        return [];
    }
}

async function showPastSessions() {
    try {
        // Hide other cards
        document.getElementById('tutorsCard').style.display = 'none';
        document.getElementById('bookingFormCard').style.display = 'none';

        // Show past sessions card
        const pastSessionsCard = document.getElementById('pastSessionsCard');
        pastSessionsCard.style.display = 'block';

        // Load bookings
        const bookings = await loadBookings();
        console.log('Loaded bookings:', bookings);

        // Get the container
        const container = document.getElementById('pastBookings');
        if (!bookings || bookings.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No past sessions found</div>';
            return;
        }

        // Sort bookings by date, most recent first
        bookings.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

        let html = '<div class="row g-4">';
        bookings.forEach(booking => {
            const date = new Date(booking.dateTime);
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const status = booking.status || 'COMPLETED';
            const statusClass = {
                'COMPLETED': 'success',
                'CANCELLED': 'danger',
                'PENDING': 'warning'
            }[status] || 'secondary';

            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="flex-shrink-0">
                                    <div class="avatar bg-${statusClass} text-white rounded p-2">
                                        <i class="bi bi-calendar-check fs-2"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h5 class="card-title mb-0">${booking.tutorName || 'Unknown Tutor'}</h5>
                                    <small class="text-muted">${booking.subject || 'General Session'}</small>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="d-flex align-items-center mb-2">
                                    <i class="bi bi-clock me-2"></i>
                                    <span>${formattedDate} at ${formattedTime}</span>
                                </div>
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-tag me-2"></i>
                                    <span class="badge bg-${statusClass}">${status}</span>
                                </div>
                            </div>
                            <div class="d-flex gap-2">
                               
                                ${status === 'COMPLETED' ? `
                                    <button class="btn btn-sm btn-outline-warning flex-grow-1" onclick="showReviewForm('${booking.bookingId}')">
                                        <i class="bi bi-star"></i> Review
                                    </button>
                                ` : ''}
                                ${status !== 'COMPLETED' && status !== 'CANCELLED' ? `
                                    <button class="btn btn-sm btn-outline-danger flex-grow-1" onclick='updateBookingStatus("${booking.bookingId}", ${JSON.stringify(booking)})'">
                                        <i class="bi bi-x-circle"></i> Cancel
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;

        // Scroll the past sessions card into view
        pastSessionsCard.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error showing past sessions:', error);
        showError('Failed to load past sessions. Please try again.');
    }
}

async function loadDashboardStats() {
    try {
        // Load bookings
        const bookingsResponse = await fetch(`${API_URL}/bookings/student/${currentUser.id}`);
        if (!bookingsResponse.ok) {
            throw new Error(`Failed to load bookings: ${bookingsResponse.status}`);
        }
        const bookings = await bookingsResponse.json();

        // Calculate session stats
        const totalSessions = bookings.length;
        const completedSessions = bookings.filter(b => b.status === 'COMPLETED').length;
        const upcomingSession = bookings.find(b => 
            b.status === 'CONFIRMED' && new Date(b.dateTime) > new Date()
        );

        // Update session stats
        document.getElementById('totalSessions').textContent = totalSessions;
        document.getElementById('completedSessions').textContent = `${completedSessions} completed`;
        
        if (upcomingSession) {
            const sessionDate = new Date(upcomingSession.dateTime);
            document.getElementById('nextSession').textContent = sessionDate.toLocaleDateString();
            document.getElementById('nextSessionTutor').textContent = `with ${upcomingSession.tutorName}`;
        }

        // Load reviews count
        const reviewsResponse = await fetch(`${API_URL}/reviews/student/${currentUser.id}`);
        if (reviewsResponse.ok) {
            const reviews = await reviewsResponse.json();
            document.getElementById('totalReviews').textContent = reviews.length;
        }

        // Display bookings in table
        displayBookings(bookings);
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

function displayBookings(bookings) {
    const tableBody = document.getElementById('pastBookings');
    if (!bookings || bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No bookings found</td></tr>';
        return;
    }

    // Sort bookings by date, most recent first
    bookings.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

    let html = '';
    bookings.forEach(booking => {
        const date = new Date(booking.dateTime);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        html += `
            <tr>
                <td>
                    <div class="fw-bold">${formattedDate}</div>
                    <small class="text-muted">${formattedTime}</small>
                </td>
                <td>
                    <div class="fw-bold">${booking.tutorName}</div>
                    <small class="text-muted">Session ID: ${booking.id}</small>
                </td>
                <td><span class="badge bg-${getStatusBadgeClass(booking.status)}">${booking.status}</span></td>
                <td>
                    <div class="d-flex gap-2 justify-content-end">
                        ${booking.status === 'COMPLETED' && !booking.isReviewed ? 
                            `<button class="btn btn-sm btn-warning" onclick="showReviewModal('${booking.id}')">
                                <i class="bi bi-star"></i> Review
                            </button>` : ''
                        }
                        ${booking.status === 'COMPLETED' && !booking.isPaid ? 
                            `<button class="btn btn-sm btn-success" onclick="showMakePaymentModal('${booking.id}')">
                                <i class="bi bi-credit-card"></i> Pay
                            </button>` : ''
                        }
                    </div>
                </td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;
}

function displayPastBookings(bookings) {
    const tableBody = document.getElementById('pastBookingsTableBody');
    if (!bookings || bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No past sessions</td></tr>';
        return;
    }

    let html = '';
    bookings.forEach(booking => {
        const dateTime = new Date(booking.dateTime);
        const hasReview = booking.hasReview; // Add this field in the backend
        html += `
            <tr>
                <td>${booking.tutorName || 'Unknown'}</td>
                <td>${dateTime.toLocaleDateString()}</td>
                <td>${dateTime.toLocaleTimeString()}</td>
                <td><span class="badge bg-${getStatusBadgeColor(booking.status)}">${booking.status}</span></td>
                <td>
                    ${booking.status === 'COMPLETED' && !hasReview ? `
                        <button class="btn btn-primary btn-sm" onclick="showReviewModal('${booking.tutorId}', '${booking.bookingId}')">
                            <i class="bi bi-star"></i> Write Review
                        </button>
                    ` : ''}
                    ${booking.status !== 'CANCELED' && booking.status !== 'COMPLETED' ? `
                        <button class="btn btn-danger btn-sm" onclick="cancelBooking('${booking.bookingId}')">
                            <i class="bi bi-x-circle"></i> Cancel
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;
}

function getStatusBadgeColor(status) {
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

async function createBooking() {
    const tutorSelect = document.getElementById('tutorSelect');
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    
    if (!tutorSelect.value || !date || !time) {
        alert('Please select a tutor and both date and time');
        return;
    }

    const dateTime = new Date(date + 'T' + time);
    const selectedOption = tutorSelect.options[tutorSelect.selectedIndex];
    console.log(selectedOption)
    const booking = {
        studentId: currentUser.id,
        tutorId: tutorSelect.value,
        dateTime: dateTime.toISOString(),
        studentName: currentUser.username,
        tutorName: selectedOption.textContent.split(' - ')[0],
        status: 'PENDING'
    };
    console.log(tutorSelect)

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
            loadBookings(); // Refresh the bookings display
        } else {
            const error = await response.text();
          //  alert('Failed to create booking: ' + error);
        }
    } catch (error) {
        console.error('Error creating booking:', error);
       // alert('Error creating booking');
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    try {
        // First, get the current booking details
        const response = await fetch(`${API_URL}/bookings/student/${currentUser.id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch booking details');
        }

        const bookings = await response.json();
        const bookingToCancel = bookings.find(b => b.bookingId === bookingId);

        if (!bookingToCancel) {
            throw new Error('Booking not found');
        }

        // Update the booking status
        bookingToCancel.status = 'CANCELED';

        // Send the complete booking object
        const updateResponse = await fetch(`${API_URL}/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingToCancel)
        });

        if (updateResponse.ok) {
            alert('Booking canceled successfully!');
            loadBookings(); // Refresh the bookings display
        } else {
            const errorText = await updateResponse.text();
            console.error('Failed to cancel booking:', errorText);
            alert('Failed to cancel booking. Please try again.');
        }
    } catch (error) {
        console.error('Error canceling booking:', error);
        alert('Failed to cancel booking. Please try again.');
    }
}

function showEditProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log(currentUser)
    if (currentUser) {
        document.getElementById('userName').value = currentUser.name || '';
        document.getElementById('editEmail').value = currentUser.email || '';
        document.getElementById('editPhone').value = currentUser.contact || '';
    }
    const modal = new bootstrap.Modal(document.getElementById('editProfileModals'));
    modal.show();
}

async function saveProfile() {
    const username = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    const contact = document.getElementById('editPhone').value;
console.log(name);
    console.log(email);


    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const updatedUser = {
        id:currentUser.id,
        password:currentUser.password,
        role:currentUser.role,
        username: username,
        email: email,
        contact: contact
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
            alert('Profile updated successfully!');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            modal.hide();
            await loadUserDetails(); // Reload user details
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

async function cancelSession(bookingId,booking) {
    try {
        if (!confirm('Are you sure you want to cancel this session?')) {
            return;
        }
        const confirmedBooking = {...booking, status: 'confirmed'};

        const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(confirmedBooking)
        });

        if (!response.ok) {
            throw new Error(`Failed to cancel session: ${response.status}`);
        }

        // Show success message
        alert('Session cancelled successfully');
        
        // Refresh the past sessions view
        await showPastSessions();
    } catch (error) {
        console.error('Error cancelling session:', error);
        alert('Failed to cancel session. Please try again.');
    }
}





function showError(message) {
    const upcomingContainer = document.getElementById('upcomingBookings');
    const pastContainer = document.getElementById('pastBookings');
    upcomingContainer.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    pastContainer.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}

function showReviewModal(tutorId, bookingId) {
    // Reset form
    document.getElementById('reviewForm').reset();
    document.getElementById('reviewTutorId').value = tutorId;
    document.getElementById('reviewBookingId').value = bookingId;
    
    // Show modal
    const reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
    reviewModal.show();
}

async function submitReview() {
    const tutorId = document.getElementById('reviewTutorId').value;
    const bookingId = document.getElementById('reviewBookingId').value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const comment = document.getElementById('reviewComment').value;
    const isAnonymous = document.getElementById('reviewAnonymous').checked;

    if (!rating) {
        alert('Please select a rating');
        return;
    }

    if (!comment) {
        alert('Please write a comment');
        return;
    }

    const review = {
        tutorId: tutorId,
        studentId: currentUser.id,
        bookingId: bookingId,
        rating: parseInt(rating),
        comment: comment,
        isAnonymous: isAnonymous,
        createdAt: new Date().toISOString()
    };

    try {
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(review)
        });

        if (!response.ok) {
            throw new Error(`Failed to submit review: ${response.status}`);
        }

        // Close modal
        const reviewModal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
        reviewModal.hide();

        // Reload bookings to update UI
        await loadBookings();

        // Show success message
        alert('Review submitted successfully!');
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again.');
    }
}

// Make all functions globally available
Object.assign(window, {
    showBookingForm,
    hideBookingForm,
    createBooking,
    cancelBooking,
    showEditProfile,
    saveProfile,
    logout,
    loadBookings,
    loadTutors,
    loadUserDetails,
    showReviewModal,
    submitReview
});

async function updateBookingStatus(bookingId, booking) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    try {

        const confirmedBooking = {...booking, status: 'Cansel'};
        const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(booking)
        });

        if (response.ok) {
            // Reload the bookings after successful update
            //loadBookingSessions();
        } else {
            throw new Error('Failed to update booking status');
        }
    } catch (error) {
        console.error('Error updating booking status:', error);
        alert('Failed to update booking status. Please try again later.');
    }
}
