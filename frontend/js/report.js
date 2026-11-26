
const API_URL = 'http://localhost:5000/api/items';

const token = localStorage.getItem('token');

const reportForm = document.getElementById('reportForm');
const message = document.getElementById('message');

// Check login
if (!token) {
    window.location.href = 'login.html';
}

// Submit item report
reportForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const itemName = document.getElementById('itemName').value;
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const location = document.getElementById('location').value;
    const date = document.getElementById('date').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                itemName,
                type,
                category,
                description,
                location,
                date
            })
        });

        const data = await response.json();

        if (response.ok) {
            message.textContent = 'Item reported successfully!';
            message.style.color = 'green';

            reportForm.reset();
        } else {
            message.textContent = data.message || 'Failed to report item.';
            message.style.color = 'red';
        }

    } catch (error) {
        message.textContent = 'Cannot connect to the server.';
        message.style.color = 'red';
        console.log(error);
    }
});
