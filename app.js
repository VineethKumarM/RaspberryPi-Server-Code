const express  = require('express');

const app = express();
const path = require('path');



app.use(express.urlencoded( { extended :true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views' , path.join(__dirname,'/views'));

app.get('/home',(req,res) => {
	res.render('home');
})

app.get('/register',(req,res) => {
	res.render('register');
})

app.get('/login',(req,res) => {
	res.render('login');
})

app.post('/signup',(req,res)=> {
	console.log('hi');
	console.log(req.params.name);
	res.render('/home');
})

app.post('/signin',(req,res)=> {
	console.log(req.params.name);
	res.render('/home');
})

app.listen( 5000, ()=> {
	console.log("Smart Lab is accessible from port 5000!!!!");
})


