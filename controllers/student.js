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
    const {name,phoneNumber,password} = req.body;
    console.log(name, phoneNumber, password);
    let id = uuidv4(); 
    if(!name || !phoneNumber || !password){
        return res.status(422).json({
            error: "Please fill all fields"
        })
    }
    faculties.forEach(user => {
        if(user.phoneNumber == phoneNumber){
            return res.status(422).json({
                error: "phone Number is already taken by someother user :("
            })
        }
    })
    let hashedPassword = await bycrpt.hash(password,10);
    let newUser = {
        id: id,
        name: name,
        phoneNumber: phoneNumber,
        password: hashedPassword,
        notification: [],
        labId: "",
        labJoinStatus: -1
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
    const {phoneNumber, password} = req.body;
    if(!phoneNumber || !password){
        return res.status(422).json({
            error: "Incorrect Credentials!"
        })
    }
    const user = students.filter(user => user.phoneNumber == phoneNumber);
    if(user.length == 0){
        return res.status(422).json({
            error: "Incorrect Credentials :("
        })
    }
    let passCheck = await bycrpt.compare(password, user[0].password);
    if(passCheck){
        const token = jwt.sign({id:user[0].id}, key.JWT_KEY, {expiresIn: "3600000"});//expires in 1 hour = 3600000 ms
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
    let result = await labs.filter(lab => lab.id == req.user.labId);
    return res.json({
        lab: result
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
