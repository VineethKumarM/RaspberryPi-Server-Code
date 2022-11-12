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

// app.set('view engine', 'ejs');
// app.set('views' , path.join(__dirname,'/views'));

// app.get('/',(req,res) => {
// 	res.render('home');
// })

// app.get('/register',(req,res) => {
// 	res.render('register');
// })

// app.get('/login',(req,res) => {
// 	res.render('login');
// })

// app.post('/signup', authController.userRegister);

// app.post('/signin', authController.userLogin);

// app.get('/dashboard', (req, res) => {
// 	res.render('dashboard');
// });

app.listen( 5000, ()=> {
	console.log("Smart Lab is accessible from port 5000!!!!");
})


