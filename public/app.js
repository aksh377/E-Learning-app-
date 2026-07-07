// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeButtons = document.getElementsByClassName('close');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const coursesGrid = document.getElementById('coursesGrid');
const navLinks = document.querySelector('.nav-links');

// Show Modal Functions
loginBtn.onclick = () => loginModal.style.display = 'block';
registerBtn.onclick = () => registerModal.style.display = 'block';

// Close Modal Functions
Array.from(closeButtons).forEach(button => {
    button.onclick = function() {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    }
});

// Close modal when clicking outside
window.onclick = (event) => {
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target === registerModal) {
        registerModal.style.display = 'none';
    }
};

// Handle Login Form Submit
loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            loginModal.style.display = 'none';
            updateUIAfterLogin(data.user);
            showNotification('Successfully logged in!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('An error occurred during login', 'error');
    }
};

// Handle Register Form Submit
registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            registerModal.style.display = 'none';
            updateUIAfterLogin(data.user);
            showNotification('Successfully registered!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('An error occurred during registration', 'error');
    }
};

// Load Courses
async function loadCourses() {
    try {
        const response = await fetch('/api/courses');
        const courses = await response.json();
        
        if (courses.length === 0) {
            coursesGrid.innerHTML = '<p class="no-courses">No courses available yet.</p>';
            return;
        }
        
        coursesGrid.innerHTML = courses.map(course => `
            <div class="course-card">
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <p><strong>Instructor:</strong> ${course.instructor ? course.instructor.name : 'Not assigned'}</p>
                <p><strong>Students:</strong> ${course.students ? course.students.length : 0}</p>
                <button class="btn-primary view-course" data-id="${course._id}">View Course</button>
            </div>
        `).join('');
        
        // Add event listeners to course buttons
        document.querySelectorAll('.view-course').forEach(button => {
            button.addEventListener('click', () => {
                const courseId = button.getAttribute('data-id');
                viewCourse(courseId);
            });
        });
    } catch (error) {
        console.error('Error loading courses:', error);
        coursesGrid.innerHTML = '<p class="error-message">Error loading courses. Please try again later.</p>';
    }
}

// View Course Details
function viewCourse(courseId) {
    // This would be expanded to show course details
    showNotification('Course details would be shown here', 'info');
}

// Update UI after login
function updateUIAfterLogin(user) {
    navLinks.innerHTML = `
        <a href="#" class="active" data-page="home">Home</a>
        <a href="#courses" data-page="courses">Courses</a>
        <span class="user-welcome">Welcome, ${user.name}</span>
        <a href="#" id="logoutBtn">Logout</a>
    `;

    document.getElementById('logoutBtn').onclick = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        location.reload();
    };
    
    // Add event listeners for navigation
    document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            navigateToPage(page);
        });
    });
}

// Navigate to different pages
function navigateToPage(page) {
    // Update active link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`.nav-links a[data-page="${page}"]`).classList.add('active');
    
    // Show/hide sections based on page
    document.querySelectorAll('main > section').forEach(section => {
        section.style.display = 'none';
    });
    
    if (page === 'home') {
        document.querySelector('.hero').style.display = 'block';
        document.querySelector('.courses-section').style.display = 'block';
    } else if (page === 'courses') {
        document.querySelector('.hero').style.display = 'none';
        document.querySelector('.courses-section').style.display = 'block';
        loadCourses();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Check if user is already logged in
const user = JSON.parse(localStorage.getItem('user'));
if (user) {
    updateUIAfterLogin(user);
}

// Handle client-side routing
window.addEventListener('hashchange', () => {
    const hash = window.location.hash || '#home';
    const page = hash.substring(1);
    
    if (page === 'login') {
        loginModal.style.display = 'block';
    } else if (page === 'register') {
        registerModal.style.display = 'block';
    } else if (page === 'courses') {
        navigateToPage('courses');
    } else {
        navigateToPage('home');
    }
});

// Initial page load
window.addEventListener('load', () => {
    const hash = window.location.hash || '#home';
    const page = hash.substring(1);
    
    if (page === 'login') {
        loginModal.style.display = 'block';
    } else if (page === 'register') {
        registerModal.style.display = 'block';
    } else if (page === 'courses') {
        navigateToPage('courses');
    } else {
        navigateToPage('home');
    }
}); 