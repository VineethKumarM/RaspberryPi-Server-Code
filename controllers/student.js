const bycrpt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const students = require("../db/student.json");
const faculties = require("../db/faculty.json");
const labs = require("../db/lab.json");
const fs = require("fs");
const key = require("../keys");
const path = require('path');
const uniqueId = require('shortid');

const userRegister = async (req, res) => {
    const {rollNumber,password} = req.body;
    console.log(rollNumber, password);
    let id = uuidv4(); 
    if(!rollNumber || !password){
        return res.status(422).json({
            error: "Please fill all fields"
        })
    }
    faculties.forEach(user => {
        if(user.rollNumber == rollNumber){
            return res.status(422).json({
                error: "phone Number is already taken by someother user :("
            })
        }
    })
    let hashedPassword = await bycrpt.hash(password,10);
    let newUser = {
        id: id,
        rollNumber: rollNumber,
        password: hashedPassword,
        notification: [],
        labId: "",
        labJoinStatus: -1,
        jwt_token: JWT_KEY[Math.floor(Math.random() * JWT_KEY.length)]
    }
    console.log(newUser);
    students.push(newUser);
    fs.writeFile(path.join(__dirname, '../db/student.json'), JSON.stringify(students), (err) => {
        if (err) throw err;
        // console.log("New user added");
    });
    return res.status(200).json({
        success: "Registered successfully :)"
    })
}

const userLogin = async (req, res) => {
    const {rollNumber, password} = req.body;
    if(!rollNumber || !password){
        return res.status(422).json({
            error: "Incorrect Credentials!"
        })
    }
    const user = students.filter(user => user.rollNumber == rollNumber);
    if(user.length == 0){
        return res.status(422).json({
            error: "Incorrect Credentials :("
        })
    }
    let passCheck = await bycrpt.compare(password, user[0].password);
    if(passCheck){
        const token = jwt.sign({id:user[0].id}, user[0].jwt_token, {expiresIn: "3600000"});//expires in 1 hour = 3600000 ms
        res.json({
            success: "Successfully LoggedIn",
            token,
            user: user[0]
        });
    }else{
        return res.status(422).json({
            error: "Incorrect Credentials!"
        })
    }
}

const studentDetail = async (req ,res) => {
    const {studentId} = req.body;
    const student = students.filter(student => student.id == studentId);
    return res.status(200).json({
        studentDetails: student[0]
    });
}

const myLabs = async(req, res) => {
    let labDetail;
    await labs.forEach(lab => {
        if(lab.id == req.user.labId){
            labDetail = lab
        }
    });
    // console.log(labDetail);
    let facultyName;
    await faculties.forEach(faculty => {
        if(faculty.id == labDetail.facultyId){
            facultyName = faculty.name;
        }
    })
    // console.log(facultyName);
    return res.json({
        lab: labDetail,
        faculty: facultyName
    });
}

const joinFaculty = async(req, res) => {
    const {facultyId} = req.body;
    faculties.forEach(faculty => {
        if(faculty.id == facultyId){
            // console.log(faculty);
            faculty.notification.push({studentId: req.user.id});
        }
    });
    console.log(faculties);
    fs.writeFile(path.join(__dirname, '../db/faculty.json'), JSON.stringify(faculties), (err) => {
        if (err) throw err;
        // console.log("New user added");
    });
    let student;
    students.forEach(stud => {
        if(stud.id == req.user.id){
            stud.labJoinStatus = 0;
            student = stud;
        }
    })
    fs.writeFile(path.join(__dirname, '../db/student.json'), JSON.stringify(students), (err) => {
        if (err) throw err;
        // console.log("New user added");
    });
    
    return res.status(200).json({
        success: "Request sent successfully :)",
        user: student
    });
}

const myNotification = async(req, res) => {
    const student = students.forEach(student => {
        if(student.id == req.user.id);
    });
    return res.status(200).json({
        notification: student.notification
    });
}

module.exports = {
    userRegister,
    userLogin,
    studentDetail,
    myLabs,
    joinFaculty,
    myNotification
};
