const API_URL = 'http://localhost:8080/api';

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function toggleQualifications() {
    const role = document.getElementById('role').value;
    const qualificationsDiv = document.getElementById('qualificationsDiv');
    qualificationsDiv.style.display = role === 'TUTOR' ? 'block' : 'none';
}

async function login(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/users/username/${username}`);
        const user = await response.json();
        
        if (user && user.password === password) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = user.role.toLowerCase() + '-dashboard.html';
        } else {
            alert('Invalid username or password');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error during login');
    }
}

async function register(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const contact = document.getElementById('contact').value;
    const role = document.getElementById('role').value;
    const qualifications = document.getElementById('qualifications').value;

    const userData = {
        username,
        password,
        contact,
        role,
        ...(role === 'TUTOR' && { qualifications })
    };

    try {
        const response = await fetch(`${API_URL}/users/register/${role.toLowerCase()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert('Registration successful! Please login.');
            showLogin();
        } else {
            alert('Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error during registration');
    }
}
