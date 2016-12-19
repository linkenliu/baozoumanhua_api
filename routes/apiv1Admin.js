"use strict";
const express = require('express'),
    router = express.Router(),
    moment = require("moment"),
    schedule = require('node-schedule'),
    multipart = require('connect-multiparty'),
    multipartMiddleware = multipart(),
    userController = require('./controllers/admin/userController'),
    huserController = require('./controllers/admin/huserController'),
    topicController = require('./controllers/admin/topicController'),
    storyController = require('./controllers/admin/storyController'),
    commonModelController = require('./controllers/admin/commonModelController'),
    UserModel = require('../models/UserModel');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('admin/login',{errData:''});
});

//login
router.post('/admin/login',userController.login);

//logout
router.get('/admin/layout',userController.layout);

//user information
router.get('/admin/v1/userList',userController.getUserList);

//saveUser or editUser
router.post('/admin/v1/saveUser',userController.saveUser);

//checkusername
router.post('/admin/v1/checkusername',userController.checkusername);

//checkEmail
router.post('/admin/v1/checkEmail',userController.checkEmail);


//topic information
router.get('/admin/v1/topic',topicController.getTopicList);

//
router.post('/admin/v1/saveTopic',topicController.saveTopic);

//
router.post('/admin/v1/uploadForQiniu',multipartMiddleware,commonModelController.uploadForQiniu);


//topic video wall
router.get('/admin/v1/videowall',topicController.videowall);


//story
router.get('/admin/v1/storyList',storyController.getStoryList);

router.get('/admin/v1/findOneStory',storyController.findOneStory);

router.post('/admin/v1/saveStory',multipartMiddleware,storyController.saveStory);

router.post('/admin/v1/editStory',storyController.editStory);

router.get('/admin/v1/huser',huserController.getHuserList);

//common method
router.delete('/admin/v1/:model/:_id',commonModelController.deleteModel);

router.post('/admin/v1/upload',multipartMiddleware,commonModelController.upload);














setInterval(function(){
    topicController.pullTopic({url:'http://baozoumanhua.com/baoman?page=1&sv=1479024301',site_type:'baozoumanhua',topic_type:'baoman'});
},1000*60*10);


setInterval(function(){
    topicController.pullTopic({url:'http://baozoumanhua.com/qutu?page=1&sv=1479040201',site_type:'baozoumanhua',topic_type:'qutu'});
},1000*60*11);


setInterval(function(){
    topicController.pullTopic({url:'http://baozoumanhua.com/text?page=1&sv=1479220502',site_type:'baozoumanhua',topic_type:'text'});
},1000*60*12);


var j = schedule.scheduleJob("10 3 0 * * *", function () {
    topicController.pullVideoTopic({url:'http://baozoumanhua.com/videos',site_type:'baozoumanhua',topic_type:'videos'});
});

topicController.pullVideoTopic({url:'http://baozoumanhua.com/videos',site_type:'baozoumanhua',topic_type:'videos'});



router.get('/admin/*', function (req, res) {
    res.render('admin/index', {title: 'Express'});
});






module.exports = router;
