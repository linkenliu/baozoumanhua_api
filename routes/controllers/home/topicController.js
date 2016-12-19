'use strict';
const
    async = require('async'),
    cheerio = require('cheerio'),
    dateUtil = require('../../../utils/dateUtil'),
    Response = require('../../../utils/responseObj'),
    Promise = require('promise'),
    config = require('../../../config/config'),
    TopicModel = require('../../../models/TopicModel'),
    myClient = require('../../../utils/redisDB').myClient,
    logger = require('../../../utils/logger.js').getLogger('admin'),
    requestModule = require('request');


/**
 *
 * @param req
 * @param res
 */
exports.getTopicList = async (req, res)=> {
    console.log("#########"+JSON.stringify(req.query))
    let responseObj = Response(),
        index = req.query.pageIndex ? req.query.pageIndex : 1,
        pageSize = req.query.pageSize ? req.query.pageSize : 20,
        pageIndex = index == null ? 0 : (index - 1) * pageSize,
        searchText = req.query.searchText == 'undefined' ? '' : req.query.searchText,
        orderField = req.query.order ? req.query.order : '',
        sort = req.query.sort ? req.query.sort : '',
        topic_type = req.query.topic_type ? req.query.topic_type : '',
        params = {};
    if (searchText != 'undefined' && searchText) {
        let reg = new RegExp("^[0-9]*$");
        if (!reg.test(searchText)) {
            params.title = new RegExp(searchText);
        } else {
            params.$or = [{'topic_id': searchText}, {'title': new RegExp(searchText)}];
        }
    }
    let order = {};
    order.sort = {'release_date': -1};
    if (orderField == 'topic_id' && sort) {
        order.sort = {topic_id: sort};
    } else if (orderField == 'release_date' && sort) {
        order.sort = {release_date: sort};
    }
    if (topic_type) params.topic_type = topic_type;
    const cacheKey = "BAOMAN_TOPIC_HOME" + pageIndex + topic_type;
    const expire = 600;//单位秒
    let body = await myClient.select(cacheKey);
    if (!body.success) {
        responseObj.errMsg(false, '服务器异常,请稍后再试.');
        return res.send(responseObj);
    }
    if (body.reply) {
        res.send(body.reply);
    } else {
        try {
            let query = TopicModel.find(params);
            if (topic_type) {
                query.where('topic_type', topic_type);
            }
            query.skip(parseInt(pageIndex));
            query.limit(parseInt(pageSize));
            query.sort(order.sort);
            let topicList = await query.exec();
            topicList = await Promise.all(topicList.map(async (topic) => {
                if (topic.release_date) {
                    topic._doc['release_date'] = await dateUtil.formatDate(topic.release_date);
                }
                if (topic.topic_type == 'videos') {
                    if (topic.image_url && topic.image_url.indexOf('!') > -1) {
                        topic._doc['image_url'] = topic.image_url.substring(0, topic.image_url.indexOf('!'));
                    }
                }
                return topic;
            }));
            let topicType = config.baozoumanhua;
            let resObj = {
                success: true,
                message: 'ok',
                topicList: topicList,
                topicType: topicType
            };
            myClient.setValue(cacheKey, expire, resObj);
            await res.json(resObj);
        } catch (err) {
            responseObj.errMsg(false, '服务器异常,请稍后再试.');
            logger.error("getTopicList Error : " + err.message);
            res.send(responseObj);
        }
    }
};





