const API_BASE = 'http://localhost:5000/api';

// Utility: Show Alert
function showAlert(message, type = 'danger') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show shadow-sm`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 200);
    }, 5000);
}

// Auth State
function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    updateNavbar();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Generic Fetch Wrapper
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, { ...options, headers });
        const data = await response.json();
        
        if (!response.ok || data.success === false) {
            throw new Error(data.message || data.error || 'An error occurred during the request.');
        }
        
        return data;
    } catch (error) {
        showAlert(error.message, 'danger');
        throw error;
    }
}

// Navbar Setup
function updateNavbar() {
    const navRight = document.getElementById('nav-right');
    if (!navRight) return;
    
    const user = getUser();
    if (user) {
        let links = '';
        if (user.role === 'organizer') {
            links += `<li class="nav-item"><a class="nav-link fw-medium" href="dashboard.html">Organizer Dashboard</a></li>`;
        }
        links += `
            <li class="nav-item"><a class="nav-link fw-medium" href="index.html">Browse Events</a></li>
            <li class="nav-item"><a class="nav-link text-danger fw-medium" href="#" onclick="logout(); return false;">Logout (${user.name || user.role})</a></li>
        `;
        navRight.innerHTML = links;
    } else {
        navRight.innerHTML = `
            <li class="nav-item"><a class="nav-link fw-medium" href="index.html">Browse Events</a></li>
            <li class="nav-item"><a class="nav-link fw-medium" href="login.html">Login</a></li>
            <li class="nav-item"><a class="btn btn-primary ms-2 px-4 rounded-pill shadow-sm" href="register.html">Register</a></li>
        `;
    }
}

document.addEventListener('DOMContentLoaded', updateNavbar);
