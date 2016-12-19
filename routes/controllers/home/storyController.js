'use strict';
let
    async = require('async'),
    cheerio = require('cheerio'),
    dateUtil = require('../../../utils/dateUtil'),
    config = require('../../../config/config'),
    Response = require('../../../utils/responseObj'),
    StoryModel = require('../../../models/StoryModel'),
    myClient = require('../../../utils/redisDB').myClient,
    Promise = require('promise'),
    logger = require('../../../utils/logger.js').getLogger('admin'),
    requestModule = require('request');


/**
 * get Story All
 * sort create_date desc
 * @param req
 * @param res
 */
exports.getStory = async (req, res)=> {
    let responseObj = Response();
    let params = {};
    let order = {};
    order.sort = {'create_date': -1};
    const cacheKey = "BAOMAN_STORY_HOME";
    const expire = 600;//单位秒
    let body = await myClient.select(cacheKey);
    if (!body.success) {
        responseObj.errMsg(false, '服务器异常,请稍后再试.');
        res.send(responseObj);
    }
    if (body.reply) {
        res.send(body.reply);
    } else {
        try {
            let storyList = await StoryModel.find(params).populate('User user_id', 'username avatar').sort(order.sort).exec();
            responseObj.storyList = storyList;
            myClient.setValue(cacheKey, expire, responseObj);
            await res.send(responseObj);
        } catch (err) {
            responseObj.errMsg(false, '服务器异常,请稍后再试.');
            logger.error("getStory Error : " + err.message);
            res.send(responseObj);
        }
    }
};

/**
 * story details
 * _id key_id
 * @param req
 * @param res
 */
exports.getStoryDetails = async (req, res)=> {
    let responseObj = Response();
    let _id = req.query._id;
    if (!_id) {
        res.send({success: false, message: '_id is empty'});
        return;
    }
    try {
        let story = await StoryModel.findOne({_id: _id}).populate('User user_id', 'username avatar').exec();
        if (!story) {
            responseObj.errMsg(false, 'Not found story');
        } else {
            responseObj.story = story;
        }
        res.send(responseObj);
    } catch (err) {
        responseObj.errMsg(false, '服务器异常,请稍后再试.');
        logger.error("getStoryDetails Error : " + err.message);
        res.send(responseObj);
    }
};

