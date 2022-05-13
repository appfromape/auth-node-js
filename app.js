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

//express-session
const session = require('express-session');

//passport
const passport = require('passport');

//passport-local
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//express-session
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

//passport
app.use(passport.initialize());
app.use(passport.session());

//connect mongoose
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true});

//User Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

//User Model
const User = new mongoose.model('User', userSchema);

//passport create-strategy
passport.use(User.createStrategy());

//passport serializeUser and deserializeUser
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

//logout ge
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

//secret
app.get('/secrets', (req, res) => {
    //check if user is logged in
    if(req.isAuthenticated()){
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

//post user
app.post('/register', (req, res) => {
    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if(err){
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets');
            });
        }
    });
});

//login user
app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, (err) => {
        if(err){
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets');
            });
        }
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
    }   
);

