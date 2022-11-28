const bycrpt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const faculties = require("../db/faculty.json");
const students = require("../db/student.json");
const labs = require("../db/lab.json");
const fs = require("fs");
const path = require('path');
const uniqueId = require('shortid');
const { JWT_KEY } = require('../keys');
const keys = require('../keys');
var CryptoJS = require("crypto-js");


const allFaculties = async (req, res) => {
    return res.status(200).json({
        faculties: faculties
    })
}

const userRegister = async (req, res) => {
    const {name,phoneNumber,password} = req.body;
    console.log(name, phoneNumber, password);
    let id = uuidv4(); 
    if(!name || !phoneNumber || !password){
        return res.status(422).json({
            error: "Please fill all fields"
        })
    }
    faculties.forEach(cipher => {
        var bytes  = CryptoJS.AES.decrypt(cipher.ciphertext, 'secret key 123');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        // console.log(decryptedData);
        if(decryptedData.phoneNumber == phoneNumber){
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
        jwt_token: keys.JWT_KEY
    }
    

    // Encrypt
    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(newUser), 'secret key 123').toString();


    // console.log(decryptedData); // [{id: 1}, {id: 2}]
    faculties.push({ciphertext});
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
    console.log("hi");
    if(!phoneNumber || !password){
        return res.status(422).json({
            error: "Incorrect Credentials!"
        })
    }
    let user;
    faculties.forEach(cipher => {
        // Decrypt
        var bytes  = CryptoJS.AES.decrypt(cipher.ciphertext, 'secret key 123');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        console.log(decryptedData);
        if(decryptedData.phoneNumber == phoneNumber){
            user = decryptedData;
        }
    });
    // console.log(user);
    if(!user){
        return res.status(422).json({
            error: "Incorrect Credentials :("
        })
    }
    let passCheck = await bycrpt.compare(password, user.password);
    if(passCheck){
        const token = jwt.sign({id:user.id}, keys.JWT_KEY, {expiresIn: "3600000"});//expires in 1 hour = 3600000 ms
        res.json({
            success: "Successfully LoggedIn",
            token,
            user: user
        });
    }else{
        return res.status(422).json({
            error: "Incorrect Credentials!"
        })
    }
}

const myLabs = async(req, res) => {
    const result = labs.filter(lab => lab.id == req.user.labId);
    return res.json({
        labs: result[0]
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
    // faculties.filter(faculty => {
    //     if(faculty.id == req.user.id){
    //         faculty.labId = newLab.id
    //     }
    // })
    faculties.forEach(cipher => {
        // Decrypt
        var bytes  = CryptoJS.AES.decrypt(cipher.ciphertext, 'secret key 123');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        if(decryptedData.id == req.user.id){
            decryptedData.labId = newLab.id            
            // Encrypt
            cipher.ciphertext = CryptoJS.AES.encrypt(JSON.stringify(decryptedData), 'secret key 123').toString();
        }
    });
    fs.writeFile(path.join(__dirname, '../db/faculty.json'), JSON.stringify(faculties), (err) => {
        if (err) throw err;
        // console.log("New user added");
    });
    return res.status(200).json({
        lab: newLab.id,
        success: "Lab Created successfully :)"
    })
}

const acceptStudentJoinRequest = async (req, res) => {
    const {studentId} = req.body;   
    console.log(studentId); 
    if(req.user.labId.length == 0){
        return res.status(200).json({
            success: "You do not have any lab :)"
        })
    }
    else {
    let lab = labs.filter(lab => lab.id == req.user.labId);
    console.log(lab);
    lab[0].studentList.push(studentId);
    fs.writeFile(path.join(__dirname, '../db/lab.json'), JSON.stringify(labs), (err) => {
        if (err) throw err;
        console.log("student added to lab");
    });

    let newNotif = {
        message: "Your request has been accepted",
        Accepted: true 
    }

    students.forEach(student => {
        if(student.id == studentId){
            student.labId = lab[0].id;
            student.notification.push(newNotif);
            student.labJoinStatus = 1;
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
}

const rejectStudentJoinRequest = async (req, res) => {
    
    const {studentId} = req.body;  
    
    let newNotif = {
        message: "Your request has been rejected",
        Accepted: false
    }

    students.forEach(student => {
        if(student.id == studentId){
            student.notification.push(newNotif);            
            student.labJoinStatus = -1;
        }
    })

    fs.writeFile(path.join(__dirname, '../db/student.json'), JSON.stringify(students), (err) => {
        if (err) throw err;
    });

    return res.status(200).json({
        success: "student rejected :("
    })    
}

const myNotification = async(req, res) => {
    const faculty = faculties.forEach(cipher => {
        // Decrypt
        var bytes  = CryptoJS.AES.decrypt(cipher.ciphertext, 'secret key 123');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        if(decryptedData.id == req.user.id){
            return decryptedData;
        }
    });
    // const faculty = faculties.forEach(faculty => {
    //     if(faculty.id == req.user.id);
    // });
    return res.status(200).json({
        notification: faculty.notification
    });
}

module.exports = {
    userRegister,
    userLogin,
    allFaculties,
    myLabs,
    createLab,
    acceptStudentJoinRequest,
    rejectStudentJoinRequest,
    myNotification
};