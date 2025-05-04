// bro this file LOL

document.querySelector('#btnStartRegister').addEventListener('click', (event) => {
    document.querySelector('#divLandingPage').style.display = 'none'
    document.querySelector('#frmRegistration').style.display = 'block'
})

document.querySelector('#btnStartLogin').addEventListener('click', (event) => {
    document.querySelector('#divLandingPage').style.display = 'none'
    document.querySelector('#frmLogin').style.display = 'block'
})

document.querySelector('#btnSwapLogin').addEventListener('click', (event) => {
    document.querySelector('#frmRegistration').style.display = 'none'
    document.querySelector('#frmLogin').style.display = 'block'
})

document.querySelector('#btnSwapRegistration').addEventListener('click', (event) => {
    document.querySelector('#frmLogin').style.display = 'none'
    document.querySelector('#frmRegistration').style.display = 'block'
})

document.querySelector('#btnLogout').addEventListener("click", (e) => {
    document.querySelector('#frmDashboard').style.display = 'none';
    document.querySelector('#divLandingPage').style.display = 'block';
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


document.querySelector('#btnBackStudent').addEventListener("click", (e) => {
    document.querySelector('#frmViewGroup').style.display = 'none';
    document.querySelector('#frmStudentClassView').style.display = 'block';
})

document.querySelector('#btnBackStudentReview').addEventListener("click", (e) => {
    document.querySelector('#frmViewReview').style.display = 'none';
    document.querySelector('#frmStudentClassView').style.display = 'block';
})


document.querySelector('#btnViewGroupInstructor').addEventListener("click", (e) => {
    document.querySelector('#frmInstructorClassView').style.display = 'none';
    document.querySelector('#frmViewGroupInstructor').style.display = 'block';
})

document.querySelector('#btnBackInstructorReview').addEventListener("click", (e) => {
    document.querySelector('#frmViewReviewInstructor').style.display = 'none';
    document.querySelector('#frmInstructorClassView').style.display = 'block';
})


document.querySelector('#btnCreateReview').addEventListener("click", (e) => {
    document.querySelector('#frmInstructorClassView').style.display = 'none';
    document.querySelector('#frmCreateReview').style.display = 'block';
})

document.querySelector('#btnBackCreateReview').addEventListener("click", (e) => {
    document.querySelector('#frmCreateReview').style.display = 'none';
    document.querySelector('#frmInstructorClassView').style.display = 'block';
})


document.querySelector('#btnBackWriteReview').addEventListener("click", (e) => {
    document.querySelector('#frmWriteReview').style.display = 'none';
    document.querySelector('#frmStudentClassView').style.display = 'block';
})

document.querySelector('#btnBackDummyGroup').addEventListener("click", (e) => {
    document.querySelector('#frmViewDummyGroup').style.display = 'none';
    document.querySelector('#frmViewGroupInstructor').style.display = 'block';
})
document.querySelector("#btnBackToStudentDashboard").addEventListener("click", () => {
    document.querySelector("#frmSelectReviewAssignment").style.display = "none";
    document.querySelector("#frmStudentClassView").style.display = "block";
});

document.querySelector("#btnBackInstructorFromGroupList").addEventListener("click", () => {
    document.querySelector("#frmViewGroupInstructor").style.display = "none";
    document.querySelector("#frmInstructorClassView").style.display = "block";
});

document.querySelector("#btnBackInstructorFromCreateGroup").addEventListener("click", () => {
    document.querySelector("#frmCreateGroupInstructor").style.display = "none";
    document.querySelector("#frmInstructorClassView").style.display = "block";
});


