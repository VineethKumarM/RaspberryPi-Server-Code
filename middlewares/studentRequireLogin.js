const students = require("../db/student.json");
const jwt = require('jsonwebtoken');
const key = require("../keys");


module.exports = (req, res, next) => {
    const {authorization} = req.headers;
    if(!authorization){
        return res.status(401).json({
            error: "You must be logged in :(",
        })
    }
    const token = authorization;
    jwt.verify(token,key.JWT_KEY,(err, payload) => {
        if(err){
            return res.status(401).json({
                error:"You must be logged in :("
            });
        }
        const {id} = payload;
        const student = students.filter(user => user.id == id);
        req.user = student[0];
        next();
    })
}