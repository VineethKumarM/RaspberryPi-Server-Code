const bycrpt = require('bcryptjs');6
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const users = require("../db/student.json");
const fs = require("fs");
const key = require("../keys");

const userRegister = async (req, res) => {
    const {name,phoneNumber,password} = req.body;
    let id = uuidv4(); 
    console.log(name, phoneNumber, password, id);
    if(!name || !phoneNumber || !password){
        return res.status(422).json({
            error: "Please fill all fields"
        })
    }
    users.forEach(user => {
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
        password: hashedPassword
    }
    users.push(newUser);
    fs.writeFile('users.json', JSON.stringify(users), (err) => {
        if (err) throw err;
        console.log("New user added");
    });
    return res.status(200).json({
        error: "Registered successfully :)"
    })
}

const userLogin = async (req, res) => {
    const {phoneNumber, password} = req.body;
    if(!phoneNumber || !password){
        return res.status(422).json({
            error: "Incorrect Credentials!"
        })
    }
    const user = users.filter(user => user.phoneNumber == phoneNumber);
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


module.exports = {
    userRegister,
    userLogin
};
