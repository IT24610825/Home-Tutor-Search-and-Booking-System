// Global variables
const API_URL = 'http://localhost:8080/api';
let currentUser = null;

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeReviewsPage);

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

async function populateTutorSelect() {
    const tutors = await loadTutors();
    const tutorSelect = document.getElementById('tutorSelect');
    tutorSelect.innerHTML = '<option value="">Choose a tutor...</option>';
    
    tutors.forEach(tutor => {
        const option = document.createElement('option');
        option.value = tutor.id;
        option.textContent = tutor.name || tutor.username;
        tutorSelect.appendChild(option);
    });
}

function showWriteReviewModal() {
    // Reset form
    document.getElementById('reviewForm').reset();
    
    // Load tutors into select
    populateTutorSelect();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('writeReviewModal'));
    modal.show();
}

async function submitReview(event) {
    event.preventDefault();
    
    const tutorId = document.getElementById('tutorSelect').value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const comment = document.getElementById('reviewComment').value;
    const isAnonymous = document.getElementById('reviewAnonymous').checked;

    if (!tutorId) {
        alert('Please select a tutor');
        return;
    }

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
        const modal = bootstrap.Modal.getInstance(document.getElementById('writeReviewModal'));
        modal.hide();

        // Reload reviews
        await showAllReviews();

        // Show success message
        alert('Review submitted successfully!');
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again.');
    }
}

async function updateReview(event) {
    event.preventDefault();
    
    const reviewId = document.getElementById('editReviewId').value;
    const rating = document.querySelector('input[name="editRating"]:checked')?.value;
    const comment = document.getElementById('editReviewComment').value;
    const isAnonymous = document.getElementById('editReviewAnonymous').checked;

    if (!rating) {
        alert('Please select a rating');
        return;
    }

    if (!comment) {
        alert('Please write a comment');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rating: parseInt(rating),
                comment: comment,
                isAnonymous: isAnonymous,
                updatedAt: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to update review: ${response.status}`);
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editReviewModal'));
        modal.hide();

        // Reload reviews
        await showMyReviews();

        // Show success message
        alert('Review updated successfully!');
    } catch (error) {
        console.error('Error updating review:', error);
        alert('Failed to update review. Please try again.');
    }
}

async function initializeReviewsPage() {
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

    // Load all reviews by default
    await showAllReviews();
}

async function showAllReviews() {
    try {
        const response = await fetch(`${API_URL}/reviews`);
        if (!response.ok) {
            throw new Error(`Failed to load reviews: ${response.status}`);
        }
        const reviews = await response.json();
        displayReviews(reviews, false);
    } catch (error) {
        console.error('Error loading reviews:', error);
        showError('Failed to load reviews. Please try again.');
    }
}

async function showMyReviews() {
    try {
        const response = await fetch(`${API_URL}/reviews/student/${currentUser.id}`);
        if (!response.ok) {
            throw new Error(`Failed to load reviews: ${response.status}`);
        }
        const reviews = await response.json();
        displayReviews(reviews, true);
    } catch (error) {
        console.error('Error loading reviews:', error);
        showError('Failed to load reviews. Please try again.');
    }
}

function displayReviews(reviews, isMyReviews) {
    const container = document.getElementById('reviewsList');
    if (!reviews || reviews.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-chat-square-text" style="font-size: 3rem; color: var(--primary-color)"></i>
                <h4 class="mt-3">No Reviews Yet</h4>
                <p class="text-muted">Be the first to share your experience!</p>
                <button class="btn btn-primary mt-2" onclick="showWriteReviewModal()">
                    <i class="bi bi-plus-circle me-2"></i>Write a Review
                </button>
            </div>`;
        return;
    }

    let html = '<div class="row">';
    reviews.forEach(review => {
        const stars = Array(5).fill('').map((_, index) => 
            `<i class="bi bi-star${index < review.rating ? '-fill' : ''}" style="color: var(--accent-color)"></i>`
        ).join('');
        const date = new Date(review.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        const initials = (review.tutorName || 'T').substring(0, 1).toUpperCase();
        
        html += `
            <div class="col-md-6 mb-4">
                <div class="review-card">
                    <div class="review-header d-flex justify-content-between align-items-start p-3">
                        <div class="d-flex gap-3">
                            <div class="user-avatar">${initials}</div>
                            <div>
                                <h5 class="mb-1">${review.tutorName || 'Tutor'}</h5>
                                <div class="stars-display">${stars}</div>
                            </div>
                        </div>
                        <small class="text-muted">${date}</small>
                    </div>
                    <div class="review-content">
                        <p class="mb-0">${review.comment}</p>
                    </div>
                    ${isMyReviews ? `
                        <div class="review-footer d-flex justify-content-end gap-2">
                            <button class="btn btn-sm btn-outline-primary" onclick="editReview('${review.id}')">
                                <i class="bi bi-pencil me-1"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteReview('${review.id}')">
                                <i class="bi bi-trash me-1"></i> Delete
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;

    // Update review stats if the elements exist
    const statsContainer = document.querySelector('.review-stats');
    if (statsContainer) {
        const avgRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
        const positiveReviews = reviews.filter(review => review.rating >= 4).length;
        const positivePercentage = ((positiveReviews / reviews.length) * 100).toFixed(0);

        const statValues = statsContainer.querySelectorAll('.stat-value');
        if (statValues.length >= 3) {
            statValues[0].textContent = avgRating;
            statValues[1].textContent = reviews.length;
            statValues[2].textContent = positivePercentage + '%';
        }
    }
}

async function editReview(reviewId) {
    try {
        const response = await fetch(`${API_URL}/reviews/review/${reviewId}`);
        if (!response.ok) {
            throw new Error(`Failed to load review: ${response.status}`);
        }
        const review = await response.json();
        
        // Show edit modal with current review data
        document.getElementById('editReviewId').value = review.id;
        document.querySelector(`input[name="editRating"][value="${review.rating}"]`).checked = true;
        document.getElementById('editReviewComment').value = review.comment;
        document.getElementById('editReviewAnonymous').checked = review.isAnonymous;
        
        const editModal = new bootstrap.Modal(document.getElementById('editReviewModal'));
        editModal.show();
    } catch (error) {
        console.error('Error loading review:', error);
        alert('Failed to load review for editing. Please try again.');
    }
}

async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete review: ${response.status}`);
        }

        // Refresh the reviews list
        await showMyReviews();
        alert('Review deleted successfully!');
    } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review. Please try again.');
    }
}

function showError(message) {
    const container = document.getElementById('reviewsList');
    container.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
