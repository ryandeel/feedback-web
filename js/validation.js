// Holds questions added by instructor
const arrReviewQuestions = [];

window.addEventListener("DOMContentLoaded", async () => {
    const strToken = localStorage.getItem("token");
    const strUserId = localStorage.getItem("userId");

    if (strToken && strUserId) {
        try {
            const res = await fetch("http://localhost:8000/me", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${strToken}`
                }
            });
            if (!res.ok) throw new Error("Token verification failed");
            document.querySelector("#divLandingPage").style.display = "none";
            document.querySelector("#frmLogin").style.display = "none";
            document.querySelector("#frmDashboard").style.display = "block";
            showNavbar(); // you already call this in login
            await loadUserClasses();
        } catch (err) {
            console.error("Auto-login failed:", err);
            localStorage.clear(); // fallback: clear corrupted session
        }
    } else {
        document.querySelector("#frmLogin").style.display = "block";
    }
});


document.querySelector("#btnSaveSocials").addEventListener("click", async () => {
    const strUserID = localStorage.getItem("userId");
    const inputs = document.querySelectorAll('#socialEditContainer input');
    const regPhone = /^\d{10}$/;
    const regEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    try {
        for (const input of inputs) {
            const strSocialType = input.dataset.socialtype;
            const strUsername = input.value.trim();
            if (!strUsername) continue;
            if (strSocialType === "Phone" && !regPhone.test(strUsername)) {
                Swal.fire({ icon: "error", title: "Invalid Phone", text: "Phone number must be exactly 10 digits." });
                return;
            }

            if (strSocialType === "Teams" && !regEmail.test(strUsername)) {
                Swal.fire({ icon: "error", title: "Invalid Teams Email", text: "Teams must be a valid email address." });
                return;
            }
            // Skip empty entries
            
            await fetch("http://localhost:8000/socials", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: strUserID,
                    socialType: strSocialType,
                    username: strUsername
                })
            });
        }
        Swal.fire({ icon: "success", title: "Socials updated!" });
        document.querySelector("#editSocialsSection").style.display = "none";

        // Reload socials
        loadUserSocials(strUserID);

    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to update socials.", "error");
    }
});

async function loadUserSocials(userId) {
    try {
        const response = await fetch(`http://localhost:8000/socials/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch socials.");
        const data = await response.json();
        const arrSocials = data.socials;
         // Fill visible list
         const ul = document.querySelector("#socialList");
         ul.innerHTML = ""; // clear old
 
         arrSocials.forEach(({ SocialType, Username }) => {
             const li = document.createElement("li");
             li.className = "list-group-item";
             li.innerText = `${SocialType}: ${Username}`;
             ul.appendChild(li);
         });

        // Fill edit fields
        const divEdit = document.querySelector("#socialEditContainer");
        divEdit.innerHTML = "";
        arrSocials.forEach(({ SocialType, Username }, idx) => {
            const div = document.createElement("div");
            div.classList.add("mb-2");
            div.innerHTML = `
                <label class="form-label">${SocialType}</label>
                <input type="text" class="form-control" data-socialtype="${SocialType}" value="${Username}">
            `;
            divEdit.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Could not load socials.", "error");
    }
}
document.querySelector("#btnEditSocials").addEventListener("click", () => {
    document.querySelector("#editSocialsSection").style.display = "block";
});
document.querySelector("#btnSaveSocials").addEventListener("click", () => {
    // Perform save logic here...
    document.querySelector("#editSocialsSection").style.display = "none";
});



async function loadMyReviews() {
    const userId = localStorage.getItem("userId");
    const strCourseId = localStorage.getItem("selectedCourseId");
    const div = document.querySelector("#divDisplayStudentReviews");
    div.innerHTML = '';

    const [assessments, responses, questions, users] = await Promise.all([
        getAllAssessments(),
        getAllAssessmentResponses(),
        getAssessmentQuestionsAll(),
        getAllUsers()
    ]);

    const courseAssessments = assessments.filter(a => a.CourseID === strCourseId);
    const userResponses = responses.filter(r => r.ReviewerUserID === userId && courseAssessments.some(a => a.AssessmentID === r.AssessmentID));

    if (userResponses.length === 0) {
        div.innerHTML = "<p class='text-center'>You haven't submitted any reviews.</p>";
        return;
    }

    userResponses.forEach(resp => {
        const question = questions.find(q => q.QuestionID === resp.QuestionID);
        const target = users.find(u => u.UserID === resp.TargetUserID);
        const card = document.createElement("div");
        card.className = "card mb-3";
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title" style="color: #5651a7;">Question: ${question?.QuestionNarrative || "N/A"}</h5>
                <p><strong>About:</strong> ${target?.FirstName} ${target?.LastName}</p>
                <p><strong>Response:</strong> ${resp.Response}</p>
            </div>
        `;
        div.appendChild(card);
    });
}

async function loadPublicReviews() {
    const strCourseId = localStorage.getItem("selectedCourseId");
    const div = document.querySelector("#divDisplayStudentReviews");
    div.innerHTML = '';

    const [assessments, responses, questions, users] = await Promise.all([
        getAllAssessments(),
        getAllAssessmentResponses(),
        getAssessmentQuestionsAll(),
        getAllUsers()
    ]);

    const courseAssessments = assessments.filter(a => a.CourseID === strCourseId);
    const publicResponses = responses.filter(r => r.IsPublic === "true" && courseAssessments.some(a => a.AssessmentID === r.AssessmentID));

    if (publicResponses.length === 0) {
        div.innerHTML = "<p class='text-center'>No public reviews available.</p>";
        return;
    }

    publicResponses.forEach(resp => {
        const question = questions.find(q => q.QuestionID === resp.QuestionID);
        const reviewer = users.find(u => u.UserID === resp.ReviewerUserID);
        const target = users.find(u => u.UserID === resp.TargetUserID);
        const card = document.createElement("div");
        card.className = "card mb-3";
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title" style="color: #5651a7;">Question: ${question?.QuestionNarrative || "N/A"}</h5>
                <p><strong>From:</strong> ${reviewer?.FirstName} ${reviewer?.LastName}</p>
                <p><strong>About:</strong> ${target?.FirstName} ${target?.LastName}</p>
                <p><strong>Response:</strong> ${resp.Response}</p>
            </div>
        `;
        div.appendChild(card);
    });
}

document.querySelector("#btnShowMyReviews").addEventListener("click", loadMyReviews);
document.querySelector("#btnShowPublicReviews").addEventListener("click", loadPublicReviews);


async function loadStudentReviews() {
    const strUserID = localStorage.getItem("userId");
    const strCourseID = localStorage.getItem("selectedCourseId");
    const div = document.querySelector("#divDisplayStudentReviews");
    div.innerHTML = "";

    try {
        const assessments = await getAllAssessments();
        const responses = await getAllAssessmentResponses();
        const users = await getAllUsers();
        const questions = await getAssessmentQuestionsAll();

        const relevantAssessments = assessments.filter(a => a.CourseID === strCourseID);

        if (relevantAssessments.length === 0) {
            div.innerHTML = "<p class='text-center'>No assessments found for this course.</p>";
            return;
        }

        relevantAssessments.forEach(assessment => {
            const h3 = document.createElement("h3");
            h3.className = "mt-4";
            h3.style.color = "#5651a7";
            h3.innerText = `Assessment: ${assessment.Name}`;
            div.appendChild(h3);

            const relatedQuestions = questions.filter(q => q.AssessmentID === assessment.AssessmentID);

            // ✅ Show:
            // - responses the user wrote (ReviewerUserID === strUserID)
            // - OR any public response (IsPublic === "true")
            const visibleResponses = responses.filter(r =>
                r.AssessmentID === assessment.AssessmentID &&
                (r.ReviewerUserID === strUserID || r.IsPublic === "true")
            );

            if (visibleResponses.length === 0) {
                const p = document.createElement("p");
                p.innerText = "No responses to show.";
                div.appendChild(p);
                return;
            }

            visibleResponses.forEach(resp => {
                const from = users.find(u => u.UserID === resp.ReviewerUserID);
                const about = users.find(u => u.UserID === resp.TargetUserID);
                const question = relatedQuestions.find(q => q.QuestionID === resp.QuestionID);

                const card = document.createElement("div");
                card.className = "card mb-3";
                card.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title" style="color: #5651a7;">Question: ${question?.QuestionNarrative || "N/A"}</h5>
                        <p><strong>From:</strong> ${from?.FirstName} ${from?.LastName} (${from?.Email})</p>
                        <p><strong>About:</strong> ${about?.FirstName} ${about?.LastName} (${about?.Email})</p>
                        <p><strong>Public:</strong> ${resp.IsPublic === "true" ? "Yes" : "No"}</p>
                        <p><strong>Response:</strong> ${resp.Response}</p>
                    </div>
                `;
                div.appendChild(card);
            });
        });

    } catch (err) {
        console.error(err);
        div.innerHTML = `<p class="text-danger text-center">Failed to load your reviews: ${err.message}</p>`;
    }
}

document.querySelector("#btnViewStudentReview").addEventListener("click", () => {
    document.querySelector("#frmStudentClassView").style.display = "none";
    document.querySelector("#frmViewReview").style.display = "block";
    loadStudentReviews(); // <-- call the function here
});

async function loadInstructorReviews() {
    const strCourseId = localStorage.getItem("selectedCourseId");
    const div = document.querySelector("#divInstructoViewReview");
    div.innerHTML = ''; // Clear previous content

    try {
        const assessments = await getAllAssessments()
        const responses = await getAllAssessmentResponses()
        const users = await getAllUsers()
        const questions = await getAssessmentQuestionsAll()
        const courseAssessments = assessments.filter(a => a.CourseID === strCourseId);
        if (courseAssessments.length === 0) {
            div.innerHTML = "<p class='text-center'>No assessments found for this course.</p>";
            return;
        }

        courseAssessments.forEach(assessment => {
            const h3 = document.createElement("h3");
            h3.className = "mt-4";
            h3.style.color = "#5651a7";
            h3.innerText = `Assessment: ${assessment.Name}`;
            div.appendChild(h3);

            const assessmentResponses = responses.filter(r => r.AssessmentID === assessment.AssessmentID);
            if (assessmentResponses.length === 0) {
                const p = document.createElement("p");
                p.innerText = "No responses submitted yet.";
                div.appendChild(p);
                return;
            }

            const relatedQuestions = questions.filter(q => q.AssessmentID === assessment.AssessmentID);

            assessmentResponses.forEach(resp => {
                console.log("Response Object:", resp);
                const user = users.find(u => u.UserID === resp.ReviewerUserID);
                const target = users.find(u => u.UserID === resp.TargetUserID);
                const question = relatedQuestions.find(q => q.QuestionID === resp.QuestionID);
                const card = document.createElement("div");
                card.className = "card mb-3";
                card.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title" style="color: #5651a7;">Question: ${question?.QuestionNarrative || "N/A"}</h5>
                        <p><strong>From:</strong> ${user?.FirstName} ${user?.LastName} (${user?.Email})</p>
                        <p><strong>About:</strong> ${target?.FirstName} ${target?.LastName} (${target?.Email})</p>
                        <p><strong>Public:</strong> ${resp.IsPublic === "true" ? "Yes" : "No"}</p>
                        <p><strong>Response:</strong> ${resp.Response}</p>
                    </div>
                `;
                div.appendChild(card);
            });
        });

    } catch (err) {
        console.error(err);
        div.innerHTML = `<p class='text-danger text-center'>Failed to load reviews: ${err.message}</p>`;
    }
}

document.querySelector("#btnViewInstructorReview").addEventListener("click", () => {
    document.querySelector("#frmInstructorClassView").style.display = "none";
    document.querySelector("#frmViewReviewInstructor").style.display = "block";
    loadInstructorReviews(); // ← This loads all the reviews
});


async function loadTargetUsers(strAssessmentType) {
    const strCourseID = localStorage.getItem("selectedCourseId");
    const strUserID = localStorage.getItem("userId");
    const selectTarget = document.querySelector("#selectReviewTarget");

    selectTarget.innerHTML = ''; // Clear existing options

    if (strAssessmentType === "Peer") {
        try {
            const members = await getGroupMembersForUserCourse(strUserID, strCourseID);
    
            if (members.length === 0) {
                selectTarget.innerHTML = `<option disabled selected>No group members found</option>`;
                return;
            }
    
            members.forEach(user => {
                const opt = document.createElement("option");
                opt.value = user.UserID;
                opt.text = `${user.FirstName} ${user.LastName} (${user.Email})`;
                selectTarget.appendChild(opt);
            });
    
        } catch (err) {
            console.error(err);
            selectTarget.innerHTML = `<option disabled selected>Error loading group members</option>`;
        }
    } else if (strAssessmentType === "Instructor") {
        // Only show the instructor
        const allCourses = await getCourses();
        const course = allCourses.find(c => c.CourseID === strCourseID);

        if (!course) {
            selectTarget.innerHTML = `<option disabled selected>Instructor not found</option>`;
            return;
        }

        const instructorID = course.CreatedBy;
        const allUsers = await getAllUsers();
        const instructor = allUsers.find(u => u.UserID === instructorID);

        if (instructor) {
            const opt = document.createElement("option");
            opt.value = instructor.UserID;
            opt.text = `${instructor.FirstName} ${instructor.LastName} (Instructor)`;
            selectTarget.appendChild(opt);
        }
    }
}


async function loadReviewForm(strAssessmentID) {
    const div = document.querySelector("#divReviewQuestions");
    const questions = await getAssessmentQuestions(strAssessmentID); // GET /assessment-questions/:id
    div.innerHTML = '';

    if (questions.length === 0) {
        div.innerHTML = "<p>No questions found.</p>";
        return;
    }

    questions.forEach(q => {
        const wrapper = document.createElement("div");
        wrapper.className = "mb-3";

        const label = document.createElement("label");
        label.innerText = q.QuestionNarrative;
        wrapper.appendChild(label);

        if (q.QuestionType === "Short Answer") {
            const input = document.createElement("input");
            input.type = "text";
            input.className = "form-control";
            input.dataset.questionId = q.QuestionID;
            wrapper.appendChild(input);
        }
        else if (q.QuestionType === "Multiple Choice") {
            const options = Array.isArray(q.Options) ? q.Options : JSON.parse(q.Options || "[]");
        
            options.forEach(optText => {
                const optDiv = document.createElement("div");
                optDiv.className = "form-check";
        
                const radio = document.createElement("input");
                radio.type = "radio";  // ✅ use "radio" not "checkbox"
                radio.name = q.QuestionID; // ✅ same name groups options
                radio.value = optText;
                radio.dataset.questionId = q.QuestionID;
                radio.className = "form-check-input";
        
                const label = document.createElement("label");
                label.className = "form-check-label";
                label.innerText = optText;
        
                optDiv.appendChild(radio);
                optDiv.appendChild(label);
                wrapper.appendChild(optDiv);
            });
        }
        else if (q.QuestionType === "Likert Scale") {
            const strQuestionID = q.QuestionID;
        
            // Likert options
            const likertOptions = [
                { label: "Strongly Disagree"},
                { label: "Disagree"},
                { label: "Neutral"},
                { label: "Agree"},
                { label: "Strongly Agree"}
            ];
        
            // Container for horizontal layout
            const scaleWrapper = document.createElement("div");
            scaleWrapper.className = "d-flex justify-content-between mt-2";
            scaleWrapper.style.gap = "10px";
        
            likertOptions.forEach(option => {
                const div = document.createElement("div");
                div.className = "text-center";
        
                const input = document.createElement("input");
                input.type = "radio";
                input.name = strQuestionID;
                input.value = option.label;
                input.dataset.questionId = strQuestionID;
        
                const lbl = document.createElement("label");
                lbl.innerText = option.label;
                lbl.className = "form-label d-block small";
        
                div.appendChild(input);
                div.appendChild(lbl);
                scaleWrapper.appendChild(div);
            });
        
            wrapper.appendChild(scaleWrapper);
        }                
        div.appendChild(wrapper);
    });
}


async function loadAvailableAssignments() {
    const strCourseID = localStorage.getItem("selectedCourseId");
    const allAssessments = await getAllAssessments(); // assumes GET /assessments
    const filtered = allAssessments.filter(a => a.CourseID === strCourseID);

    const div = document.querySelector('#divAvailableAssignments');
    div.innerHTML = '';

    if (filtered.length === 0) {
        div.innerHTML = "<p class='text-center'>No assignments available.</p>";
        return;
    }

    filtered.forEach(a => {
        const btn = document.createElement('button');
        btn.className = "btn col-12 mb-3";
        btn.type = "button"
        btn.style = "color:#5651a7; border-color:gray;";
        btn.innerText = `${a.Name} (${a.Type})`;
        btn.addEventListener('click', () => {
            localStorage.setItem("selectedAssessmentId", a.AssessmentID);
            loadReviewForm(a.AssessmentID);  // show the fill-out form
            loadTargetUsers(a.Type)
            document.querySelector('#frmSelectReviewAssignment').style.display = 'none';
            document.querySelector('#frmWriteReview').style.display = 'block';
        });
        div.appendChild(btn);
    });
}

document.querySelector('#btnWriteReview').addEventListener("click", (e) => {
    document.querySelector('#frmStudentClassView').style.display = 'none';
    document.querySelector('#frmSelectReviewAssignment').style.display = 'block';
    loadAvailableAssignments(); //  CALL HERE
});

document.querySelector("#btnWriteReviewSubmit").addEventListener("click", async () => {
    const strAssessmentID = localStorage.getItem("selectedAssessmentId");
    const strUserID = localStorage.getItem("userId");
    const strTargetUserID = document.querySelector("#selectReviewTarget").value;
    const blnIsPublic = !document.querySelector("#checkPrivate").checked;
    const questionWrappers = document.querySelectorAll("#divReviewQuestions > div");

    if (!strTargetUserID) {
        Swal.fire({ icon: "error", title: "Missing Target", text: "Please select someone to review." });
        return;
    }

    if (questionWrappers.length === 0) {
        Swal.fire({ icon: "error", title: "No Questions", text: "No questions found to answer." });
        return;
    }

    try {
        for (const wrapper of questionWrappers) {
            const input = wrapper.querySelector("input, textarea, select");
            const strQuestionID = input?.dataset.questionId;

            let strResponse = "";

            if (!strQuestionID) continue;

            if (input.type === "radio") {
                const selected = wrapper.querySelector(`input[name="${strQuestionID}"]:checked`);
                if (!selected) {
                    Swal.fire({
                        icon: "error",
                        title: "Incomplete Review",
                        text: "Please answer all questions before submitting."
                    });
                    return;
                }
                strResponse = selected.value;
            } else {
                strResponse = input.value.trim();
                if (!strResponse) {
                    Swal.fire({
                        icon: "error",
                        title: "Incomplete Review",
                        text: "Please answer all questions before submitting."
                    });
                    return;
                }
            }

            await fetch("http://localhost:8000/assessment-responses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assessmentId: strAssessmentID,
                    questionId: strQuestionID,
                    userId: strUserID,
                    targetUserId: strTargetUserID,
                    response: strResponse,
                    public: blnIsPublic
                })
            });
        }

        Swal.fire({
            icon: "success",
            title: "Review submitted!",
            timer: 1500,
            showConfirmButton: false
        });

        // Reset form and go back
        document.querySelector('#frmWriteReview').style.display = 'none';
        document.querySelector('#frmStudentClassView').style.display = 'block';
        document.querySelector("#divReviewQuestions").innerHTML = "";

    } catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", title: "Submit failed", text: err.message });
    }
});



async function loadStudentGroupMembers() {
    const strUserId = localStorage.getItem("userId");
    const strCourseId = localStorage.getItem("selectedCourseId");
    const div = document.querySelector("#divGroupMembers");

    if (!strUserId || !strCourseId) {
        div.innerHTML = "<p class='text-center text-danger'>Missing user or course information.</p>";
        return;
    }

    const allGroupMembers = await getAllGroupMembers();  // GET /group-members
    const allGroups = await getAllCourseGroups();        // GET /course-groups
    const allUsers = await getAllUsers();                // GET /users

    const studentGroup = allGroups.find(group =>
        group.CourseID === strCourseId &&
        allGroupMembers.some(m => m.GroupID === group.GroupID && m.UserID === strUserId)
    );

    div.innerHTML = "";

    if (!studentGroup) {
        div.innerHTML = "<p class='text-center'>You are not assigned to a group yet.</p>";
        return;
    }

    const groupMembers = allGroupMembers.filter(m => m.GroupID === studentGroup.GroupID);

    const ul = document.createElement("ul");
    ul.classList.add("list-group");

    groupMembers.forEach(member => {
        const user = allUsers.find(u => u.UserID === member.UserID);
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.innerText = `${user?.FirstName || "Unknown"} ${user?.LastName || ""} (${user?.Email || "N/A"})`;

        // Add click event to fetch and display socials
        li.addEventListener("click", async () => {
            const socials = await fetchSocials(user.UserID);
            displaySocialsModal(user, socials);
        });

        ul.appendChild(li);
    });

    div.appendChild(ul);
}

// Fetch socials for a specific user
async function fetchSocials(userId) {
    try {
        const res = await fetch(`http://localhost:8000/socials/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch socials.");
        const data = await res.json();
        console.log("Socials fetched:", data); //debugging
        return data.socials;
    } catch (err) {
        console.error(err);
        return [];
    }
}

// Display socials in a modal
function displaySocialsModal(user, socials) {
    const modalContent = `
        <h5>${user.FirstName} ${user.LastName}'s Socials</h5>
        <ul class="no-bullets" style="list-style-type: none;">
            ${socials.map(social => `<li><strong>${social.SocialType}:</strong> ${social.Username}</li>`).join("")}
        </ul>
    `;

    Swal.fire({
        title: "Socials",
        html: modalContent,
        icon: "info",
        confirmButtonText: "Close"
    });
}

document.querySelector('#btnViewGroup').addEventListener("click", (e) => {
    document.querySelector('#frmStudentClassView').style.display = 'none';
    document.querySelector('#frmViewGroup').style.display = 'block';
    loadStudentGroupMembers(); // ← Call the function here
});


document.querySelector("#btnCreateReviewSubmit").addEventListener("click", async () => {
    const strReviewTitle = document.querySelector("#txtReviewTitle").value.trim();
    const strStartDate = document.querySelector("#dtReviewStart").value;
    const strDueDate = document.querySelector("#dtReviewDue").value;
    const strReviewType = document.querySelector("#selReviewType").value;
    const strCourseID = localStorage.getItem("selectedCourseId");

    document.querySelector("#txtReviewPromptError").innerText = "";

    if (!strReviewTitle || !strStartDate || !strDueDate || strReviewType === "Select Review Type") {
        document.querySelector("#txtReviewPromptError").innerText = "* Please complete all fields";
        return;
    }

    if (arrReviewQuestions.length === 0) {
        Swal.fire({ icon: 'error', title: 'Add at least one question before submitting' });
        return;
    }

    try {
        // Step 1: Create the assessment
        const res = await fetch("http://localhost:8000/assessments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                courseId: strCourseID,
                name: strReviewTitle,
                type: strReviewType,
                status: "Open",
                startDate: new Date(strStartDate).toISOString(),
                dueDate: new Date(strDueDate).toISOString(),
                endDate: new Date(strDueDate).toISOString() // Use dueDate also as endDate
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create assessment");

        const strAssessmentID = data.assessmentId;

        // Step 2: Add each question
        for (let question of arrReviewQuestions) {
            await fetch("http://localhost:8000/assessment-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assessmentId: strAssessmentID,
                    questionType: question.questionType,
                    questionNarrative: question.questionNarrative,
                    helperText: question.helperText,
                    options: question.options // backend expects this to be an array, it will JSON.stringify it
                })
            });
        }

        Swal.fire({ icon: "success", title: "Review assignment created successfully!" });

        // Reset form + UI
        arrReviewQuestions.length = 0;
        document.querySelector("#ulReviewQuestions").innerHTML = "";
        document.querySelector("#txtReviewTitle").value = "";
        document.querySelector("#dtReviewStart").value = "";
        document.querySelector("#dtReviewDue").value = "";
        document.querySelector("#selReviewType").selectedIndex = 0;
        document.querySelector("#frmCreateReview").style.display = "none";
        document.querySelector("#frmInstructorClassView").style.display = "block";

    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error creating review', text: err.message });
    }
});


document.querySelector("#btnAddQuestion").addEventListener("click", () => {
    const strQuestionText = document.querySelector("#txtQuestionText").value.trim();
    const strQuestionType = document.querySelector("#selQuestionType").value;
    const strOptions = document.querySelector("#txtQuestionOptions").value.trim();

    const ul = document.querySelector("#ulReviewQuestions");

    if (!strQuestionText || strQuestionType === "Select Question Type") {
        Swal.fire({ icon: 'error', title: 'Missing info', text: 'Please enter a question and type' });
        return;
    }

    if (strQuestionType === "Multiple Choice" && !strOptions) {
        Swal.fire({ icon: 'error', title: 'Missing options', text: 'Provide comma-separated options' });
        return;
    }

    // Create question object
    const questionObj = {
        questionType: strQuestionType,
        questionNarrative: strQuestionText,
        options: strQuestionType === "Multiple Choice" ? strOptions.split(",").map(o => o.trim()) : [],
        helperText: ""
    };

    // Save and display
    arrReviewQuestions.push(questionObj);

    const li = document.createElement("li");
    li.className = "list-group-item";
    li.innerText = `${strQuestionType}: ${strQuestionText}` + (questionObj.options.length ? ` [${questionObj.options.join(", ")}]` : "");
    ul.appendChild(li);

    // Clear inputs
    document.querySelector("#txtQuestionText").value = '';
    document.querySelector("#txtQuestionOptions").value = '';
    document.querySelector("#selQuestionType").selectedIndex = 0;
});


async function loadGroupMembers(groupID, groupName) {
    const div = document.querySelector("#divDummyGroupMembers");
    const allMembers = await getAllGroupMembers();
    const allUsers = await getAllUsers();
    console.log("All members:", allMembers);
    const membersInGroup = allMembers.filter(m => m.GroupID === groupID);
    div.innerHTML = "";

    const title = document.querySelector("#frmViewingGroupInstructor h2");
    title.innerText = `${groupName} Members`;

    if (membersInGroup.length === 0) {
        div.innerHTML = "<p class='text-center'>No members in this group yet.</p>";
        return;
    }

    const ul = document.createElement("ul");
    ul.classList.add("list-group");

    membersInGroup.forEach(member => {
        const user = allUsers.find(u => u.UserID === member.UserID);
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.innerText = `${user?.FirstName || "Unknown"} ${user?.LastName || ""} (${user?.Email || "N/A"})`;
        li.addEventListener("click", async () => {
            const socials = await fetchSocials(user.UserID);
            displaySocialsModal(user, socials);
        });
        ul.appendChild(li);
    });

    div.appendChild(ul);
}
// View Group Members Form Logic
async function loadInstructorGroups() {
    const strCourseID = localStorage.getItem("selectedCourseId");
    if (!strCourseID) return;

    const allGroups = await getAllCourseGroups(); // GET /course-groups

    const divGroupMembers = document.querySelector("#divGroupMembersInstructor");
    divGroupMembers.innerHTML = "";

    const groupsForCourse = allGroups.filter(g => g.CourseID === strCourseID);

    if (groupsForCourse.length === 0) {
        divGroupMembers.innerHTML = `<h5 class="text-center" style="color:#5651a7;">No groups created yet</h5>`;
        return;
    }

    groupsForCourse.forEach(group => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn col-12 mt-3";
        btn.style = "color:#5651a7; border-color:gray; font-weight:bold;";
        btn.innerText = group.GroupName;
        btn.addEventListener("click", () => {
            localStorage.setItem("selectedGroupID", group.GroupID);
            loadGroupMembers(group.GroupID, group.GroupName);
            document.querySelector("#frmViewGroupInstructor").style.display = "none";
            document.querySelector("#frmViewingGroupInstructor").style.display = "block";
        });
        divGroupMembers.appendChild(btn);
    });
}



// Show group list when instructor clicks "View Groups"
document.querySelector("#btnViewGroupInstructor").addEventListener("click", () => {
    document.querySelector("#frmInstructorClassView").style.display = "none";
    document.querySelector("#frmViewGroupInstructor").style.display = "block";
    loadInstructorGroups();
});


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


document.querySelector('#btnRegister').addEventListener("click", async (e) => {
    e.preventDefault();
    const regEmailR = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    const regPasswordR = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    const strFirstName = document.querySelector('#txtFirstName').value;
    const strLastName = document.querySelector('#txtLastName').value;
    const strEmail = document.querySelector('#txtEmail').value;
    const strPassword = document.querySelector('#txtPassword').value;
    const strConfirmPassword = document.querySelector('#txtConfirmPassword').value;
    const strTeams = document.querySelector('#txtTeams').value;
    const strDiscord = document.querySelector('#txtDiscord').value.trim();
    const strPhone = document.querySelector('#txtPhone').value.trim();

    let blnGeneralErrors = false;
    let blnEmailError = false;
    let blnFirstNameError = false;
    let blnLastNameError = false;
    let blnPasswordError = false;
    let blnConfirmPasswordError = false;
    let blnTeamsError = false;
    let strEmailError = '';
    let strFirstNameError = '';
    let strLastNameError = '';
    let strPasswordError = '';
    let strConfirmPasswordError = '';
    let strTeamsError = '';
    let blnPhoneError = false;
    let strPhoneError = '';

    const regPhoneR = /^\d{10}$/; // Adjust this pattern if needed

    if (strPhone && !regPhoneR.test(strPhone)) {
        blnPhoneError = true;
        blnGeneralErrors = true;
        strPhoneError = "* Phone number must be 10 digits";
    }
    if (!regEmailR.test(strEmail)) {
        blnEmailError = true;
        blnGeneralErrors = true;
        strEmailError = "* Email address must be valid";
    }

    if (!regEmailR.test(strTeams)) {
        blnTeamsError = true;
        blnGeneralErrors = true;
        strTeamsError = "* Must be an Email address";
    }

    if (strFirstName.length < 1) {
        blnFirstNameError = true;
        blnGeneralErrors = true;
        strFirstNameError = "* Must enter a first name";
    }

    if (strLastName.length < 1) {
        blnLastNameError = true;
        blnGeneralErrors = true;
        strLastNameError = "* Must enter a last name";
    }

    if (!regPasswordR.test(strPassword)) {
        blnPasswordError = true;
        blnGeneralErrors = true;
        strPasswordError += "<p style='color: #ff0033;' class='mt-1 mb-0'>* Password must be at least 8 characters</p>";
        strPasswordError += "<p style='color: #ff0033;' class='mt-1 mb-0'>* Password must include at least one digit</p>";
        strPasswordError += "<p style='color: #ff0033;' class='mt-1 mb-0'>* Password must have at least one uppercase and one lowercase letter</p>";
        strPasswordError += "<p style='color: #ff0033;' class='mt-1 mb-3'>* Password must have at least one alphabetic character</p>";
    }

    if (strConfirmPassword != strPassword) {
        blnConfirmPasswordError = true;
        blnGeneralErrors = true;
        strConfirmPasswordError = '* Passwords must be matching';
    }


    if (blnEmailError == true) {
        document.querySelector('#txtEmailError').innerText = strEmailError;
        document.querySelector('#txtEmail').classList.add("is-invalid");
    }
    else if (blnEmailError == false) {
        document.querySelector('#txtEmailError').innerText = '';
        document.querySelector('#txtEmail').classList.remove("is-invalid");
    }

    if (blnTeamsError == true) {
        document.querySelector('#txtTeamsError').innerText = strTeamsError;
        document.querySelector('#txtTeams').classList.add("is-invalid");
    }
    else if (blnTeamsError == false) {
        document.querySelector('#txtTeamsError').innerText = '';
        document.querySelector('#txtTeams').classList.remove("is-invalid");
    }

    if (blnFirstNameError == true) {
        document.querySelector('#txtFirstNameError').innerText = strFirstNameError;
        document.querySelector('#txtFirstName').classList.add("is-invalid");
    }
    else if (blnFirstNameError == false) {
        document.querySelector('#txtFirstNameError').innerText = '';
        document.querySelector('#txtFirstName').classList.remove("is-invalid");
    }

    if (blnLastNameError == true) {
        document.querySelector('#txtLastNameError').innerText = strLastNameError;
        document.querySelector('#txtLastName').classList.add("is-invalid");
    }
    else if (blnLastNameError == false) {
        document.querySelector('#txtLastNameError').innerText = '';
        document.querySelector('#txtLastName').classList.remove("is-invalid");
    }

    if (blnPasswordError == true) {
        document.querySelector('#divPasswordErrors').innerHTML = strPasswordError;
        document.querySelector('#txtPassword').classList.add("is-invalid");
    }
    else if (blnPasswordError == false) {
        document.querySelector('#divPasswordErrors').innerHTML = '';
        document.querySelector('#txtPassword').classList.remove("is-invalid");
    }

    if (blnConfirmPasswordError == true) {
        document.querySelector('#txtConfirmPasswordError').innerText = strConfirmPasswordError;
        document.querySelector('#txtConfirmPassword').classList.add("is-invalid");
    }
    else if (blnConfirmPasswordError == false) {
        document.querySelector('#txtConfirmPasswordError').innerText = '';
        document.querySelector('#txtConfirmPassword').classList.remove("is-invalid");
    }
    if (blnPhoneError) {
        document.querySelector('#txtPhone').classList.add("is-invalid");
        document.querySelector('#txtPhoneError').innerText = strPhoneError;
    } else {
        document.querySelector('#txtPhone').classList.remove("is-invalid");
        document.querySelector('#txtPhoneError').innerText = '';
    }

    if (!blnGeneralErrors) {
        try {
            const data = await createUser({
                firstName: strFirstName,
                lastName: strLastName,
                email: strEmail,
                password: strPassword
            });

            if (strDiscord) {
                await fetch("http://localhost:8000/socials", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userEmail: strEmail,
                        socialType: "Discord",
                        username: strDiscord
                    })
                });
            }

            if (strTeams) {
                await fetch("http://localhost:8000/socials", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userEmail: strEmail,
                        socialType: "Teams",
                        username: strTeams
                    })
                });
            }

            if (strPhone) {
                await fetch("http://localhost:8000/socials", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userEmail: strEmail,
                        socialType: "Phone",
                        username: strPhone
                    })
                });
            }

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Registration Success!",
                showConfirmButton: false,
                timer: 1500
            });

        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Registration failed', text: err.message });
        }
    }

});

document.querySelector('#btnLogin').addEventListener("click", async (e) => {
    e.preventDefault();

    // Validation logic
    const regEmailR = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    const regPasswordR = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    const strEmail = document.querySelector('#txtLoginEmail').value;
    const strPassword = document.querySelector('#txtLoginPassword').value;

    let blnGeneralErrors = false;
    let blnEmailError = false;
    let blnPasswordError = false;
    let strEmailError = '';
    let strPasswordError = '';

    if (!regEmailR.test(strEmail)) {
        blnEmailError = true;
        blnGeneralErrors = true;
        strEmailError = "* Invalid Username";
    }

    if (strPassword.length < 8) {
        blnPasswordError = true;
        blnGeneralErrors = true;
        strPasswordError += "<p style='color: #ff0033;' class='mt-1 mb-0'>* Invalid Password</p>";
    }

    if (blnEmailError) {
        document.querySelector('#txtLoginEmailError').innerText = strEmailError;
        document.querySelector('#txtLoginEmail').classList.add("is-invalid");
    } else {
        document.querySelector('#txtLoginEmailError').innerText = '';
        document.querySelector('#txtLoginEmail').classList.remove("is-invalid");
    }

    if (blnPasswordError) {
        document.querySelector('#divLoginPasswordErrors').innerHTML = strPasswordError;
        document.querySelector('#txtLoginPassword').classList.add("is-invalid");
    } else {
        document.querySelector('#divLoginPasswordErrors').innerHTML = '';
        document.querySelector('#txtLoginPassword').classList.remove("is-invalid");
    }

    // If validation passes, proceed with login
    if (!blnGeneralErrors) {
        try {
            const response = await createSession({ email: strEmail, password: strPassword });
            localStorage.setItem('sessionId', response.sessionId); // Store session ID
            localStorage.setItem('userId', response.userId); // Store user ID
            localStorage.setItem('token', response.token);          // ✅ Store token
            localStorage.setItem('expiresAt', response.expiresAt);  // Optional: if you want to expire it later

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Log In Success!",
                showConfirmButton: false,
                timer: 1500
            });

            document.querySelector('#frmLogin').style.display = 'none';
            document.querySelector('#frmDashboard').style.display = 'block';
            showNavbar();
            loadUserClasses(); // Load user-specific classes
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Login failed",
                text: err.message
            });
        }
    }
});

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

            await loadUserClasses();

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
                courseTerm: strCourseTerm ,
                createdBy: localStorage.getItem("userId")
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
            await loadUserClasses(); // <- dynamically refresh course buttons

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
        await loadUserClasses()
    } catch (err) {
        Swal.fire({ icon: "error", title: "Failed to leave class", text: err.message });
    }
});
