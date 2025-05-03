async function loadAvailableStudentsForGroup() {
    const strCourseId = localStorage.getItem("selectedCourseId");
    const strUserId = localStorage.getItem("userId");
    if (!strCourseId || !strUserId) return;

    try {
        const allEnrollments = await getAllEnrollments(); // from apicalls.js
        const courseEnrollments = allEnrollments.filter(e => e.CourseID === strCourseId && e.UserID !== strUserId);

        //
        const allUsers = await (await fetch("http://localhost:8000/users")).json();
        const enrolledUsers = courseEnrollments.map(enroll => allUsers.users.find(u => u.UserID === enroll.UserID)).filter(Boolean);

        const select = document.querySelector("#selectGroupStudents");
        select.innerHTML = '';

        enrolledUsers.forEach(user => {
            const option = document.createElement("option");
            option.value = user.UserID;
            option.text = `${user.FirstName} ${user.LastName} (${user.Email})`;
            select.appendChild(option);
        });

    } catch (err) {
        console.error("Failed to load students for group:", err.message);
    }
}

document.querySelector("#btnCreateGroupInstructor").addEventListener("click", () => {
    document.querySelector("#frmInstructorClassView").style.display = "none";
    document.querySelector("#frmCreateGroupInstructor").style.display = "block";
    loadAvailableStudentsForGroup();
});

document.querySelector('#btnSubmitCreateGroup').addEventListener('click', async () => {
    const strGroupName = document.querySelector('#txtGroupName').value.trim();
    const select = document.querySelector('#selectGroupStudents');
    const arrSelectedUserIDs = Array.from(select.selectedOptions).map(opt => opt.value);

    const strCourseID = localStorage.getItem("selectedCourseId");
    console.log(strCourseID)

    // Clear errors
    document.querySelector('#txtGroupNameError').innerText = '';
    document.querySelector('#selectGroupStudentsError').innerText = '';

    let blnErrors = false;

    if (!strCourseID) {
        Swal.fire({ icon: 'error', title: 'No course selected' });
        return;
    }

    if (!strGroupName) {
        document.querySelector('#txtGroupNameError').innerText = "* Group name required";
        blnErrors = true;
    }

    if (arrSelectedUserIDs.length === 0) {
        document.querySelector('#selectGroupStudentsError').innerText = "* Select at least one student";
        blnErrors = true;
    }

    if (blnErrors) return;

    try {
        // Step 1: Create group
        const groupRes = await fetch('http://localhost:8000/course-groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupName: strGroupName, courseId: strCourseID })
        });

        const groupData = await groupRes.json();
        if (!groupRes.ok) throw new Error(groupData.error || 'Group creation failed');

        const strGroupID = groupData.groupId;

        // Step 2: Add each student to the group
        for (let userId of arrSelectedUserIDs) {
            await fetch('http://localhost:8000/group-members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId: strGroupID, userId })
            });
        }

        Swal.fire({ icon: 'success', title: 'Group created and students added!' });
        document.querySelector('#frmCreateGroupInstructor').style.display = 'none';
        document.querySelector('#frmInstructorClassView').style.display = 'block';

    } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Group creation failed', text: err.message });
    }
});





async function loadInstructorClassView() {
    const strCourseId = localStorage.getItem("selectedCourseId");
    if (!strCourseId) return;

    const courses = await getCourses();
    const course = courses.find(c => c.CourseID === strCourseId);
    if (!course) return;

    document.querySelector('#instructorClassTitle').innerText = `${course.CourseName} (${course.CourseNumber})`;
    // Populate more fields as needed
}
async function loadStudentClassView() {
    const strCourseId = localStorage.getItem("selectedCourseId");
    if (!strCourseId) return;

    const courses = await getCourses();
    const course = courses.find(c => c.CourseID === strCourseId);
    if (!course) return;

    document.querySelector('#studentClassTitle').innerText = `${course.CourseName} (${course.CourseNumber})`;
    // Populate more fields as needed
}

async function loadUserClasses() {
    const strUserID = localStorage.getItem("userId");
    if (!strUserID) return;

    try {
        const arrCourses = await getAllCourses();
        const arrEnrollments = await getUserEnrollments(strUserID);

        // Instructor-created courses
        const arrInstructorCourses = arrCourses.filter(course => course.CreatedBy === strUserID);

        // Courses where user is enrolled (student)
        const enrolledCourseIDs = arrEnrollments.map(e => e.CourseID);
        const arrStudentCourses = arrCourses.filter(course =>
            enrolledCourseIDs.includes(course.CourseID) && course.CreatedBy !== strUserID
        );

        const divClasses = document.querySelector('#divClasses');
        divClasses.innerHTML = '';

        if (arrInstructorCourses.length === 0 && arrStudentCourses.length === 0) {
            divClasses.innerHTML = `<h5 style="color:#5651a7;">No classes enrolled or created</h5>`;
        }

        // Render instructor (created) classes
        arrInstructorCourses.forEach(course => {
            const btn = document.createElement("button");
            btn.className = "btn col-md-6 col-lg-auto fs-6";
            btn.type = "button";
            btn.style = "min-width: 200px; height:115px; border-color:gray; color:#5651a7; font-weight:bold;";
            btn.innerText = `Instructor: ${course.CourseName} (${course.CourseNumber})`;
            btn.addEventListener("click", () => {
                localStorage.setItem("selectedCourseId", course.CourseID);
                localStorage.setItem("selectedCourseRole", "instructor");
                document.querySelector('#frmDashboard').style.display = 'none';
                document.querySelector('#frmInstructorClassView').style.display = 'block';
                loadInstructorClassView(); 
            });
            divClasses.appendChild(btn);
        });

        // Render student (enrolled) classes
        arrStudentCourses.forEach(course => {
            const btn = document.createElement("button");
            btn.className = "btn col-md-6 col-lg-auto fs-6";
            btn.type = "button";
            btn.style = "min-width: 200px; height:115px; border-color:gray; color:#5651a7; font-weight:bold;";
            btn.innerText = `Student: ${course.CourseName} (${course.CourseNumber})`;
            btn.addEventListener("click", () => {
                localStorage.setItem("selectedCourseId", course.CourseID);
                localStorage.setItem("selectedCourseRole", "student");
                document.querySelector('#frmDashboard').style.display = 'none';
                document.querySelector('#frmStudentClassView').style.display = 'block';
                loadStudentClassView();
            });
            divClasses.appendChild(btn);
        });

    } catch (err) {
        console.error("Failed to load classes:", err.message);
    }
}


document.querySelector('#btnRegister').addEventListener("click", (e) => {
    e.preventDefault();
    const regEmailR = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    const regPasswordR = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
    const strFirstName = document.querySelector('#txtFirstName').value
    const strLastName = document.querySelector('#txtLastName').value
    const strEmail = document.querySelector('#txtEmail').value
    const strPassword = document.querySelector('#txtPassword').value
    const strConfirmPassword = document.querySelector('#txtConfirmPassword').value

    let blnGeneralErrors = false
    let blnEmailError = false
    let blnFirstNameError = false
    let blnLastNameError = false
    let blnPasswordError = false
    let blnConfirmPasswordError = false
    let strEmailError = ''
    let strFirstNameError = ''
    let strLastNameError = ''
    let strPasswordError = ''
    let strConfirmPasswordError = ''

    if(!regEmailR.test(strEmail)){
        blnEmailError = true
        blnGeneralErrors = true
        strEmailError = "* Email address must be valid"
    }

    if(strFirstName.length < 1){
        blnFirstNameError = true
        blnGeneralErrors = true
        strFirstNameError = "* Must enter a first name"
    }

    if(strLastName.length < 1){
        blnLastNameError = true
        blnGeneralErrors = true
        strLastNameError = "* Must enter a last name"
    }

    if(!regPasswordR.test(strPassword)){
        blnPasswordError = true
        blnGeneralErrors = true
        strPasswordError += "<p style='color: #ff0033;' class='mt-1 mb-0'>* Password must be at least 8 characters</p>"
        strPasswordError += "<p style='color: #ff0033;' class='mt-1 mb-0'>* Password must include at least one digit</p>"
        strPasswordError += "<p style='color: #ff0033;' class='mt-1 mb-0'>* Password must have at least one uppercase and one lowercase letter</p>"
        strPasswordError += "<p style='color: #ff0033;' class='mt-1 mb-3'>* Password must have at least one alphabetic character</p>"
    }

    if(strConfirmPassword != strPassword){
        blnConfirmPasswordError = true
        blnGeneralErrors = true
        strConfirmPasswordError = '* Passwords must be matching'
    }


    if(blnEmailError == true){
        document.querySelector('#txtEmailError').innerText = strEmailError
        document.querySelector('#txtEmail').classList.add("is-invalid")
    }
    else if(blnEmailError == false){
        document.querySelector('#txtEmailError').innerText = ''
        document.querySelector('#txtEmail').classList.remove("is-invalid")
    }

    if(blnFirstNameError == true){
        document.querySelector('#txtFirstNameError').innerText = strFirstNameError
        document.querySelector('#txtFirstName').classList.add("is-invalid")
    }
    else if(blnFirstNameError == false){
        document.querySelector('#txtFirstNameError').innerText = ''
        document.querySelector('#txtFirstName').classList.remove("is-invalid")
    }

    if(blnLastNameError == true){
        document.querySelector('#txtLastNameError').innerText = strLastNameError
        document.querySelector('#txtLastName').classList.add("is-invalid")
    }
    else if(blnLastNameError == false){
        document.querySelector('#txtLastNameError').innerText = ''
        document.querySelector('#txtLastName').classList.remove("is-invalid")
    }

    if(blnPasswordError == true){
        document.querySelector('#divPasswordErrors').innerHTML = strPasswordError
        document.querySelector('#txtPassword').classList.add("is-invalid")
    }
    else if(blnPasswordError == false){
        document.querySelector('#divPasswordErrors').innerHTML = ''
        document.querySelector('#txtPassword').classList.remove("is-invalid")
    }

    if(blnConfirmPasswordError == true){
        document.querySelector('#txtConfirmPasswordError').innerText = strConfirmPasswordError
        document.querySelector('#txtConfirmPassword').classList.add("is-invalid")
    }
    else if(blnConfirmPasswordError == false){
        document.querySelector('#txtConfirmPasswordError').innerText = ''
        document.querySelector('#txtConfirmPassword').classList.remove("is-invalid")
    }
    if(!blnGeneralErrors){
        createUser({
            firstName: strFirstName,
            lastName: strLastName,
            email: strEmail,
            password: strPassword
        }).then(data => {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Registration Success!",
                showConfirmButton: false,
                timer: 1500
            });
        }).catch(err => {
            Swal.fire({ icon: 'error', title: 'Registration failed', text: err.message });
        });
    }
})

document.querySelector('#btnLogin').addEventListener("click", (e) => {
    const regEmailR = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    const regPasswordR = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
    const strEmail = document.querySelector('#txtLoginEmail').value
    const strPassword = document.querySelector('#txtLoginPassword').value

    var blnGeneralErrors = false
    let blnEmailError = false
    let blnPasswordError = false
    let strEmailError = ''
    let strPasswordError = ''

    if(!regEmailR.test(strEmail)){
        blnEmailError = true
        blnGeneralErrors = true
        strEmailError = "* Invalid Username"
    }

    if(strPassword.length < 8){
        blnPasswordError = true
        blnGeneralErrors = true
        strPasswordError += "<p style='color: #ff0033;' class='mt-1 mb-0'>* Invalid Password</p>"
    }

    if(blnEmailError == true){
        document.querySelector('#txtLoginEmailError').innerText = strEmailError
        document.querySelector('#txtLoginEmail').classList.add("is-invalid")
    }
    else if(blnEmailError == false){
        document.querySelector('#txtLoginEmailError').innerText = ''
        document.querySelector('#txtLoginEmail').classList.remove("is-invalid")
    }

    if(blnPasswordError == true){
        document.querySelector('#divLoginPasswordErrors').innerHTML = strPasswordError
        document.querySelector('#txtLoginPassword').classList.add("is-invalid")
    }
    else if(blnPasswordError == false){
        document.querySelector('#divLoginPasswordErrors').innerHTML = ''
        document.querySelector('#txtLoginPassword').classList.remove("is-invalid")
    }

    if (!blnGeneralErrors) {
        createSession({
            email: strEmail,
            password: strPassword
        }).then(data => {
            Swal.fire({
                icon: 'success',
                title: 'Login successful!',
                timer: 1000,
                showConfirmButton: false
            });
    
            // You can store userId here if needed:
            localStorage.setItem("userId", data.userId);
            document.querySelector('#frmLogin').style.display = 'none';
            document.querySelector('#frmDashboard').style.display = 'block';
            loadUserClasses();
        }).catch(err => {
            Swal.fire({
                icon: 'error',
                title: 'Login failed',
                text: err.message
            });
        });
    }
    
})

document.querySelector('#btnJoinClassSubmit').addEventListener("click", async (e) => {
    const strClassCode = document.querySelector('#txtClassCode').value
    const strClassCodeError = document.querySelector('#txtClassCodeError')
    let blnGeneralErrors = false
    let blnClassCodeError = false

    if(strClassCode.length < 1){
        blnClassCodeError = true
        blnGeneralErrors = true
        strClassCodeError.innerText = "* Must enter a class code"
    }
    else{
        strClassCodeError.innerText = ''
        blnClassCodeError = false
    }

    if(!blnGeneralErrors){
        try {
            // Step 1: Get course by code using API wrapper
            const course = await getCourseByCode(strClassCode);
            const strCourseID = course.CourseID;
            const strUserID = localStorage.getItem("userId")
            // Step 2: Create enrollment using API wrapper
            await createEnrollment({
                courseId: strCourseID,
                userId: strUserID
            });

            // Step 3: Success feedback
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Joined Class!",
                showConfirmButton: false,
                timer: 1500
            });

            document.querySelector('#frmJoinClass').style.display = 'none';
            document.querySelector('#frmDashboard').style.display = 'block';

            // Optional: refresh class list
            // await loadUserClasses();

        } catch (err) {
            Swal.fire({ icon: "error", title: "Join failed", text: err.message });
        }
    }
})

document.querySelector('#btnCreateClassSubmit').addEventListener("click", async (e) => {
    e.preventDefault();
    let blnGeneralErrors = false

    const strClassName = document.querySelector('#txtClassName').value
    const strClassCode = document.querySelector('#txtCreateClassCode').value
    const strCourseNumber = document.querySelector('#txtCourseNumber').value.trim();
    const strCourseSection = document.querySelector('#txtCourseSection').value.trim();
    const strCourseTerm = document.querySelector('#txtCourseTerm').value.trim();
    document.querySelector('#txtClassNameError').innerText = '';
    document.querySelector('#txtCreateCodeError').innerText = '';
    document.querySelector('#txtCourseNumberError').innerText = '';
    document.querySelector('#txtCourseSectionError').innerText = '';
    document.querySelector('#txtCourseTermError').innerText = '';
    if(strClassName.length < 1){
        blnGeneralErrors = true
        document.querySelector('#txtClassNameError').innerText = "* Must enter a class name"
    }

    if(strClassCode.length < 1){
        blnGeneralErrors = true
        document.querySelector('#txtCreateCodeError').innerText = "* Must enter a class code"
    }
    if (strCourseNumber.length < 1) {
        blnGeneralErrors = true;
        document.querySelector('#txtCourseNumberError').innerText = "* Must enter a course number";
    }

    if (strCourseSection.length < 1) {
        blnGeneralErrors = true;
        document.querySelector('#txtCourseSectionError').innerText = "* Must enter a section";
    }

    if (strCourseTerm.length < 1) {
        blnGeneralErrors = true;
        document.querySelector('#txtCourseTermError').innerText = "* Must enter a term";
    }

    if(!blnGeneralErrors){
        try {
            const response = await createCourse({
                courseName: strClassName,
                courseCode: strClassCode,
                courseNumber: strCourseNumber,
                courseSection: strCourseSection,
                courseTerm: strCourseTerm
            });

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Class Created!",
                showConfirmButton: false,
                timer: 1500
            });

            document.querySelector('#frmCreateClass').style.display = 'none';
            document.querySelector('#frmDashboard').style.display = 'block';

        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Failed to create class',
                text: 'Class code already exists or invalid input.'
            });
        }
    }
})

document.querySelector('#btnLeaveClassSubmit').addEventListener("click", async (e) => {
    const select = document.querySelector('#selectLeaveClass');
    const enrollmentId = select.value;

    if (!enrollmentId || enrollmentId === "Select Class") {
        Swal.fire({ icon: "error", title: "Please select a class to leave." });
        return;
    }

    try {
        await deleteEnrollment(enrollmentId);

        Swal.fire({
            icon: "success",
            title: "You left the class.",
            timer: 1500,
            showConfirmButton: false
        });

        // dashboard view
        document.querySelector('#frmLeaveClass').style.display = 'none';
        document.querySelector('#frmDashboard').style.display = 'block';
    } catch (err) {
        Swal.fire({ icon: "error", title: "Failed to leave class", text: err.message });
    }
});
