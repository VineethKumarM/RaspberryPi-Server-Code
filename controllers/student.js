const bycrpt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const students = require("../db/student.json");
const faculties = require("../db/faculty.json");
const labs = require("../db/lab.json");
const fs = require("fs");
const path = require('path');
const uniqueId = require('shortid');
var CryptoJS = require("crypto-js");
const { JWT_KEY } = require('../keys');
const keys = require('../keys');

const userRegister = async (req, res) => {
    const {rollNumber,password} = req.body;
    console.log(rollNumber, password);
    let id = uuidv4(); 
    if(!rollNumber || !password){
        return res.status(422).json({
            error: "Please fill all fields"
        })
    }

    students.forEach(cipher => {
        var bytes  = CryptoJS.AES.decrypt(cipher.ciphertext, 'secret key 123');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        // console.log(decryptedData);
        if(decryptedData.rollNumber == rollNumber){
            return res.status(422).json({
                error: "roll Number is already taken by someother user :("
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
        jwt_token: keys.JWT_KEY
    }    
    
    // Encrypt
    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(newUser), 'secret key 123').toString();
    students.push({ciphertext});

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
    let user;
    students.forEach(cipher => {
        // Decrypt
        var bytes  = CryptoJS.AES.decrypt(cipher.ciphertext, 'secret key 123');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        // console.log(decryptedData);
        if(decryptedData.rollNumber == rollNumber){
            user = decryptedData;
        }
    });
    // const user = students.filter(user => user.rollNumber == rollNumber);
    if(!user){
        return res.status(422).json({
            error: "Incorrect Credentials :("
        })
    }
    let passCheck = await bycrpt.compare(password, user.password);
    if(passCheck){
        const token = jwt.sign({id:user.id},keys.JWT_KEY, {expiresIn: "3600000"});//expires in 1 hour = 3600000 ms
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

const studentDetail = async (req ,res) => {
    const {studentId} = req.body;
    c// onst student = students.filter(student => student.id == studentId);

    let student;
    students.forEach(cipher => {
        // Decrypt
        var bytes  = CryptoJS.AES.decrypt(cipher.ciphertext, 'secret key 123');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        // console.log(decryptedData);
        if(decryptedData.id == studentId){
            student = decryptedData;
        }
    });
    return res.status(200).json({
        studentDetails: student
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
    faculties.forEach(cipher => {
        // Decrypt
        var bytes  = CryptoJS.AES.decrypt(cipher.ciphertext, 'secret key 123');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        // console.log(decryptedData);
        if(decryptedData.id == labDetail.facultyId){
            facultyName = decryptedData.name;
        }
    });
    return res.json({
        lab: labDetail,
        faculty: facultyName
    });
}

const joinFaculty = async(req, res) => {
    const {facultyId} = req.body;

    faculties.forEach(cipher => {
        // Decrypt
        var bytes  = CryptoJS.AES.decrypt(cipher.ciphertext, 'secret key 123');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        // console.log(decryptedData);
        if(decryptedData.id == facultyId){            
            decryptedData.notification.push({studentId: req.user.id});
            cipher.ciphertext = CryptoJS.AES.encrypt(JSON.stringify(decryptedData), 'secret key 123').toString();
        }
    });
    fs.writeFile(path.join(__dirname, '../db/faculty.json'), JSON.stringify(faculties), (err) => {
        if (err) throw err;
        // console.log("New user added");
    });
    let student;

    students.forEach(cipher => {
        // Decrypt
        var bytes  = CryptoJS.AES.decrypt(cipher.ciphertext, 'secret key 123');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        // console.log(decryptedData);
        if(decryptedData.id == req.user.id){            
            decryptedData.labJoinStatus = 0;
            student = decryptedData;
            cipher.ciphertext = CryptoJS.AES.encrypt(JSON.stringify(decryptedData), 'secret key 123').toString();
        }
    });
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

    let student;
    students.forEach(cipher => {
        // Decrypt
        var bytes  = CryptoJS.AES.decrypt(cipher.ciphertext, 'secret key 123');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        // console.log(decryptedData);
        if(decryptedData.id == req.user.id){   
            student = decryptedData;
        }
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
