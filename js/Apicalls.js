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
    return data; // Assumes response contains { sessionId, userId }
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

async function getAllCourseGroups() {
    try {
      const res = await fetch("http://localhost:8000/course-groups");
      const data = await res.json();
      return data.groups || [];
    } catch (err) {
      console.error("Error fetching course groups:", err);
      return [];
    }
  }
  
  async function getAllUsers() {
    try {
      const res = await fetch("http://localhost:8000/users");
      const data = await res.json();
      return data.users || [];
    } catch (err) {
      console.error("Error fetching users:", err);
      return [];
    }
  }
  
  async function getAllGroupMembers() {
    try {
      const res = await fetch("http://localhost:8000/group-members");
      const data = await res.json();
      return data.members || [];
    } catch (err) {
      console.error("Error fetching group members:", err);
      return [];
    }
  }
  
  async function getAllAssessments() {
    try {
        const response = await fetch('http://localhost:8000/assessments');
        const data = await response.json();
        return data.assessments || []; // assumes response = { assessments: [...] }
    } catch (err) {
        console.error("Failed to get assessments:", err.message);
        return [];
    }
}

async function getAssessmentQuestions(strAssessmentId) {
    try {
        const response = await fetch(`http://localhost:8000/assessment-questions/${strAssessmentId}`);
        const data = await response.json();
        return data.questions || []; // assumes response = { questions: [...] }
    } catch (err) {
        console.error("Failed to get questions for assessment:", err.message);
        return [];
    }
}

async function getAllGroupMembers() {
    const res = await fetch("http://localhost:8000/group-members");
    const data = await res.json();
    return data.members; // or res.json() if API returns array directly
}

async function getGroupMembersForUserCourse(userId, courseId) {
    const res = await fetch(`http://localhost:8000/group-members/by-user-course/${userId}/${courseId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch group members");
    return data.members;
  }

  async function getAllAssessmentResponses() {
    const res = await fetch("http://localhost:8000/assessment-responses");
    const data = await res.json();
    return data.responses; // ✅ This ensures you're returning the actual array
}

async function getAssessmentQuestionsAll() {
    const res = await fetch("http://localhost:8000/assessment-questions");
    if (!res.ok) throw new Error("Failed to fetch assessment questions");
    const data = await res.json();
    return data.questions; // <-- fixed
}

  