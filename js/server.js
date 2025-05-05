//note to self do sessions and logs functions
//do put for password seperate
const express = require('express')
const cors = require('cors')
const {v4:uuidv4} = require('uuid')
const sqlite3 = require('sqlite3').verbose()
const path = require('path');
const dbSource = path.join(__dirname, '..', 'feedback.db');
const HTTP_PORT = 8000
const bcrypt = require('bcrypt')
const intSalt = 10;
const jwt = require('jsonwebtoken');
const strSecret = 'Mickey2025!Goofy2023!'; // keep this in env in prod
const db = new sqlite3.Database(dbSource, (err) => {
    if (err) console.error("DB connection error:", err.message);
    else 
    {
      console.log("Connected to SQLite DB.");
      db.run("PRAGMA foreign_keys = ON");
    }
  });
var app = express()
app.use(cors())
app.use(express.json())
app.post('/user', (req,res,next) => {
const strUserID = uuidv4();
const strFirstName = req.body.firstName?.trim();
const strLastName = req.body.lastName?.trim();
const strEmail = req.body.email?.trim().toLowerCase();
let strPassword = req.body.password;
if (!strFirstName || !strLastName || !strEmail || !strPassword) {
    return res.status(400).json({ error: "All fields are required." });
}

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(strEmail)) {
return res.status(400).json({ error: "You must provide a valid email address" });
}

// NIST password validation
if (strPassword.length < 8) {
return res.status(400).json({ error: "Password must be at least 8 characters long" });
}
if (!/[A-Z]/.test(strPassword)) {
return res.status(400).json({ error: "Password must contain at least one uppercase letter" });
}
if (!/[a-z]/.test(strPassword)) {
return res.status(400).json({ error: "Password must contain at least one lowercase letter" });
}
if (!/[0-9]/.test(strPassword)) {
return res.status(400).json({ error: "Password must contain at least one number" });
}


const strHashedPassword = bcrypt.hashSync(strPassword, intSalt);
const strTimestamp = new Date().toISOString();
const strSQL = `INSERT INTO tblUsers (UserID, FirstName, LastName, Email, PasswordHash, CreationDate, LastLogin) VALUES (?, ?, ?, ?, ?, ?, ?)`
const arrParams = [strUserID,strFirstName,strLastName,strEmail,strHashedPassword,strTimestamp,strTimestamp]
db.run(strSQL, arrParams, function (err) {
    if (err) {
      console.error("DB Error:", err.message);
      return res.status(400).json({ status: "error", message: err.message });
    }

    return res.status(201).json({
      status: "success",
      userId: strUserID
    })
  })
})

app.post('/phone', (req, res, next) => {
    const strPhoneID = uuidv4();
    const strUserEmail = req.body.userEmail?.trim().toLowerCase();
    const strNationCode = req.body.nationCode?.trim();
    const strAreaCode = req.body.areaCode?.trim();
    const strPhoneNumber = req.body.phoneNumber?.trim();
    const strStatus = req.body.status?.trim();
  
    // ✅ Required field check
    if (!strUserEmail || !strNationCode || !strAreaCode || !strPhoneNumber || !strStatus) {
      return res.status(400).json({ error: "All fields are required." });
    }
  
    // ✅ Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(strUserEmail)) {
      return res.status(400).json({ error: "Invalid email format." });
    }
  
    // ✅ Nation code format: + followed by 1–3 digits
    const nationCodeRegex = /^\+\d{1,3}$/;
    if (!nationCodeRegex.test(strNationCode)) {
      return res.status(400).json({ error: "Nation code must be in format +1, +44, etc." });
    }
  
    // ✅ Area code: exactly 3 digits
    if (!/^\d{3}$/.test(strAreaCode)) {
      return res.status(400).json({ error: "Area code must be exactly 3 digits (e.g., 615)." });
    }
  
    // ✅ Phone number: 3 digits + dash + 4 digits
    if (!/^\d{3}-\d{4}$/.test(strPhoneNumber)) {
      return res.status(400).json({ error: "Phone number must be in format XXX-XXXX (e.g., 555-1234)." });
    }
  
    // ✅ Confirm user email exists in tblUsers
    const strCheckSQL = `SELECT * FROM tblUsers WHERE Email = ?`;
    db.get(strCheckSQL, [strUserEmail], (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Database error checking email." });
      }
      if (!row) {
        return res.status(400).json({ error: "Email does not exist in users table." });
      }
  
      // ✅ Insert phone record
      const strSQL = `
        INSERT INTO tblPhone 
        (PhoneID, Email, NationCode, AreaCode, PhoneNumber, Status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
  
      const arrParams = [
        strPhoneID,
        strUserEmail,
        strNationCode,
        strAreaCode,
        strPhoneNumber,
        strStatus
      ];
  
      db.run(strSQL, arrParams, function (err) {
        if (err) {
          console.error("DB Error:", err.message);
          return res.status(400).json({ status: "error", message: err.message });
        }
  
        return res.status(201).json({
          status: "success",
          phoneId: strPhoneID
        });
      });
    });
  });

app.post("/socials", (req, res) => {
const strSocialID = uuidv4();
const strUserEmail = req.body.userEmail?.trim().toLowerCase();
const strSocialType = req.body.socialType?.trim();
const strUsername = req.body.username?.trim();

// ✅ Basic validation
if (!strUserEmail || !strSocialType || !strUsername) {
    return res.status(400).json({ error: "All fields are required." });
}

// ✅ Email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(strUserEmail)) {
    return res.status(400).json({ error: "Invalid email format." });
}

// ✅ Supported social types
const arrAllowedTypes = ["Discord", "Teams", "Phone"];
if (!arrAllowedTypes.includes(strSocialType)) {
    return res.status(400).json({ error: "Unsupported social type." });
}

// ✅ Check that the user email exists in tblUsers
const strCheckSQL = `SELECT * FROM tblUsers WHERE Email = ?`;
db.get(strCheckSQL, [strUserEmail], (err, row) => {
    if (err) {
    return res.status(500).json({ error: "Database error when checking user email." });
    }
    if (!row) {
    return res.status(400).json({ error: "User email does not exist in tblUsers." });
    }

    // ✅ Insert into tblSocials
    const strSQL = `
    INSERT INTO tblSocials (SocialID, Email, SocialType, Username)
    VALUES (?, ?, ?, ?)
    `;
    const arrParams = [strSocialID, strUserEmail, strSocialType, strUsername];

    db.run(strSQL, arrParams, function (err) {
    if (err) {
        console.error("DB Error:", err.message);
        return res.status(400).json({ status: "error", message: err.message });
    }

    return res.status(201).json({
        status: "success",
        socialId: strSocialID
    });
    });
});
});

app.post("/logs", (req, res) => {
    const strLogID = uuidv4();
    const strLogType = req.body.logType?.trim();
    const strDescription = req.body.description?.trim();
    const strTimestamp = new Date().toISOString();
  
    // Validate input
    if (!strLogType || !strDescription) {
      return res.status(400).json({ error: "Log type and description are required." });
    }
  
    const strSQL = `
      INSERT INTO tblLogs (LogID, LogDateTime, Type, Description)
      VALUES (?, ?, ?, ?)
    `;
    const arrParams = [strLogID, strTimestamp, strLogType, strDescription];
  
    db.run(strSQL, arrParams, function (err) {
      if (err) {
        console.error("DB Error:", err.message);
        return res.status(400).json({ status: "error", message: err.message });
      }
  
      return res.status(201).json({
        status: "success",
        logId: strLogID
      });
    });
  });

  app.post("/course-groups", (req, res) => {
    const strGroupID = uuidv4();
    const strGroupName = req.body.groupName?.trim();
    const strCourseID = req.body.courseId?.trim();
    const strCreationDate = new Date().toISOString();
  
    // Validation
    if (!strGroupName || !strCourseID) {
      return res.status(400).json({ error: "Group name and course ID are required." });
    }
  
    // Check if the course exists
    const strCheckSQL = `SELECT * FROM tblCourses WHERE CourseID = ?`;
    db.get(strCheckSQL, [strCourseID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Error checking course ID." });
      }
      if (!row) {
        return res.status(400).json({ error: "Course ID does not exist." });
      }
  
      // Insert into tblCourseGroups
      const strSQL = `
        INSERT INTO tblCourseGroups (GroupID, GroupName, CourseID, CreationDate)
        VALUES (?, ?, ?, ?)
      `;
      const arrParams = [strGroupID, strGroupName, strCourseID, strCreationDate];
  
      db.run(strSQL, arrParams, function (err) {
        if (err) {
          console.error("DB Error:", err.message);
          return res.status(400).json({ status: "error", message: err.message });
        }
  
        return res.status(201).json({
          status: "success",
          groupId: strGroupID
        });
      });
    });
  });

  app.post("/courses", (req, res) => {
    const strCourseID = uuidv4();
    const strCourseName = req.body.courseName?.trim();
    const strCourseNumber = req.body.courseNumber?.trim();
    const strCourseSection = req.body.courseSection?.trim();
    const strCourseTerm = req.body.courseTerm?.trim();
    const strCourseCode = req.body.courseCode?.trim();
    const strCreatedBy = req.body.createdBy?.trim();
  
    // Basic validation
    if (!strCourseName || !strCourseNumber || !strCourseSection || !strCourseTerm || !strCourseCode || !strCreatedBy) {
      return res.status(400).json({ error: "All fields are required." });
    }
  
    const strSQL = `
      INSERT INTO tblCourses (
        CourseID, CourseName, CourseNumber, CourseSection, CourseTerm, CourseCode, CreatedBy
      ) VALUES (?, ?, ?, ?, ?, ?,?)
    `;
  
    const arrParams = [
      strCourseID,
      strCourseName,
      strCourseNumber,
      strCourseSection,
      strCourseTerm,
      strCourseCode,
      strCreatedBy
    ];
  
    db.run(strSQL, arrParams, function (err) {
      if (err) {
        console.error("DB Error:", err.message);
        return res.status(400).json({ status: "error", message: err.message });
      }
  
      return res.status(201).json({
        status: "success",
        courseId: strCourseID
      });
    });
  });
  
  app.post("/group-members", (req, res) => {
    const strMemberID = uuidv4();
    const strGroupID = req.body.groupId?.trim();
    const strUserID = req.body.userId?.trim();
    const strJoinDate = new Date().toISOString();
  
    if (!strGroupID || !strUserID) {
      return res.status(400).json({ error: "Group ID and User ID are required." });
    }
  
    const strGroupCheck = `SELECT * FROM tblCourseGroups WHERE GroupID = ?`;
    const strUserCheck = `SELECT * FROM tblUsers WHERE UserID = ?`;
  
    db.get(strGroupCheck, [strGroupID], (err, group) => {
      if (err) return res.status(500).json({ error: "Error checking group ID." });
      if (!group) return res.status(400).json({ error: "Group ID does not exist." });
  
      db.get(strUserCheck, [strUserID], (err, user) => {
        if (err) return res.status(500).json({ error: "Error checking user ID." });
        if (!user) return res.status(400).json({ error: "User ID does not exist." });
  
        const strSQL = `
          INSERT INTO tblGroupMembers (MembershipID, GroupID, UserID, JoinDate)
          VALUES (?, ?, ?, ?)
        `;
        const arrParams = [strMemberID, strGroupID, strUserID, strJoinDate];
  
        db.run(strSQL, arrParams, function (err) {
          if (err) {
            console.error("DB Error:", err.message);
            return res.status(400).json({ status: "error", message: err.message });
          }
  
          return res.status(201).json({
            status: "success",
            memberId: strMemberID
          });
        });
      });
    });
  });

  app.post("/enrollments", (req, res) => {
    const strEnrollmentID = uuidv4();
    const strCourseID = req.body.courseId?.trim();
    const strUserID = req.body.userId?.trim();
    const strEnrollmentDate = new Date().toISOString();
  
    if (!strCourseID || !strUserID) {
      return res.status(400).json({ error: "Course ID and User ID are required." });
    }
  
    const strCheckCourse = `SELECT * FROM tblCourses WHERE CourseID = ?`;
    const strCheckUser = `SELECT * FROM tblUsers WHERE UserID = ?`;
  
    db.get(strCheckCourse, [strCourseID], (err, course) => {
      if (err) return res.status(500).json({ error: "Error checking course ID." });
      if (!course) return res.status(400).json({ error: "Course not found." });
  
      db.get(strCheckUser, [strUserID], (err, user) => {
        if (err) return res.status(500).json({ error: "Error checking user ID." });
        if (!user) return res.status(400).json({ error: "User not found." });
  
        const strSQL = `
          INSERT INTO tblEnrollments (EnrollmentID, CourseID, UserID, EnrollmentDate)
          VALUES (?, ?, ?, ?)
        `;
        const arrParams = [strEnrollmentID, strCourseID, strUserID, strEnrollmentDate];
  
        db.run(strSQL, arrParams, function (err) {
          if (err) {
            console.error("DB Error:", err.message);
            return res.status(400).json({ status: "error", message: err.message });
          }
  
          return res.status(201).json({
            status: "success",
            enrollmentId: strEnrollmentID
          });
        });
      });
    });
  });

  app.post("/assessments", (req, res) => {
    const strAssessmentID = uuidv4();
    const strCourseID = req.body.courseId?.trim();
    const strName = req.body.name?.trim();
    const strStatus = req.body.status?.trim();
    const strType = req.body.type?.trim();
    const strStartDate = req.body.startDate?.trim();
    const strDueDate = req.body.dueDate?.trim();
    const strEndDate = req.body.endDate?.trim();
    const strCreationDate = new Date().toISOString();
  
    if (!strCourseID || !strName || !strStatus || !strType || !strStartDate || !strDueDate || !strEndDate) {
      return res.status(400).json({ error: "All fields are required." });
    }
  
    const strCourseCheckSQL = `SELECT * FROM tblCourses WHERE CourseID = ?`;
    db.get(strCourseCheckSQL, [strCourseID], (err, course) => {
      if (err) return res.status(500).json({ error: "Error checking course." });
      if (!course) return res.status(400).json({ error: "Course does not exist." });
  
      const strInsertSQL = `
        INSERT INTO tblAssessments (
          AssessmentID, CourseID, Name, Status, Type,
          StartDate, DueDate, EndDate, CreationDate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const arrParams = [
        strAssessmentID,
        strCourseID,
        strName,
        strStatus,
        strType,
        strStartDate,
        strDueDate,
        strEndDate,
        strCreationDate
      ];
  
      db.run(strInsertSQL, arrParams, function (err) {
        if (err) {
          console.error("DB Error:", err.message);
          return res.status(400).json({ status: "error", message: err.message });
        }
  
        return res.status(201).json({
          status: "success",
          assessmentId: strAssessmentID
        });
      });
    });
  });
  
  app.post("/assessment-questions", (req, res) => {
    const strQuestionID = uuidv4();
    const strAssessmentID = req.body.assessmentId?.trim();
    const strQuestionType = req.body.questionType?.trim();
    const strOptions = req.body.options ? JSON.stringify(req.body.options) : null;
    const strNarrative = req.body.questionNarrative?.trim();
    const strHelperText = req.body.helperText?.trim();
  
    // Basic validation
    if (!strAssessmentID || !strQuestionType || !strNarrative) {
      return res.status(400).json({ error: "Assessment ID, type, and narrative are required." });
    }
  
    // Check if the assessment exists
    const strCheckSQL = `SELECT * FROM tblAssessments WHERE AssessmentID = ?`;
    db.get(strCheckSQL, [strAssessmentID], (err, row) => {
      if (err) return res.status(500).json({ error: "Error checking assessment ID." });
      if (!row) return res.status(400).json({ error: "Assessment does not exist." });
  
      // Insert the question
      const strSQL = `
        INSERT INTO tblAssessmentQuestions (
          QuestionID, AssessmentID, QuestionType, Options,
          QuestionNarrative, HelperText
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
  
      const arrParams = [
        strQuestionID,
        strAssessmentID,
        strQuestionType,
        strOptions,
        strNarrative,
        strHelperText
      ];
  
      db.run(strSQL, arrParams, function (err) {
        if (err) {
          console.error("DB Error:", err.message);
          return res.status(400).json({ status: "error", message: err.message });
        }
  
        return res.status(201).json({
          status: "success",
          questionId: strQuestionID
        });
      });
    });
  });

  app.post("/assessment-responses", (req, res) => {
    const strResponseID = uuidv4();
    const strAssessmentID = req.body.assessmentId?.trim();
    const strQuestionID = req.body.questionId?.trim();
    const strUserID = req.body.userId?.trim();
    const strTargetUserID = req.body.targetUserId?.trim();
    const strResponse = req.body.response?.trim();
    const strPublic = req.body.public?.toString().toLowerCase() === "true" ? "true" : "false";
    const strSubmitDate = new Date().toISOString();
  
    // Validate required fields
    if (!strAssessmentID || !strQuestionID || !strUserID || !strTargetUserID || !strResponse) {
      return res.status(400).json({ error: "All fields are required." });
    }
  
    const strCheckUserSQL = `SELECT * FROM tblUsers WHERE UserID = ?`;
    const strCheckTargetSQL = `SELECT * FROM tblUsers WHERE UserID = ?`;
  
    // Check UserID exists
    db.get(strCheckUserSQL, [strUserID], (err, userRow) => {
      if (err) return res.status(500).json({ error: "Error checking UserID." });
      if (!userRow) return res.status(400).json({ error: "UserID does not exist." });
  
      // Check TargetUserID exists
      db.get(strCheckTargetSQL, [strTargetUserID], (err, targetRow) => {
        if (err) return res.status(500).json({ error: "Error checking TargetUserID." });
        if (!targetRow) return res.status(400).json({ error: "TargetUserID does not exist." });
  
        // Insert response
        const strInsertSQL = `
          INSERT INTO tblAssessmentResponse (
            ResponseID, AssessmentID, QuestionID, ReviewerUserID,
            TargetUserID, Response, isPublic, ResponseDate
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
  
        const arrParams = [
          strResponseID,
          strAssessmentID,
          strQuestionID,
          strUserID,
          strTargetUserID,
          strResponse,
          strPublic,
          strSubmitDate
        ];
  
        db.run(strInsertSQL, arrParams, function (err) {
          if (err) {
            console.error("DB Error:", err.message);
            return res.status(400).json({ status: "error", message: err.message });
          }
  
          return res.status(201).json({
            status: "success",
            responseId: strResponseID
          });
        });
      });
    });
  });

//   function verifyToken(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });
  
//     const token = authHeader.split(' ')[1];
//     if (!token) return res.status(401).json({ error: "Missing token" });
  
//     jwt.verify(token, strSecret, (err, decoded) => {
//       if (err) return res.status(401).json({ error: "Invalid or expired token" });
  
//       req.user = decoded;
//       next();
//     });
//   }
  
  app.post("/sessions", (req, res) => {
    const strEmail = req.body.email?.trim().toLowerCase();
    const strPassword = req.body.password;
  
    if (!strEmail || !strPassword) {
      return res.status(400).json({ error: "Email and password are required." });
    }
  
    const strCheckSQL = `SELECT UserID, PasswordHash FROM tblUsers WHERE Email = ?`;
  
    db.get(strCheckSQL, [strEmail], (err, row) => {
      if (err) return res.status(500).json({ error: "Database error." });
      if (!row) return res.status(401).json({ error: "Invalid email or password." });
  
      const strUserID = row.UserID;
      const strHashed = row.PasswordHash;
  
      if (!bcrypt.compareSync(strPassword, strHashed)) {
        return res.status(401).json({ error: "Invalid email or password." });
      }
  
      const strSessionID = uuidv4();
      const strStartTime = new Date().toISOString();
      const strEndTime = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12h
      const strStatus = "Active";
  
      // JWT token
      const strToken = jwt.sign(
        {
          userId: strUserID,
          sessionId: strSessionID
        },
        strSecret,
        { expiresIn: '12h' }
      );
  
      const strInsertSQL = `
        INSERT INTO tblSessions (SessionID, UserID, StartTime, EndTime, Status, SessionToken)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const arrParams = [
        strSessionID,
        strUserID,
        strStartTime,
        strEndTime,
        strStatus,
        strToken
      ];
  
      db.run(strInsertSQL, arrParams, function (err) {
        if (err) {
          console.error("DB Error:", err.message);
          return res.status(400).json({ status: "error", message: err.message });
        }
  
        return res.status(201).json({
          status: "success",
          userId: strUserID,
          sessionId: strSessionID,
          token: strToken,
          expiresAt: strEndTime
        });
      });
    });
  });
  
  //deletes

  //user
  app.delete('/user/:userId', (req, res) => {
    const strUserID = req.params.userId;
    const strSQL = `DELETE FROM tblUsers WHERE UserID = ?`;
  
    db.run(strSQL, [strUserID], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "User not found" });
  
      res.status(200).json({ status: "success", deleted: strUserID });
    });
  });
  
  // PHONE
app.delete('/phone/:phoneId', (req, res) => {
  const id = req.params.phoneId;
  db.run(`DELETE FROM tblPhone WHERE PhoneID = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Phone not found" });
    res.status(200).json({ status: "success", deleted: id });
  });
});

// SOCIAL
app.delete('/social/:socialId', (req, res) => {
  const id = req.params.socialId;
  db.run(`DELETE FROM tblSocials WHERE SocialID = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Social not found" });
    res.status(200).json({ status: "success", deleted: id });
  });
});

// COURSE GROUP
app.delete('/course-group/:groupId', (req, res) => {
  const id = req.params.groupId;
  db.run(`DELETE FROM tblCourseGroups WHERE GroupID = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Course group not found" });
    res.status(200).json({ status: "success", deleted: id });
  });
});

// COURSE
app.delete('/course/:courseId', (req, res) => {
  const id = req.params.courseId;
  db.run(`DELETE FROM tblCourses WHERE CourseID = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Course not found" });
    res.status(200).json({ status: "success", deleted: id });
  });
});

// GROUP MEMBER
app.delete('/group-member/:memberId', (req, res) => {
  const id = req.params.memberId;
  db.run(`DELETE FROM tblGroupMembers WHERE MemberID = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Group member not found" });
    res.status(200).json({ status: "success", deleted: id });
  });
});

// ENROLLMENT
app.delete('/enrollment/:enrollmentId', (req, res) => {
  const id = req.params.enrollmentId;
  db.run(`DELETE FROM tblEnrollments WHERE EnrollmentID = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Enrollment not found" });
    res.status(200).json({ status: "success", deleted: id });
  });
});

// ASSESSMENT
app.delete('/assessment/:assessmentId', (req, res) => {
  const id = req.params.assessmentId;
  db.run(`DELETE FROM tblAssessments WHERE AssessmentID = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Assessment not found" });
    res.status(200).json({ status: "success", deleted: id });
  });
});

// ASSESSMENT QUESTION
app.delete('/assessment-question/:questionId', (req, res) => {
  const id = req.params.questionId;
  db.run(`DELETE FROM tblAssessmentQuestions WHERE QuestionID = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Question not found" });
    res.status(200).json({ status: "success", deleted: id });
  });
});

// ASSESSMENT RESPONSE
app.delete('/assessment-response/:responseId', (req, res) => {
  const id = req.params.responseId;
  db.run(`DELETE FROM tblAssessmentResponses WHERE ResponseID = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Response not found" });
    res.status(200).json({ status: "success", deleted: id });
  });
});

// SESSION
app.delete('/sessions/:sessionId', (req, res) => {
    const strSessionID = req.params.sessionId;

    const strSQL = `DELETE FROM tblSessions WHERE SessionID = ?`;
    db.run(strSQL, [strSessionID], function (err) {
        if (err) {
            console.error("DB Error:", err.message); // Debugging log
            return res.status(500).json({ error: "Failed to delete session." });
        }
        if (this.changes === 0) {
            console.warn("Session not found in database"); // Debugging log
            return res.status(404).json({ error: "Session not found." });
        }
        res.status(200).json({ status: "success", message: "Session ended." });
    });
});

//update functions
// Users PUT
app.put("/user/:userId", (req, res) => {
  const strUserID = req.params.userId;
  const strFirstName = req.body.firstName?.trim();
  const strLastName = req.body.lastName?.trim();
  const strEmail = req.body.email?.trim().toLowerCase();

  if (!strFirstName || !strLastName || !strEmail) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(strEmail)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  const strSQL = `
    UPDATE tblUsers SET FirstName = ?, LastName = ?, Email = ?
    WHERE UserID = ?
  `;
  const arrParams = [strFirstName, strLastName, strEmail, strUserID];

  db.run(strSQL, arrParams, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "User not found." });
    res.status(200).json({ status: "success", updated: strUserID });
  });
});

// Phone PUT
app.put("/phone/:phoneId", (req, res) => {
  const strPhoneID = req.params.phoneId;
  const strNationCode = req.body.nationCode?.trim();
  const strAreaCode = req.body.areaCode?.trim();
  const strPhoneNumber = req.body.phoneNumber?.trim();
  const strStatus = req.body.status?.trim();

  if ( !strNationCode || !strAreaCode || !strPhoneNumber || !strStatus) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const nationCodeRegex = /^\+\d{1,3}$/;
  if (!nationCodeRegex.test(strNationCode)) {
    return res.status(400).json({ error: "Invalid nation code." });
  }

  if (!/^\d{3}$/.test(strAreaCode)) {
    return res.status(400).json({ error: "Area code must be 3 digits." });
  }

  if (!/^\d{3}-\d{4}$/.test(strPhoneNumber)) {
    return res.status(400).json({ error: "Phone number format invalid." });
  }

  const strSQL = `
    UPDATE tblPhone SET NationCode = ?, AreaCode = ?, PhoneNumber = ?, Status = ?
    WHERE PhoneID = ?
  `;
  const arrParams = [ strNationCode, strAreaCode, strPhoneNumber, strStatus, strPhoneID];

  db.run(strSQL, arrParams, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Phone not found." });
    res.status(200).json({ status: "success", updated: strPhoneID });
  });
});

// Socials PUT
app.put("/social/:socialId", (req, res) => {
  const strSocialID = req.params.socialId;
  const strUserEmail = req.body.userEmail?.trim().toLowerCase();
  const strSocialType = req.body.socialType?.trim();
  const strUsername = req.body.username?.trim();

  if (!strUserEmail || !strSocialType || !strUsername) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const strSQL = `
    UPDATE tblSocials SET Email = ?, SocialType = ?, Username = ?
    WHERE SocialID = ?
  `;
  const arrParams = [strUserEmail, strSocialType, strUsername, strSocialID];

  db.run(strSQL, arrParams, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Social record not found." });
    res.status(200).json({ status: "success", updated: strSocialID });
  });
});
app.put("/socials", (req, res) => {
  const strUserID = req.body.userId;
  const strSocialType = req.body.socialType?.trim();
  const strUsername = req.body.username?.trim();

  if (!strUserID || !strSocialType || !strUsername) {
    return res.status(400).json({ error: "All fields required." });
  }

  const strSQL = `
    UPDATE tblSocials 
    SET Username = ?
    WHERE SocialType = ? AND Email = (
      SELECT Email FROM tblUsers WHERE UserID = ?
    )
  `;

  db.run(strSQL, [strUsername, strSocialType, strUserID], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Social not found." });

    res.status(200).json({ status: "success" });
  });
});

// Course PUT
app.put("/course/:courseId", (req, res) => {
  const strCourseID = req.params.courseId;
  const strCourseName = req.body.courseName?.trim();
  const strCourseNumber = req.body.courseNumber?.trim();
  const strCourseSection = req.body.courseSection?.trim();
  const strCourseTerm = req.body.courseTerm?.trim();
  const strCourseCode = req.body.courseCode?.trim();
  const strCreatedBy = req.body.createdBy?.trim();
  if (!strCourseName || !strCourseNumber || !strCourseSection || !strCourseTerm || !strCourseCode || !strCreatedBy) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const strSQL = `
    UPDATE tblCourses SET CourseName = ?, CourseNumber = ?, CourseSection = ?, CourseTerm = ?, CourseCode = ?, CreatedBy = ?
    WHERE CourseID = ?
  `;
  const arrParams = [strCourseName, strCourseNumber, strCourseSection, strCourseTerm, strCourseCode, strCreatedBy, strCourseID];

  db.run(strSQL, arrParams, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Course not found." });
    res.status(200).json({ status: "success", updated: strCourseID });
  });
});

// Course Groups PUT
app.put("/course-group/:groupId", (req, res) => {
  const strGroupID = req.params.groupId;
  const strGroupName = req.body.groupName?.trim();

  if (!strGroupName) {
    return res.status(400).json({ error: "Group name required." });
  }

  const strSQL = `
    UPDATE tblCourseGroups SET GroupName = ?
    WHERE GroupID = ?
  `;
  const arrParams = [strGroupName, strCourseID, strGroupID];

  db.run(strSQL, arrParams, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Group not found." });
    res.status(200).json({ status: "success", updated: strGroupID });
  });
});

// Group Members PUT
app.put("/group-member/:memberId", (req, res) => {
  const strMemberID = req.params.memberId;
  const strGroupID = req.body.groupId?.trim();
  const strUserID = req.body.userId?.trim();

  if (!strGroupID || !strUserID) {
    return res.status(400).json({ error: "Group ID and User ID are required." });
  }

  const strSQL = `
    UPDATE tblGroupMembers SET GroupID = ?, UserID = ?
    WHERE MembershipID = ?
  `;
  const arrParams = [strGroupID, strUserID, strMemberID];

  db.run(strSQL, arrParams, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Group member not found." });
    res.status(200).json({ status: "success", updated: strMemberID });
  });
});

// Enrollments PUT
app.put("/enrollment/:enrollmentId", (req, res) => {
  const strEnrollmentID = req.params.enrollmentId;
  const strCourseID = req.body.courseId?.trim();
  const strUserID = req.body.userId?.trim();

  if (!strCourseID || !strUserID) {
    return res.status(400).json({ error: "Course ID and User ID are required." });
  }

  const strSQL = `
    UPDATE tblEnrollments SET CourseID = ?, UserID = ?
    WHERE EnrollmentID = ?
  `;
  const arrParams = [strCourseID, strUserID, strEnrollmentID];

  db.run(strSQL, arrParams, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Enrollment not found." });
    res.status(200).json({ status: "success", updated: strEnrollmentID });
  });
});

// Assessments PUT
app.put("/assessment/:assessmentId", (req, res) => {
  const strAssessmentID = req.params.assessmentId;
  const strName = req.body.name?.trim();
  const strStatus = req.body.status?.trim();
  const strType = req.body.type?.trim();
  const strStartDate = req.body.startDate?.trim();
  const strDueDate = req.body.dueDate?.trim();
  const strEndDate = req.body.endDate?.trim();

  if ( !strName || !strStatus || !strType || !strStartDate || !strDueDate || !strEndDate) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const strSQL = `
    UPDATE tblAssessments SET Name = ?, Status = ?, Type = ?,
    StartDate = ?, DueDate = ?, EndDate = ?
    WHERE AssessmentID = ?
  `;
  const arrParams = [
    strCourseID, strName, strStatus, strType,
    strStartDate, strDueDate, strEndDate, strAssessmentID
  ];

  db.run(strSQL, arrParams, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Assessment not found." });
    res.status(200).json({ status: "success", updated: strAssessmentID });
  });
});

// Assessment Questions PUT
app.put("/assessment-question/:questionId", (req, res) => {
  const strQuestionID = req.params.questionId;
  const strQuestionType = req.body.questionType?.trim();
  const strOptions = req.body.options ? JSON.stringify(req.body.options) : null;
  const strNarrative = req.body.questionNarrative?.trim();
  const strHelperText = req.body.helperText?.trim();

  if (!strQuestionType || !strNarrative) {
    return res.status(400).json({ error: "Assessment ID, question type, and narrative are required." });
  }

  const strSQL = `
    UPDATE tblAssessmentQuestions SET QuestionType = ?, Options = ?, QuestionNarrative = ?, HelperText = ?
    WHERE QuestionID = ?
  `;
  const arrParams = [
    strAssessmentID, strQuestionType, strOptions,
    strNarrative, strHelperText, strQuestionID
  ];

  db.run(strSQL, arrParams, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Question not found." });
    res.status(200).json({ status: "success", updated: strQuestionID });
  });
});

// Assessment Responses PUT
app.put("/assessment-response/:responseId", (req, res) => {
  const strResponseID = req.params.responseId;
  const strResponse = req.body.response?.trim();
  const strPublic = req.body.public?.toString().toLowerCase() === "true" ? "true" : "false";

  if (!strResponse) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const strSQL = `
    UPDATE tblAssessmentResponses SET
    Response = ?, isPublic = ?
    WHERE ResponseID = ?
  `;
  const arrParams = [
   strResponse, strPublic, strResponseID
  ];

  db.run(strSQL, arrParams, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Response not found." });
    res.status(200).json({ status: "success", updated: strResponseID });
  });
});

//Get statments
// USERS

//get all users
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM tblUsers";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ status: "success", users: rows });
  });
});

// PHONE
app.get("/phones", (req, res) => {
  const sql = "SELECT * FROM tblPhone";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ status: "success", phones: rows });
  });
});

// SOCIALS
app.get("/socials", (req, res) => {
  const sql = "SELECT * FROM tblSocials";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ status: "success", socials: rows });
  });
});

app.get('/socials/:userId', (req, res) => {
    const strUserID = req.params.userId;

    const strSQL = `
        SELECT s.SocialType, s.Username
        FROM tblSocials s
        JOIN tblUsers u ON s.Email = u.Email
        WHERE u.UserID = ?
    `;

    db.all(strSQL, [strUserID], (err, rows) => {
        if (err) {
            console.error("DB Error:", err.message);
            return res.status(500).json({ error: "Failed to fetch socials." });
        }

        res.status(200).json({ socials: rows });
    });
});

// LOGS
app.get("/logs", (req, res) => {
  const sql = "SELECT * FROM tblLogs";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ status: "success", logs: rows });
  });
});

// COURSES
app.get("/courses", (req, res) => {
  const sql = "SELECT * FROM tblCourses";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ status: "success", courses: rows });
  });
});
app.get("/courses/:courseCode", (req, res) => {
    const strCourseCode = req.params.courseCode?.trim();
  
    if (!strCourseCode) {
      return res.status(400).json({ error: "Course code is required." });
    }
  
    const strSQL = `SELECT * FROM tblCourses WHERE CourseCode = ?`;
    db.get(strSQL, [strCourseCode], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Course not found." });
  
      res.status(200).json({ course: row });
    });
  });
  

// COURSE GROUPS
app.get("/course-groups", (req, res) => {
  const sql = "SELECT * FROM tblCourseGroups";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ status: "success", groups: rows });
  });
});

// GROUP MEMBERS
app.get("/group-members", (req, res) => {
  const sql = "SELECT * FROM tblGroupMembers";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ status: "success", members: rows });
  });
});

// ENROLLMENTS
app.get("/enrollments", (req, res) => {
  const sql = "SELECT * FROM tblEnrollments";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ status: "success", enrollments: rows });
  });
});

// ASSESSMENTS
app.get("/assessments", (req, res) => {
  const sql = "SELECT * FROM tblAssessments";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ status: "success", assessments: rows });
  });
});

// ASSESSMENT QUESTIONS
app.get("/assessment-questions", (req, res) => {
  const sql = "SELECT * FROM tblAssessmentQuestions";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ status: "success", questions: rows });
  });
});
//get assessment questions by assessment id
app.get("/assessment-questions/:assessmentId", (req, res) => {
  const strAssessmentID = req.params.assessmentId?.trim();

  if (!strAssessmentID) {
      return res.status(400).json({ error: "Assessment ID is required." });
  }

  const strSQL = `
      SELECT * FROM tblAssessmentQuestions
      WHERE AssessmentID = ?
  `;

  db.all(strSQL, [strAssessmentID], (err, rows) => {
      if (err) {
          console.error("DB Error:", err.message);
          return res.status(500).json({ error: "Failed to retrieve questions." });
      }

      return res.status(200).json({ questions: rows });
  });
});


// ASSESSMENT RESPONSES
app.get("/assessment-responses", (req, res) => {
  const sql = "SELECT * FROM tblAssessmentResponse";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ status: "success", responses: rows });
  });
});

// SESSIONS
app.get("/sessions", (req, res) => {
  const sql = "SELECT * FROM tblSessions";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ status: "success", sessions: rows });
  });
});

// GET /group-members/by-user-course/:userId/:courseId
app.get("/group-members/by-user-course/:userId/:courseId", (req, res) => {
  const { userId, courseId } = req.params;

  const strSQL = `
  SELECT u.UserID, u.FirstName, u.LastName, u.Email
  FROM tblGroupMembers gm
  JOIN tblCourseGroups cg ON gm.GroupID = cg.GroupID
  JOIN tblUsers u ON gm.UserID = u.UserID
  WHERE cg.CourseID = ?
    AND gm.GroupID = (
      SELECT gm2.GroupID
      FROM tblGroupMembers gm2
      JOIN tblCourseGroups cg2 ON gm2.GroupID = cg2.GroupID
      WHERE gm2.UserID = ? AND cg2.CourseID = ?
      LIMIT 1
    )
    AND gm.UserID != ?
`;


  db.all(strSQL, [courseId, userId, courseId, userId], (err, rows) => {
    if (err) {
      console.error("Group member fetch error:", err.message);
      return res.status(500).json({ error: "Failed to retrieve group members." });
    }

    res.json({ members: rows });
  });
});

app.listen(HTTP_PORT,() => {
console.log('App listening on',HTTP_PORT)
})