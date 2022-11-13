const bycrpt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const faculties = require("../db/faculty.json");
const students = require("../db/student.json");
const labs = require("../db/lab.json")
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
        notification: []
    }
    console.log(newUser);
    faculties.push(newUser);
    fs.writeFile(path.join(__dirname, '../db/faculty.json'), JSON.stringify(faculties), (err) => {
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
    const user = faculties.filter(user => user.phoneNumber == phoneNumber);
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

const createLab = async(req,res) => {
    const {labName} = req.body;
    const newLab = {
        id : uniqueId(),
        name: labName,
        facultyId: req.user.id,
        studentList : []
    }
    labs.push(newLab);
    fs.writeFile(path.join(__dirname, '../db/lab.json'), JSON.stringify(labs), (err) => {
        if (err) throw err;
        console.log("New lab created");
    });

    return res.status(200).json({
        lab: newLab.id,
        success: "Lab Created successfully :)"
    })
}

const acceptStudentJoinRequest = async (req, res) => {
    const {studentId, labId} = req.body;    
    const lab = labs.filter(lab => lab.id == labId);
    console.log(lab);
    lab[0].studentList.push(studentId);
    fs.writeFile(path.join(__dirname, '../db/lab.json'), JSON.stringify(labs), (err) => {
        if (err) throw err;
        console.log("student added to lab");
    });
    students.forEach(student => {
        if(student.id == studentId){
            student.labs.push(labId);
        }
    })
    fs.writeFile(path.join(__dirname, '../db/student.json'), JSON.stringify(students), (err) => {
        if (err) throw err;
        // console.log("New user added");
    });
    return res.status(200).json({
        success: "student added successfully :)"
    })
}

const rejectStudentJoinRequest = async (req, res) => {
    
}

module.exports = {
    userRegister,
    userLogin,
    myLabs,
    createLab,
    acceptStudentJoinRequest
};
