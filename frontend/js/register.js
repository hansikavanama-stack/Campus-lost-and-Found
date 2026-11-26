const API_URL = 'http://localhost:5000/api/auth/register';

const registerForm = document.getElementById('registerForm');
const message = document.getElementById('message');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            message.textContent = 'Registration successful! Please login.';
            message.style.color = 'green';
            registerForm.reset();
        } else {
            message.textContent = data.message || 'Registration failed.';
            message.style.color = 'red';
        }

    } catch (error) {
        message.textContent = 'Cannot connect to the server.';
        message.style.color = 'red';
        console.log(error);
    }
});
