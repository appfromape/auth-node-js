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

//google-oauth
const GoogleStrategy = require('passport-google-oauth20').Strategy;

//findOrCreate
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

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
mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true });
// mongoose.set('useCreateIndex', true);

//User Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    // googleId: String,
});

//passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

//findOrCreate
userSchema.plugin(findOrCreate);

//User Model
const User = new mongoose.model('User', userSchema);

//passport create-strategy
passport.use(User.createStrategy());

//passport serializeUser and deserializeUser
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//passport serializeUser and deserializeUser


//passport google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }));

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
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

//auth with google
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] })
);

//callback route for google to redirect to
app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/secrets');
    });

//post user
app.post('/register', (req, res) => {
    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
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
        if (err) {
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

