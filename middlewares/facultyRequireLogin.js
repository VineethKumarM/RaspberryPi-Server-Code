const faculties = require("../db/faculty.json");
const jwt = require('jsonwebtoken');
const key = require("../keys");
var CryptoJS = require("crypto-js");


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
        // const faculty = faculties.filter(user => user.id == id);
        let user;
        faculties.forEach(cipher => {
            // Decrypt
            var bytes  = CryptoJS.AES.decrypt(cipher.ciphertext, 'secret key 123');
            var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            if(decryptedData.id == id){
                user = decryptedData;
            }
        });
        req.user = user;
        next();
    })
}