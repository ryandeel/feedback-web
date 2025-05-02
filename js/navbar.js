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
    
    // Show the profile card when "My Profile" is clicked
    document.querySelector('#navProfile').addEventListener('click', (e) => {
        document.querySelector('#profileCard').style.display = 'block';
        document.querySelector('#frmDashboard').style.display = 'none';
    });
    
    // Hide the profile card when the "Close" button is clicked
    document.querySelector('#btnCloseProfile').addEventListener('click', (e) => {
        const profileCard = document.querySelector('#profileCard');
        profileCard.style.display = 'none';
        // Optional: Show dashboard again when closing profile
        document.querySelector('#frmDashboard').style.display = 'block';
    });
});