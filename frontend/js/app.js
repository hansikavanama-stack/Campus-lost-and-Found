
const API_URL = 'http://localhost:5000/api/items';

async function displayItems(items) {
    const itemList = document.getElementById('itemList');

    itemList.innerHTML = '';

    if (items.length === 0) {
        itemList.innerHTML = '<p>No matching items found.</p>';
        return;
    }

    items.forEach(item => {
        const claimButton =
            item.type === 'found' && item.status === 'available'
            ? `<button class="claim-btn" data-id="${item._id}">
                    Claim Item
               </button>`
            : '';

        itemList.innerHTML += `
            <div class="item-card">
                <h3>${item.itemName}</h3>
                <p><strong>Type:</strong> ${item.type}</p>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Description:</strong> ${item.description}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Status:</strong> ${item.status}</p>
                ${claimButton}
            </div>
        `;
    });
}

async function loadItems() {
    const itemList = document.getElementById('itemList');

    try {
        const response = await fetch(API_URL);
        const items = await response.json();

        if (!response.ok) {
            throw new Error('Unable to load items');
        }

        displayItems(items);

    } catch (error) {
        itemList.innerHTML = '<p>Unable to load items. Please try again.</p>';
        console.log(error);
    }
}

async function searchItems() {
    const keyword = document.getElementById('searchInput').value;

    const itemList = document.getElementById('itemList');

    try {
        const response = await fetch(
            `${API_URL}/search?keyword=${encodeURIComponent(keyword)}`
        );

        const items = await response.json();

        if (!response.ok) {
            throw new Error('Search failed');
        }

        displayItems(items);

    } catch (error) {
        itemList.innerHTML = '<p>Search failed. Please try again.</p>';
        console.log(error);
    }
}

document.getElementById('itemList').addEventListener('click', async (event) => {
    const button = event.target.closest('.claim-btn');

    if (!button) {
        return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
        alert('Please login to claim an item.');
        window.location.href = 'login.html';
        return;
    }

    const message = prompt('Enter your claim message:');

    if (!message || !message.trim()) {
        alert('Please enter a claim message.');
        return;
    }

    try {
        button.disabled = true;

        const response = await fetch('http://localhost:5000/api/claims', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                itemId: button.dataset.id,
                message: message.trim()
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Claim submission failed');
        }

        alert('Claim submitted successfully!');

    } catch (error) {
        alert(error.message);
        button.disabled = false;
    }
});

loadItems();
