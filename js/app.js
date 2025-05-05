// bro this file LOL

document.querySelector('#btnStartRegister').addEventListener('click', (event) => {
    document.querySelector('#divLandingPage').style.display = 'none';
    document.querySelector('#frmRegistration').style.display = 'block';
});

document.querySelector('#btnStartLogin').addEventListener('click', (event) => {
    document.querySelector('#divLandingPage').style.display = 'none';
    document.querySelector('#frmLogin').style.display = 'block';
});

document.querySelector('#btnSwapLogin').addEventListener('click', (event) => {
    document.querySelector('#frmRegistration').style.display = 'none';
    document.querySelector('#frmLogin').style.display = 'block';
});

document.querySelector('#btnSwapRegistration').addEventListener('click', (event) => {
    document.querySelector('#frmLogin').style.display = 'none';
    document.querySelector('#frmRegistration').style.display = 'block';
});

document.querySelector('#btnLogout').addEventListener("click", (e) => {
    document.querySelector('#frmDashboard').style.display = 'none';
    document.querySelector('#divLandingPage').style.display = 'block';
    hideNavbar();
});

document.querySelector('#btnJoinClass').addEventListener("click", (e) => {
    document.querySelector('#frmDashboard').style.display = 'none';
    document.querySelector('#frmJoinClass').style.display = 'block';
});

document.querySelector('#btnCreateClass').addEventListener("click", (e) => {
    document.querySelector('#frmDashboard').style.display = 'none';
    document.querySelector('#frmCreateClass').style.display = 'block';
});

document.querySelector('#btnSwapCreateClass').addEventListener("click", (e) => {
    document.querySelector('#frmJoinClass').style.display = 'none';
    document.querySelector('#frmCreateClass').style.display = 'block';
});

document.querySelector('#btnSwapJoinClass').addEventListener("click", (e) => {
    document.querySelector('#frmCreateClass').style.display = 'none';
    document.querySelector('#frmJoinClass').style.display = 'block';
});

document.querySelector('#btnLeaveClass').addEventListener("click", async (e) => {
    const userId = localStorage.getItem("userId");
    const enrollments = await getUserEnrollments(userId);
    const courses = await getCourses();
    const select = document.querySelector('#selectLeaveClass');

    // Clear and populate dropdown
    select.innerHTML = `<option selected>Select Class</option>`;
    enrollments.forEach(enroll => {
        const course = courses.find(c => c.CourseID === enroll.CourseID);
        if (course) {
            const option = document.createElement('option');
            option.value = enroll.EnrollmentID; // store enrollment ID
            option.text = `${course.CourseName} (${course.CourseNumber})`;
            select.appendChild(option);
        }
    });
    document.querySelector('#frmDashboard').style.display = 'none';
    document.querySelector('#frmLeaveClass').style.display = 'block';
})

document.querySelector('#btnTempClassInstructor').addEventListener("click", (e) => {
    document.querySelector('#frmDashboard').style.display = 'none';
    document.querySelector('#frmInstructorClassView').style.display = 'block';
});

document.querySelector('#btnTempClassStudent').addEventListener("click", (e) => {
    document.querySelector('#frmDashboard').style.display = 'none';
    document.querySelector('#frmStudentClassView').style.display = 'block';
});

document.querySelector('#btnReturnDashboard').addEventListener("click", (e) => {
    document.querySelector('#frmStudentClassView').style.display = 'none';
    document.querySelector('#frmDashboard').style.display = 'block';
});

document.querySelector('#btnReturnInstructorDashboard').addEventListener("click", (e) => {
    document.querySelector('#frmInstructorClassView').style.display = 'none';
    document.querySelector('#frmDashboard').style.display = 'block';
})

document.querySelector('#btnBackToDashboardLeave').addEventListener("click", (e) => {
    document.querySelector('#frmLeaveClass').style.display = 'none';
    document.querySelector('#frmDashboard').style.display = 'block';
})

document.querySelector('#btnBackToDashboardJoin').addEventListener("click", (e) => {
    document.querySelector('#frmJoinClass').style.display = 'none';
    document.querySelector('#frmDashboard').style.display = 'block';
})

document.querySelector('#btnBackToDashboardCreate').addEventListener("click", (e) => {
    document.querySelector('#frmCreateClass').style.display = 'none';
    document.querySelector('#frmDashboard').style.display = 'block';
})

document.querySelector('#btnViewGroup').addEventListener("click", (e) => {
    document.querySelector('#frmStudentClassView').style.display = 'none';
    document.querySelector('#frmViewGroup').style.display = 'block';
})

document.querySelector('#btnViewStudentReview').addEventListener("click", (e) => {
    document.querySelector('#frmStudentClassView').style.display = 'none';
    document.querySelector('#frmViewReview').style.display = 'block';
})

document.querySelector('#btnViewGroupInstructor').addEventListener("click", (e) => {
    document.querySelector('#frmInstructorClassView').style.display = 'none';
    document.querySelector('#frmViewGroupInstructor').style.display = 'block';
})


document.querySelector('#btnCreateReview').addEventListener("click", (e) => {
    document.querySelector('#frmInstructorClassView').style.display = 'none';
    document.querySelector('#frmCreateReview').style.display = 'block';
})

document.querySelector('#btnWriteReview').addEventListener("click", (e) => {
    document.querySelector('#frmStudentClassView').style.display = 'none';
    document.querySelector('#frmSelectReviewAssignment').style.display = 'block';
})

// Log In button functionality
document.querySelector('#btnLogin').addEventListener("click", (e) => {
    const isValidLogin = true; // Replace this with the actual validation result from validation.js

    if (isValidLogin) {
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Log In Success!",
            showConfirmButton: false,
            timer: 1500
        });

        // Show the dashboard and navigation bar
        document.querySelector('#frmLogin').style.display = 'none';
        document.querySelector('#frmDashboard').style.display = 'block';
        showNavbar();
    }
});

// Log Out button functionality
document.querySelector('#btnLogout').addEventListener("click", (e) => {
    document.querySelector('#frmDashboard').style.display = 'none';
    document.querySelector('#divLandingPage').style.display = 'block';
    hideNavbar();
});

// Navigation bar links
document.querySelector('#navDashboard').addEventListener("click", (e) => {
    document.querySelector('#frmDashboard').style.display = 'block';
    document.querySelector('#frmStudentClassView').style.display = 'none';
    document.querySelector('#frmInstructorClassView').style.display = 'none';
});

document.querySelector('#navLogout').addEventListener("click", (e) => {
    document.querySelector('#frmDashboard').style.display = 'none';
    document.querySelector('#divLandingPage').style.display = 'block';
    hideNavbar();
});

// Function to show the navigation bar
function showNavbar() {
    document.querySelector('#navbar').style.display = 'block';
}

// Function to hide the navigation bar
function hideNavbar() {
    document.querySelector('#navbar').style.display = 'none';
}