const express = require('express')
const cors = require('cors')
const {v4:uuidv4} = require('uuid')
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const intSalt = 10

const dbSource = "feedback.db"
const HTTP_PORT = 5500
const db = new sqlite3.Database(dbSource)

var app = express()
app.use(cors())
app.use(express.json())

//Registration
app.post('/user',(req,res,next) => {
    let strEmail = req.body.email
    let strPassword = req.body.password
    let strFirstName = req.body.firstName
    let strLastName = req.body.lastName
    let datCreationDate = new Date().toISOString()
    let intUserID = uuidv4()
    let datLastLogin = new Date().toISOString()
    
    //testing
    // console.log("TEST:", req.body)

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    if (!emailRegex.test(strEmail)) {
        return res.status(400).json({ error: "You must provide a valid email address" });
    }

    // Validate password against NIST guidelines
    if (strPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    if (strPassword.length > 64) {
        return res.status(400).json({ error: "Password must not exceed 64 characters" });
    }
    if (/[\s]/.test(strPassword)) {
        return res.status(400).json({ error: "Password must not contain spaces" });
    }
    if (strFirstName.length < 1) {
        return res.status(400).json({ error: "First name must be at least 1 character long" });
    }
    if(strLastName.length < 1) {
        return res.status(400).json({ error: "Last name must be at least 1 character long" });
    }

    strPassword = bcrypt.hashSync(strPassword,intSalt)

    // If validations pass, proceed with user creation logic
    let strCommand = `INSERT INTO tblUsers VALUES (?,?,?,?,?,?,?)`
    db.run(strCommand, [intUserID, strFirstName, strLastName, strEmail, strPassword, datCreationDate, datLastLogin], function (err,) {
        if(err){
            console.log(err)
            res.status(400).json({
                status:"error",
                message:err.message
            })
        } else {
            res.status(200).json({
                status:"success",
            })
        }
    })
    //create a proper fetch statement for the following request
    
})

app.listen(HTTP_PORT, () => {
    console.log(`Server is running on port ${HTTP_PORT}`)
})