'use strict';
const
    async = require('async'),
    cheerio = require('cheerio'),
    fse = require('fs-extra'),
    qiniu = require('../../../utils/qiniu'),
    qiniutoken = qiniu.upToken('baozou'),
    moment = require("moment"),
    requestModule = require('request'),
    uuid = require('../../../utils/uuid'),
    dateUtil = require('../../../utils/dateUtil'),
    Response = require('../../../utils/responseObj'),
    config = require('../../../config/config'),
    StoryModel = require('../../../models/StoryModel'),
    logger = require('../../../utils/logger.js').getLogger('ctrl');


/**
 * story list
 * searchText   story_id or title
 * orderField   story_id or create_date
 * sort         1 or -1
 * @param req
 * @param res
 */
exports.getStoryList = async (req, res)=> {
    let responseObj = Response();
    let params = {};
    let searchText = req.query.searchText ? req.query.searchText : '';
    let orderField = req.query.order;
    let sort = req.query.sort;
    if (searchText) {
        params.title = new RegExp(searchText);
    }
    let order = {};
    order.sort = {'create_date': -1};
    if (orderField == 'story_id' && sort) {
        order.sort = {story_id: sort};
    } else if (orderField == 'create_date' && sort) {
        order.sort = {create_date: sort};
    }
    try {
        let storyList = await StoryModel.find(params).populate('User user_id', 'username').sort(order.sort).exec();
        storyList.forEach((item)=> {
            item._doc.create_date = dateUtil.formatDate(item.create_date);
        });
        responseObj.storyList = storyList;
        await res.send(responseObj);
    } catch (err) {
        responseObj.errMsg(false, err.message);
        logger.error("getStoryList Error : " + err.message);
        res.send(responseObj);
    }
};


/**
 * find one story
 * _id  story PRIMARY_key
 * @param req
 * @param res
 */
exports.findOneStory = async (req, res)=> {
    let responseObj = Response();
    let _id = req.query._id;
    try {
        let story = await StoryModel.findOne({_id: _id});
        responseObj.story = story;
        res.send(responseObj);
    } catch (err) {
        responseObj.errMsg(false, err.message);
        logger.error("findOneStory Error : " + err.message);
        res.send(responseObj);
    }
};


exports.saveStory = async (req, res)=> {
    let responseObj = Response();
    _checkImage(req, res);
    let [bodyI, bodyC] = await Promise.all([
        qiniu.uploadFile(req.files.image.path, uuid.v1(), qiniutoken),
        qiniu.uploadFile(req.files.cover.path, uuid.v1(), qiniutoken)
    ]);
    if (!bodyI.success || !bodyC.success) {
        responseObj.errMsg(false, '上传失败');
        return res.send(responseObj);
    }
    let params = {};
    params.title = req.body.title;
    params.content = req.body.content;
    params.user_id = req.session.sessionUser._id;
    params.image_url = config.qiniu + bodyI.key;
    params.cover = config.qiniu + bodyC.key;
    params.release_date = dateUtil.formatDate();
    params.create_date = dateUtil.formatDate();
    params.update_date = dateUtil.formatDate();
    let newStory = new StoryModel(params);
    try {
        await newStory.save();
        await res.send(responseObj);
    } catch (err) {
        responseObj.errMsg(false, '新增失败');
        logger.error("editStory Error : " + err.message);
        res.send(responseObj);
    }
};


let _checkImage = (req, res)=> {
    if (req.files.image.type.size <= 0) return res.send({success: false, message: '请先选择图片'});
    if (req.files.image.type.indexOf('image') == -1) return res.send({success: false, message: '提交的不是图片文件'});
    if (req.files.cover.type.size <= 0) return res.send({success: false, message: '请先选择图片'});
    if (req.files.cover.type.indexOf('image') == -1) return res.send({success: false, message: '提交的不是图片文件'});
};


/**
 * edit story
 * @param req
 * @param res
 */
exports.editStory = async (req, res)=> {
    let responseObj = Response();
    let params = req.body;
    try {
        let story = await StoryModel.findOne({_id: params._id});
        if (!story) {
            responseObj.errMsg(false, 'update story error 1!');
            logger.error("getStoryList Error : update story error 1!");
            res.send(responseObj);
        }
        story.title = params.title;
        story.content = params.content;
        story.cover = params.cover;
        story.image_url = params.image_url;
        await story.save();
        await res.send(responseObj);
    } catch (err) {
        responseObj.errMsg(false, err.message);
        logger.error("editStory Error : " + err.message);
        res.send(responseObj);
    }
};

