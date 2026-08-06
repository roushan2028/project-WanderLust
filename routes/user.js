const express = require('express');
const router = express.Router();
const User=require("../models/user.js");
const passport = require('passport');
const asyncWrap = require('../utils/asyncWrap');
const {saveRedirectUrl} =require('../middlewares.js');

const userController = require("../controller/users.js");

router.route("/signup")
    .get(userController.renderSignUpForm)
    .post(asyncWrap(userController.signUp));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl,passport.authenticate('local',{failureRedirect: '/login',failureFlash:true}),asyncWrap(userController.Login));

router.get("/logout",userController.logOut);

module.exports=router;