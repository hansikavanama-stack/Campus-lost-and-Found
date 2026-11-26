
const token = localStorage.getItem('token');

const myItems = document.getElementById('myItems');
const myClaims = document.getElementById('myClaims');
const receivedClaims = document.getElementById('receivedClaims');

if (!token) {
    window.location.href = 'login.html';
}

async function loadMyItems() {
    try {
        const response = await fetch(
            'http://localhost:5000/api/items/my-items',
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const items = await response.json();

        if (!response.ok) {
            throw new Error(items.message || 'Unable to load items');
        }

        document.getElementById('totalReports').textContent = items.length;

        myItems.innerHTML = '';

        if (items.length === 0) {
            myItems.innerHTML = '<p>You have not reported any items.</p>';
            return;
        }

        items.forEach(item => {
            myItems.innerHTML += `
                <div class="item-card">
                    <h3>${item.itemName}</h3>
                    <p>Type: ${item.type}</p>
                    <p>Category: ${item.category}</p>
                    <p>Location: ${item.location}</p>
                    <p>Status: ${item.status}</p>
                </div>
            `;
        });

    } catch (error) {
        myItems.innerHTML = '<p>Unable to load your items.</p>';
        console.log(error);
    }
}

async function loadMyClaims() {
    try {
        const response = await fetch(
            'http://localhost:5000/api/claims/my-claims',
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const claims = await response.json();

        if (!response.ok) {
            throw new Error(claims.message || 'Unable to load claims');
        }

        document.getElementById('totalClaims').textContent = claims.length;

        document.getElementById('pendingClaims').textContent =
            claims.filter(claim => claim.status === 'pending').length;

        document.getElementById('approvedClaims').textContent =
            claims.filter(claim => claim.status === 'approved').length;

        myClaims.innerHTML = '';

        if (claims.length === 0) {
            myClaims.innerHTML = '<p>You have not submitted any claims.</p>';
            return;
        }

        claims.forEach(claim => {
            myClaims.innerHTML += `
                <div class="item-card">
                    <h3>${claim.item?.itemName || 'Item'}</h3>
                    <p>Message: ${claim.message}</p>
                    <p>Claim Status: ${claim.status}</p>
                </div>
            `;
        });

    } catch (error) {
        myClaims.innerHTML = '<p>Unable to load your claims.</p>';
        console.log(error);
    }
}

async function loadReceivedClaims() {
    try {
        const response = await fetch(
            'http://localhost:5000/api/claims/received',
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const claims = await response.json();

        if (!response.ok) {
            throw new Error(claims.message || 'Unable to load received claims');
        }

        receivedClaims.innerHTML = '';

        if (claims.length === 0) {
            receivedClaims.innerHTML =
                '<p>No claims have been received on your items.</p>';
            return;
        }

        claims.forEach(claim => {
            receivedClaims.innerHTML += `
                <div class="item-card">
                    <h3>${claim.item?.itemName || 'Item'}</h3>
                    <p>Claimed by: ${claim.claimedBy?.name || 'Student'}</p>
                    <p>Message: ${claim.message}</p>
                    <p>Claim Status: ${claim.status}</p>

                    ${
                        claim.status === 'pending'
                        ? `
                            <button class="approve-btn"
                                data-id="${claim._id}"
                                data-status="approved">
                                Approve
                            </button>

                            <button class="reject-btn"
                                data-id="${claim._id}"
                                data-status="rejected">
                                Reject
                            </button>
                        `
                        : ''
                    }
                </div>
            `;
        });

    } catch (error) {
        receivedClaims.innerHTML =
            '<p>Unable to load received claims.</p>';
        console.log(error);
    }
}

receivedClaims.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-id]');

    if (!button) {
        return;
    }

    const claimId = button.dataset.id;
    const status = button.dataset.status;

    try {
        button.disabled = true;

        const response = await fetch(
            `http://localhost:5000/api/claims/${claimId}/status`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Unable to update claim');
        }

        alert(data.message);

        await loadReceivedClaims();
        await loadMyItems();

    } catch (error) {
        alert(error.message);
        button.disabled = false;
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

if (token) {
    loadMyItems();
    loadMyClaims();
    loadReceivedClaims();
}
