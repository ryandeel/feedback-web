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

//add a an event listener for a dashboard button and have it fetch the dashboard html
document.querySelector('#btnLogin').addEventListener('click', (event) => {
    fetch('/dashboard.html')
    .then(response => response.text())
    .then(html => {
        const objScript = document.createElement('script');
        objScript.src = 'js/validation.js'; 
        objScript.type = 'text/javascript';
    })
    .catch(error => console.error("Error fetching chart:", error));
})

// fetch('../dashboard.html')
// .then(response => {
//     if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     return response.text();
// })
// .then(html => {
//     // Use the fetched HTML here
//     // For example, you can set the innerHTML of an element with the fetched HTML
//     document.querySelector('#frmDashboard').innerHTML = html;
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
