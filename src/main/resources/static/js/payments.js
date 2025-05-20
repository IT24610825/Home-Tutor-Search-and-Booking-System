// Global variables
const API_URL = 'http://localhost:8080/api';
let currentUser = null;

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializePaymentDashboard);

async function initializePaymentDashboard() {
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

    // Load payments and update dashboard
    await loadPayments();
    await loadCompletedSessions();

    // Check if redirected with session parameter
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    if (sessionId) {
        // Show payment modal for the specific session
        await showMakePaymentModal(sessionId);
    }
}

async function loadPayments() {
    try {
        const response = await fetch(`${API_URL}/payments/student/${currentUser.id}`);
        if (!response.ok) {
            throw new Error(`Failed to load payments: ${response.status}`);
        }
        const payments = await response.json();
        
        // Update summary cards
        updatePaymentSummary(payments);
        
        // Update payment history table
        displayPaymentHistory(payments);
    } catch (error) {
        console.error('Error loading payments:', error);
        showError('Failed to load payments. Please try again.');
    }
}

function updatePaymentSummary(payments) {
    let totalPaid = 0;
    let pendingAmount = 0;
    let totalSessions = 0;

    payments.forEach(payment => {
        if (payment.status === 'PAID') {
            totalPaid += payment.amount;
        } else if (payment.status === 'PENDING') {
            pendingAmount += payment.amount;
        }
        totalSessions++;
    });

    document.getElementById('totalPaid').textContent = `$${totalPaid.toFixed(2)}`;
    document.getElementById('pendingPayments').textContent = `$${pendingAmount.toFixed(2)}`;
    document.getElementById('totalSessions').textContent = totalSessions;
}

function displayPaymentHistory(payments) {
    const tableBody = document.getElementById('paymentHistoryTable');
    if (!payments || payments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No payment history found</td></tr>';
        return;
    }

    let html = '';
    payments.forEach(payment => {
        const date = new Date(payment.createdAt).toLocaleDateString();
        const statusClass = getStatusClass(payment.status);
        
        html += `
            <tr>
                <td>${date}</td>
                <td>${payment.tutorName || 'Unknown'}</td>
                <td>$${payment.amount.toFixed(2)}</td>
                <td><span class="badge ${statusClass}">${payment.status}</span></td>
                <td>${payment.paymentMethod || '-'}</td>
                <td>
                    ${payment.status === 'PENDING' ? `
                        <button class="btn btn-sm btn-success me-2" onclick="processPayment('${payment.id}')">
                            <i class="bi bi-credit-card"></i> Pay
                        </button>
                    ` : ''}
                    ${payment.status !== 'PAID' ? `
                        <button class="btn btn-sm btn-danger" onclick="deletePayment('${payment.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;
}

function getStatusClass(status) {
    switch (status) {
        case 'PAID':
            return 'bg-success';
        case 'PENDING':
            return 'bg-warning';
        case 'REFUNDED':
            return 'bg-info';
        default:
            return 'bg-secondary';
    }
}



async function showMakePaymentModal(specificSessionId = null) {
    try {
        // Reset form
        document.getElementById('paymentForm').reset();
        
        // Load completed sessions
        const response = await fetch(`${API_URL}/bookings/student/${currentUser.id}`);
        if (!response.ok) {
            throw new Error(`Failed to load sessions: ${response.status}`);
        }
        const bookings = await response.json();
        
        // Filter completed sessions that haven't been paid
        const completedSessions = bookings.filter(booking => 
            booking.status === 'COMPLETED' && !booking.isPaid
        );

        // Populate session select
        const sessionSelect = document.getElementById('sessionSelect');
        sessionSelect.innerHTML = '<option value="">Choose a session...</option>';
        
        completedSessions.forEach(session => {
            const date = new Date(session.dateTime).toLocaleString();
            const option = document.createElement('option');
            option.value = session.id;
            option.textContent = `${session.tutorName} - ${date}`;
            option.dataset.tutorId = session.tutorId;
            option.dataset.amount = session.amount || '50.00'; // Default amount if not set
            sessionSelect.appendChild(option);

            // If this is the specific session we want to show, select it
            if (specificSessionId && session.id === specificSessionId) {
                option.selected = true;
                // Also set the amount
                document.getElementById('paymentAmount').value = option.dataset.amount;
            }
        });

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('makePaymentModal'));
        modal.show();

        // If we have a specific session but couldn't find it
        if (specificSessionId && !sessionSelect.value) {
            alert('The selected session was not found or has already been paid.');
        }
    } catch (error) {
        console.error('Error loading sessions:', error);
        alert('Failed to load sessions. Please try again.');
    }
}

// Handle session selection
document.getElementById('sessionSelect')?.addEventListener('change', function() {
    const selected = this.options[this.selectedIndex];
    if (selected && selected.dataset.amount) {
        document.getElementById('paymentAmount').value = selected.dataset.amount;
    }
});

async function submitPayment(event) {
    event.preventDefault();
    
    const sessionSelect = document.getElementById('sessionSelect');
    if (!sessionSelect.value) {
        alert('Please select a session');
        return;
    }

    const selected = sessionSelect.options[sessionSelect.selectedIndex];
    if (!selected.dataset.tutorId) {
        alert('Error: Tutor information not found');
        return;
    }
    
    const payment = {
        bookingId: sessionSelect.value,
        tutorId: selected.dataset.tutorId,
        studentId: currentUser.id,
        amount: parseFloat(document.getElementById('paymentAmount').value),
        paymentMethod: document.getElementById('paymentMethod').value,
        status: 'PENDING'
    };

    // Validate required fields
    if (!payment.tutorId || !payment.studentId) {
        alert('Error: Missing tutor or student information');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payment)
        });

        if (!response.ok) {
            throw new Error(`Failed to create payment: ${response.status}`);
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('makePaymentModal'));
        modal.hide();

        // Reload payments
        await loadPayments();

        // Show success message
        alert('Payment created successfully!');
    } catch (error) {
        console.error('Error creating payment:', error);
        alert('Failed to create payment. Please try again.');
    }
}

async function processPayment(paymentId) {
    try {
        const response = await fetch(`${API_URL}/payments/${paymentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'PAID',
                updatedAt: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to process payment: ${response.status}`);
        }

        // Reload payments
        await loadPayments();

        // Show success message
        alert('Payment processed successfully!');
    } catch (error) {
        console.error('Error processing payment:', error);
        alert('Failed to process payment. Please try again.');
    }
}

async function deletePayment(paymentId) {
    if (!confirm('Are you sure you want to delete this payment?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/payments/${paymentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete payment: ${response.status}`);
        }

        // Reload payments
        await loadPayments();

        // Show success message
        alert('Payment deleted successfully!');
    } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Failed to delete payment. Please try again.');
    }
}

function showError(message) {
    const tableBody = document.getElementById('paymentHistoryTable');
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${message}</td></tr>`;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
