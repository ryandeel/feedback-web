// Function to show the navigation bar
function showNavbar() {
    document.querySelector('#navbar').style.display = 'block';
}

// Function to hide the navigation bar
function hideNavbar() {
    document.querySelector('#navbar').style.display = 'none';
}

// Add event listeners for navbar links
document.addEventListener('DOMContentLoaded', () => {
    const navDashboard = document.querySelector('#navDashboard');
    if (navDashboard) {
        navDashboard.addEventListener("click", (e) => {
            document.querySelector('#frmDashboard').style.display = 'block';
            // Hide other forms
            document.querySelector('#frmStudentClassView').style.display = 'none';
            document.querySelector('#frmInstructorClassView').style.display = 'none';
            document.querySelector('#frmLeaveClass').style.display = 'none';
            document.querySelector('#frmCreateClass').style.display = 'none';
            document.querySelector('#frmJoinClass').style.display = 'none';
            document.querySelector('#frmViewGroup').style.display = 'none';
            document.querySelector('#frmViewReview').style.display = 'none';
            document.querySelector('#frmWriteReview').style.display = 'none';
            document.querySelector('#frmViewGroupInstructor').style.display = 'none';
            document.querySelector('#frmViewReviewInstructor').style.display = 'none';
            document.querySelector('#frmCreateReview').style.display = 'none';
            document.querySelector('#divLandingPage').style.display = 'none';
            document.querySelector('#frmRegistration').style.display = 'none';
            document.querySelector('#frmLogin').style.display = 'none';
            document.querySelector('#profileCard').style.display = 'none';
            document.querySelector('#frmCreateGroupInstructor').style.display = 'none';
            document.querySelector('#frmViewReviewInstructor').style.display = 'none';
            document.querySelector('#frmCreateReview').style.display = 'none';
            document.querySelector('#frmSelectReviewAssignment').style.display = 'none';
        });
    }

    document.querySelector('#navLogout').addEventListener("click", async (e) => {
        e.preventDefault();

        // Get the session ID from localStorage
        const sessionId = localStorage.getItem('sessionId');

        if (sessionId) {
            try {
                // Call the logout API to delete the session
                const response = await fetch(`http://localhost:8000/sessions/${sessionId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error("Failed to log out.");
                }

                // Clear session data from localStorage
                localStorage.removeItem('sessionId');
                localStorage.removeItem('userId');
                localStorage.removeItem('selectedCourseId');
                localStorage.removeItem('token');       
                localStorage.removeItem('expiresAt');   

                // Redirect to the landing page
                document.querySelector('#frmDashboard').style.display = 'none';
                document.querySelector('#divLandingPage').style.display = 'block';
                hideNavbar();

                Swal.fire({
                    icon: 'success',
                    title: 'Logged out successfully!',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Logout failed',
                    text: err.message
                });
            }
        } else {
            console.warn("No session ID found in localStorage");
            // Redirect to the landing page
            document.querySelector('#frmDashboard').style.display = 'none';
            document.querySelector('#divLandingPage').style.display = 'block';
            hideNavbar();
        }
    });
    
    // Show the profile card when "My Profile" is clicked
    document.querySelector('#navProfile').addEventListener('click', async (e) => {
        const allForms = document.querySelectorAll('[id^="frm"]');
        allForms.forEach(form => form.style.display = 'none');
        document.querySelector('#divLandingPage').style.display = 'none';
        document.querySelector('#profileCard').style.display = 'block';
        const strUserId = localStorage.getItem("userId");
        if (!strUserId) {
            Swal.fire({ icon: 'error', title: 'No user ID found in storage.' });
            return;
        }
        try {
            // Fetch all users and find the current one
            const allUsers = await getAllUsers(); // Make sure this calls /users endpoint
            const currentUser = allUsers.find(u => u.UserID === strUserId);
    
            if (!currentUser) {
                Swal.fire({ icon: 'error', title: 'User not found' });
                return;
            }
    
            const strName = `${currentUser.FirstName} ${currentUser.LastName}`;
            const strEmail = currentUser.Email;
    
            // Populate profile fields
            document.querySelector("#profileName").textContent = strName;
            document.querySelector("#profileEmail").textContent = strEmail;
    
            // Load socials using email (or switch this to userId if your API supports it)
            loadUserSocials(strUserId); // or use Email if that's what your endpoint expects
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Failed to load user info', text: err.message });
        }
    });
    
    // Hide the profile card when the "Close" button is clicked
    document.querySelector('#btnCloseProfile').addEventListener('click', (e) => {
        const profileCard = document.querySelector('#profileCard');
        profileCard.style.display = 'none';
        document.querySelector('#frmDashboard').style.display = 'block';
    });
});