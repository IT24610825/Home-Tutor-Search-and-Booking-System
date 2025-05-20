// Load Payments
function loadPayments(filter = 'all') {
    fetch('http://localhost:8080/api/payments')
    .then(response => response.json())
    .then(data => {
        const paymentsTableBody = document.getElementById('paymentsTableBody');
        paymentsTableBody.innerHTML = '';

        if (!data || data.length === 0) {
            paymentsTableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-4">
                        <i class="bi bi-credit-card fs-1 text-muted"></i>
                        <p class="text-muted mt-2">No payments found</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Update stats
        updatePaymentStats(data);

        // Filter payments if needed
        const filteredPayments = filter === 'all' 
            ? data 
            : data.filter(payment => payment.status.toLowerCase() === filter.toLowerCase());

        filteredPayments.forEach(payment => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${payment.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-calendar2-check me-2"></i>
                        ${payment.bookingId}
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="user-avatar me-2">
                            <i class="bi bi-person-circle"></i>
                        </div>
                        ${payment.studentId}
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="user-avatar me-2">
                            <i class="bi bi-person-workspace"></i>
                        </div>
                        ${payment.tutorId}
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-currency-dollar me-1"></i>
                        ${payment.amount.toFixed(2)}
                    </div>
                </td>
                <td>
                    <span class="badge bg-${getStatusColor(payment.status)}">
                        ${payment.status}
                    </span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-${getPaymentMethodIcon(payment.paymentMethod)} me-2"></i>
                        ${formatPaymentMethod(payment.paymentMethod)}
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-clock me-2"></i>
                        ${formatDateTime(payment.createdAt)}
                    </div>
                </td>
                <td>
                    <div class="btn-group">
                        ${payment.status === 'PENDING' ? `
                            <button class="btn btn-sm btn-light" onclick="updatePaymentStatus('${payment.id}', 'PAID')" 
                                    title="Mark as Paid">
                                <i class="bi bi-check-circle"></i>
                            </button>
                        ` : ''}
                        ${payment.status === 'PAID' ? `
                            <button class="btn btn-sm btn-light" onclick="updatePaymentStatus('${payment.id}', 'REFUNDED')"
                                    title="Refund Payment">
                                <i class="bi bi-arrow-counterclockwise"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-light text-danger" onclick="deletePayment('${payment.id}')"
                                title="Delete Payment">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            paymentsTableBody.appendChild(tr);
        });
    })
    .catch(error => {
        console.error('Error loading payments:', error);
        document.getElementById('paymentsTableBody').innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4">
                    <i class="bi bi-exclamation-circle fs-1 text-danger"></i>
                    <p class="text-danger mt-2">Error loading payments</p>
                </td>
            </tr>
        `;
    });
}

// Update payment stats
function updatePaymentStats(payments) {
    const stats = payments.reduce((acc, payment) => {
        acc.total++;
        acc[payment.status.toLowerCase()]++;
        return acc;
    }, { total: 0, paid: 0, pending: 0, refunded: 0 });

    document.getElementById('totalPayments').textContent = stats.total;
    document.getElementById('paidPayments').textContent = stats.paid;
    document.getElementById('pendingPayments').textContent = stats.pending;
    document.getElementById('refundedPayments').textContent = stats.refunded;
}

// Add new payment
function addPayment() {
    const form = document.getElementById('addPaymentForm');
    const formData = new FormData(form);
    
    const paymentData = {
        id: 'PAY' + Date.now(),
        bookingId: formData.get('bookingId'),
        studentId: formData.get('studentId'),
        tutorId: formData.get('tutorId'),
        amount: parseFloat(formData.get('amount')),
        status: 'PENDING',
        paymentMethod: formData.get('paymentMethod'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
    };

    fetch('http://localhost:8080/api/payments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            bootstrap.Modal.getInstance(document.getElementById('addPaymentModal')).hide();
            loadPayments();
            form.reset();
        } else {
            alert('Failed to add payment');
        }
    })
    .catch(error => {
        console.error('Error adding payment:', error);
        alert('Failed to add payment');
    });
}

// Update payment status
function updatePaymentStatus(paymentId, newStatus) {
    fetch(`http://localhost:8080/api/payments/${paymentId}`)
    .then(response => response.json())
    .then(payment => {
        payment.status = newStatus;
        payment.updatedAt = new Date().toISOString();
        
        return fetch(`http://localhost:8080/api/payments/${paymentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payment)
        });
    })
    .then(response => {
        if (response.ok) {
            loadPayments();
        } else {
            alert('Failed to update payment status');
        }
    })
    .catch(error => {
        console.error('Error updating payment:', error);
        alert('Failed to update payment status');
    });
}

// Delete payment
function deletePayment(paymentId) {
    if (!confirm('Are you sure you want to delete this payment?')) {
        return;
    }

    fetch(`http://localhost:8080/api/payments/${paymentId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            loadPayments();
        } else {
            alert('Failed to delete payment');
        }
    })
    .catch(error => {
        console.error('Error deleting payment:', error);
        alert('Failed to delete payment');
    });
}

// Filter payments
function filterPayments(status) {
    loadPayments(status);
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
        case 'PAID':
            return 'success';
        case 'PENDING':
            return 'warning';
        case 'REFUNDED':
            return 'danger';
        default:
            return 'secondary';
    }
}

function getPaymentMethodIcon(method) {
    switch (method) {
        case 'CREDIT_CARD':
            return 'credit-card';
        case 'DEBIT_CARD':
            return 'credit-card';
        case 'PAYPAL':
            return 'paypal';
        case 'BANK_TRANSFER':
            return 'bank';
        default:
            return 'cash';
    }
}

function formatPaymentMethod(method) {
    if (!method) return 'N/A';
    return method.split('_').map(word => 
        word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
}

// Search payments
const searchInput = document.getElementById('searchPayments');
let searchTimeout;

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        // Client-side search in existing payments
        const rows = document.querySelectorAll('#paymentsTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }, 300);
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadPayments();
});
