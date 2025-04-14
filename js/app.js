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