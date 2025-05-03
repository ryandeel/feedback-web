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

async function createCourse(objCourseData) {
    const res = await fetch('http://localhost:8000/courses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(objCourseData)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to create course.");
    return data; // contains { status: "success", courseId: "..." }
}

async function getCourseByCode(strCourseCode) {
    const res = await fetch(`http://localhost:8000/courses/${encodeURIComponent(strCourseCode)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to find course.");
    return data.course;
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

async function getAllEnrollments() {
    const response = await fetch(`${API_BASE}/enrollments`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not fetch enrollments");
    return data.enrollments;
}

async function getAllCourses() {
    const response = await fetch(`${API_BASE}/courses`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not fetch courses");
    return data.courses;
}

async function getUserEnrollments(userId) {
    const response = await fetch(`${API_BASE}/enrollments`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch enrollments");
    return data.enrollments.filter(e => e.UserID === userId);
}

async function deleteEnrollment(enrollmentId) {
    const response = await fetch(`${API_BASE}/enrollment/${enrollmentId}`, {
        method: 'DELETE'
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete enrollment");
    return data;
}

async function getCourses() {
    const response = await fetch(`${API_BASE}/courses`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch courses");
    return data.courses;
}

async function createEnrollment(objEnrollment) {
    const res = await fetch("http://localhost:8000/enrollments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(objEnrollment)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Enrollment failed.");
    return data; // includes { status: "success", enrollmentId }
}

