const bycrpt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const labs = require("../lab.json");
const fs = require("fs");
const key = require("../keys");

const getLabDetails = async (req, res) => {
    
    const {labId} = req.body;

    let lab = labs.filter(lab => lab.id == labId);
    
    if(lab.length == 0){
        return res.status(422).json({
            error: "Incorrect Credentials :("
        })
    }

    return res.status(200).json({
        success: true,
        lab: lab[0]
    })   
}


module.exports = {
    getLabDetails
}