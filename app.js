const express  = require('express');
// const authController = require("./controllers/studentAuth");
// const requireUserLogin = require("./middlewares/facultyRequireLogin");
const app = express();
const path = require('path');
// const hueBridge = require("./controllers/hueBridge");

// hueBridge.discoverAndCreateUser;

app.use(express.urlencoded( { extended :true }));
app.use(express.json());
app.use(require('./routes/faculty'));
app.use(require('./routes/student'));

app.listen( 5000, ()=> {
	console.log("Smart Lab is accessible from port 5000!!!!");
})


