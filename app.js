//jshint esversion:6

//dotenv
require('dotenv').config();

//express
const express = require('express');

//body-parser
const bodyParser = require('body-parser');

//ejs
const ejs = require('ejs');

//mongoose
const mongoose = require('mongoose');

//mongoose encryption
// const mongoose_encryption = require('mongoose-encryption');

//md5
const md5 = require('md5');

//bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//connect mongoose
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true});

//User Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//User encryption
// userSchema.plugin(mongoose_encryption, {
//     secret: process.env.SECRET,
//     encryptedFields: ['password']
// });

//User Model
const User = mongoose.model('User', userSchema);

//home
app.get('/', (req, res) => {
    res.render('home');
});

//login
app.get('/login', (req, res) => {
    res.render('login');
});

//register
app.get('/register', (req, res) => {
    res.render('register');
});

//post user
app.post('/register', (req, res) => {
    const newUser =  new User({
        email: req.body.username,
        // password: req.body.password
        //md5
        // password: md5(req.body.password)
        //bcrypt
        password: bcrypt.hashSync(req.body.password, saltRounds)
    });
    //create new user
    newUser.save((err, user) => {
        if(err) {
            console.log(err);
        } else {
            res.render('secrets');
        }
    });
});

//login user
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    //md5
    //const password = md5(req.body.password);
    //find user
    User.findOne({email: username}, (err, foundUser) => {
        if(err) {
            console.log(err);
        } else {
            if(foundUser) {
                if(bcrypt.compareSync(password, foundUser.password)) {
                    res.render('secrets');

                } else {
                    res.send('Incorrect password');
                }
            }
        }
    });
});



app.listen(3000, () => {
    console.log('Server started on port 3000');
    }   
);

