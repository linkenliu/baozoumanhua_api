'use strict';
const
    UserModel = require('../../../models/UserModel'),
    dateUtil = require('../../../utils/dateUtil'),
    uuid = require('../../../utils/uuid'),
    config = require('../../../config/config'),
    Response = require('../../../utils/responseObj'),
    moment = require("moment"),
    fse = require('fs-extra'),
    logger = require('../../../utils/logger.js').getLogger('admin'),
    Promise = require('promise'),
    async = require('async');




/**
 * user login
 * @param req
 * @param res
 */
exports.login = async (req,res)=>{
    let errData = {};
    let username = req.body.username;
    let password = req.body.password;
    try{
        let user = await UserModel.findOne({username:username});
        if(!user){
            errData.message = '用户名或密码错误!';
            res.render('admin/login',{errData:errData.message});
        }
        if(password == user.password){
            req.session.sessionUser = user;
            await req.session.save();
            await res.redirect('/admin/index');
        }else{
            errData.message = '用户名或密码错误!';
            res.render('admin/login',{errData:errData.message});
        }
    }catch(err){
        errData.message = "服务器错误,请稍后重试!";
        res.render('admin/login',{errData:errData.message});
    }
};


/**
 * findAll user
 * searchText username
 * @param req
 * @param res
 */
exports.getUserList = async (req, res)=> {
    let responseObj = Response();
    let params = {};
    let searchText = req.query.searchText?req.query.searchText:'';
    if(searchText){
        params.username = new RegExp(searchText);
    }
    try{
        let userList = await UserModel.find(params);
        userList = await Promise.all(userList.map( async (user) => {
            user._doc['create_date'] = await dateUtil.formatDate(user.create_date);
            return user;
        }));
        responseObj.userList = userList;
        await res.send(responseObj);
    }catch(err){
        responseObj.errMsg(false,err.message);
        logger.error("getUserList Error : "+err.message);
        res.send(responseObj);
    }
};

/**
 * save user
 * if _id is modify, otherwise it will be add.
 * @param req
 * @param res
 */
exports.saveUser = async (req, res) => {
    let responseObj = Response();
    let params = req.body;
    if(params._id){
        try{
            let user = await UserModel.findOne({_id:params._id});
            if(!user){
                responseObj.errMsg(false,'no such user!');
                res.send(responseObj);
            }
            user.username = params.username;
            user.nickname = params.nickname;
            if(params.sex)
                user.sex = params.sex;
            if(params.state)
                user.status = params.state;
            user.phone = params.phone;
            user.email = params.email;
            if(params.password) user.password = params.password;
            await user.save();
            await res.send(responseObj);
        }catch(err){
            responseObj.errMsg(false,err.message);
            logger.error("editUser Error : "+err.message);
            res.send(responseObj);
        }

    }else{
        try{
            params.create_date = dateUtil.formatDate();
            params.update_date = dateUtil.formatDate();
            let newUser = new UserModel(params);
            await newUser.save();
            await res.send(responseObj);
        }catch(err){
            responseObj.errMsg(false,err.message);
            logger.error("saveUser Error : "+err.message);
            res.send(responseObj);
        }
    }
};

exports.checkusername = async (req, res) => {
    let responseObj = Response();
    let _id = req.body._id;
    let username = req.body.username;
    if (!username) {
        responseObj.errMsg(false,'username is empty');
        res.send(responseObj);
    }
    let opts = {username: username};
    if (_id) {
        opts._id = {$ne: _id};
    }
    try{
        let user = await UserModel.findOne(opts);
        if(user){
            responseObj.errMsg(false,'名称已被使用');
            res.send(responseObj);
        }else{
            res.send(responseObj);
        }
    }catch(err){
        responseObj.errMsg(false,err.message);
        res.send(responseObj);
    }
};

exports.checkEmail  = async (req, res)=>{
    let responseObj = Response();
    var email = req.body.email;
    if(!email) {
        res.json({"result": "OK" });
        return;
    }
    var opts = {email:email};
    if(req.body._id) {
        var opts = {_id: { $ne: req.body._id }, email:email};
    }
    try{
        let user = await UserModel.findOne(opts);
        if(user){
            responseObj.errMsg(false,'邮箱已被使用');
            res.send(responseObj);
        }else{
            res.send(responseObj);
        }
    }catch(err){
        responseObj.errMsg(false,err.message);
        res.send(responseObj);
    }
};




exports.layout = async (req,res)=>{
    let responseObj = Response();
    try{
        await req.session.destroy();
        await res.redirect('/');
    }catch(err){
        responseObj.errMsg(false,err.message);
        res.send(responseObj);
    }
};
