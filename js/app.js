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

// fetch('dashboard.html')
// .then(response => {
//     if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     return response.text();
// })
// .then(html => {
//     // Use the fetched HTML here
//     // For example, you can set the innerHTML of an element with the fetched HTML'
//     const dashboardContent = document.querySelector('#frmDashboard')
//     dashboardContent.innerHTML = html
//     dashboardContent.style.display = 'none'

//     document.querySelector('#btnLogout').addEventListener("click", (e) => {
//         document.querySelector('#frmDashboard').style.display = 'none'
//         document.querySelector('#divLandingPage').style.display = 'block'
//     })

//     document.querySelector('#btnJoinClass').addEventListener("click", (e) => {
//         document.querySelector('#frmDashboard').style.display = 'none'
//         document.querySelector('#frmJoinClass').style.display = 'block'   
//     })

//     document.querySelector('#btnCreateClass').addEventListener("click", (e) => {
//         document.querySelector('#frmDashboard').style.display = 'none'
//         document.querySelector('#frmCreateClass').style.display = 'block'   
//     })
// })
// .catch(error => {
//     console.error('Error:', error);
// });
