const API_BASE = 'http://localhost:8000'; // adjust if hosted elsewhere
// Create a new user
async function createUser(objUser) {
    const response = await fetch(`${API_BASE}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(objUser)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'User creation failed');
    return data;
}

async function createSession(objCredentials) {
    const response = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(objCredentials)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    return data;
}

