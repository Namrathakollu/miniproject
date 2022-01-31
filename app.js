const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
var validator = require("email-validator");
const multer = require('multer');
const fs = require('fs');
const path = require('path');


const app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');


app.use(session({
  secret: 'Our secret',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/expenseDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  password: String,
  dob: String,
  username: String
});

//////////////////////////////////////////////////////////////////
userSchema.plugin(passportLocalMongoose);
//////////////////////////model//////////////////////////////////

//////////////////////////model//////////////////////////////////
const User = new mongoose.model("User", userSchema);





/////////////////////////passport//////////////////////////////

/////////////////////////passport//////////////////////////////
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
///////////////////////get/////////////////////
app.get("/", function(req, res) {
  res.render("login");
});

app.get("/signup", function(req, res) {
  res.render("signup");
});

app.get("/home", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("home_page");
  } else {
    res.redirect("/");
  }
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/enter_expense", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("enter_expense");
  } else {
    res.redirect("/");
  }
});
////////////////post/////////////////////
app.post("/", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err) {
    if (err) {
      console.log("error");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/home");
      });
    }
  });
});

app.post("/signup", function(req, res) {
  if (validator.validate(req.body.username) === true) {
    User.register({
      username: req.body.username,
      dob: req.body.dob,
      name: req.body.name
    }, req.body.password, function(err, user) {
      if (err) {
        console.log("error")
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/home");
        });
      }
    });
  } else {
    console.log("notinif")
  }
});

/////////////////////////////listen///////////////////////////////

app.listen(3000, function() {
  console.log("in port 3000");
});
