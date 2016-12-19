'use strict';
const
    UserModel = require('../../../models/HUserModel'),
    dateUtil = require('../../../utils/dateUtil'),
    commonUtil = require('../../../utils/commonUtil'),
    uuid = require('../../../utils/uuid'),
    config = require('../../../config/config'),
    moment = require("moment"),
    fse = require('fs-extra'),
    Response = require('../../../utils/responseObj'),
    logger = require('../../../utils/logger.js').getLogger('admin'),
    async = require('async');


/*user register*/
exports.registerUser = async (req, res) => {
    let responseObj = Response();
    let params = req.body;
    params.password = commonUtil.encrypt(params.password);
    params.uuid = uuid.v1();
    params.create_date = dateUtil.formatDate();
    params.update_date = dateUtil.formatDate();
    var newUser = new UserModel(params);
    try {
        await newUser.save();
        let user = await UserModel.findOne({uuid: params.uuid});
        responseObj.message = '注册成功';
        responseObj.user = user;
        res.send(responseObj);
    } catch (err) {
        responseObj.errMsg(false, '系统异常,请稍后再试.');
        logger.error("registerUser Error : " + err.message);
        res.send(responseObj);
    }
};

/*user login */
exports.login = async (req, res)=> {
    console.log("POST========"+JSON.stringify(req.body));
    console.log("QUERY========"+JSON.stringify(req.query));
    let responseObj = Response();
    let username = req.body.username;
    let password = req.body.password;
    let user = await UserModel.findOne({username: username});
    if (!user) {
        responseObj.errMsg(false, '用户名或密码错误');
    }
    if (user) {
        password = commonUtil.encrypt(password);
        if (password != user.password) {
            responseObj.errMsg(false, '用户名或密码错误');
        } else {
            responseObj.message = '登录成功';
            responseObj.user = user;
        }
    }
    return res.send(responseObj);
};


exports.checkusername = async (req, res) => {
    let responseObj = Response();
    let _id = req.query._id;
    let username = req.query.username;
    if (!username) {
        return res.send({success: false, message: 'username is empty'});
    }
    let opts = {username: username};
    if (_id) {
        opts._id = {$ne: _id};
    }
    let user = await UserModel.findOne(opts);
    if (user) {
        responseObj.errMsg(false, '名称已被使用');
    }
    return res.send(responseObj);
};

exports.checkEmail = async (req, res)=> {
    let responseObj = Response();
    let email = req.query.email;
    if (!email) {
        res.json({"result": "OK"});
        return;
    }
    let opts = {email: email};
    if (req.query._id) {
        opts = {_id: {$ne: req.body._id}, email: email};
    }
    let user = await UserModel.findOne(opts);
    if (user) {
        responseObj.errMsg(false, '邮箱已被使用');
    }
    return res.send(responseObj);
};

