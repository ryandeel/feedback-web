document.querySelector('#btnRegister').addEventListener("click", (e) => {
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
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Registration Success!",
            showConfirmButton: false,
            timer: 1500
        });
    }
})

document.querySelector('#btnLogin').addEventListener("click", (e) => {
    const regEmailR = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    const regPasswordR = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
    const strEmail = document.querySelector('#txtLoginEmail').value
    const strPassword = document.querySelector('#txtLoginPassword').value

    let blnGeneralErrors = false
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

    if(!blnGeneralErrors){
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Log In Success!",
            showConfirmButton: false,
            timer: 1500
        });
        fetch('dashboard.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            // Use the fetched HTML here
            // For example, you can set the innerHTML of an element with the fetched HTML
             document.querySelector('#frmLogin').style.display = 'none'
             document.querySelector('#frmDashboard').innerHTML = html;
             document.querySelector('#frmDashboard').style.display = 'block'
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
})
