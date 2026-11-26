
const API_URL = 'http://localhost:5000/api/auth/login';

const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);

            message.textContent = 'Login successful!';
            message.style.color = 'green';

            loginForm.reset();

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);

        } else {
            message.textContent = data.message || 'Login failed.';
            message.style.color = 'red';
        }

    } catch (error) {
        message.textContent = 'Cannot connect to the server.';
        message.style.color = 'red';
        console.log(error);
    }
});
