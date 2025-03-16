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