'use strict';
const express = require('express'),
    router = express.Router(),
    moment = require("moment"),
    multipart = require('connect-multiparty'),
    topicController = require('./controllers/home/topicController'),
    storyController = require('./controllers/home/storyController'),
    userController = require('./controllers/home/userController'),
    authController = require('./controllers/home/authController'),
    multipartMiddleware = multipart();

/* GET home page. */
router.get('/home', function (req, res) {
    res.render('home/home');
});

router.get('/sss', function (req, res) {
    res.render('home/index22');
});

router.get('/test', function (req, res) {
    res.render('home/test');
});


//topic
router.get('/home/v1/getTopic', topicController.getTopicList);

//story
router.get('/home/v1/getStory', storyController.getStory);

//storyDetails
router.get('/home/v1/getStoryDetails', storyController.getStoryDetails);

//registerUser
router.post('/home/v1/registerUser', authController.checkEmail, authController.checkusername, userController.registerUser);

//checkusername
router.get('/home/v1/checkusername', userController.checkusername);

//checkEmail
router.get('/home/v1/checkEmail', userController.checkEmail);

//login
router.post('/home/v1/login', userController.login);

//chat
router.get('/chat', function (req, res) {
    res.render('client/index')
});


module.exports = router;
