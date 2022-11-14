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
        labs: []
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

const myLabs = async(req, res) => {
    const result = labs.filter(lab => lab.facultyId == req.user.id);
    return res.json({
        labs: result
    });
}

const joinLab = async(req, res) => {
    const {labId} = req.body;
    const lab = labs.filter(lab => lab.id == labId);
    if(lab.length == 0){
        return res.status(422).json({
            error: "No lab with given ID!"
        })
    };
    faculties.forEach(faculty => {
        if(faculty.id == lab[0].facultyId){
            const request = {
                studentId: req.user.id,
                labId: labId
            }
            faculty.notification.push(request);
        }
    });
    fs.writeFile(path.join(__dirname, '../db/faculty.json'), JSON.stringify(faculties), (err) => {
        if (err) throw err;
        // console.log("New user added");
    });
    return res.status(200).json({
        error: "Request sent successfully :)"
    });
}

const showNotifications = async(req, res) => {
    const {studentId} = req.user;
    const student = students.filter(student => student.id == studentId);
    
    if(student.length == 0){
        return res.status(422).json({
            message: "No student with given ID!"
        })
    };

    return res.status(200).json({
        success: true,
        data: student.notification
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
    myLabs,
    joinLab,
    showNotifications,
    myNotification
};
