'use strict';
const
    async = require('async'),
    cheerio = require('cheerio'),
    dateUtil = require('../../../utils/dateUtil'),
    config = require('../../../config/config'),
    TopicModel = require('../../../models/TopicModel'),
    Response = require('../../../utils/responseObj'),
    logger = require('../../../utils/logger.js').getLogger('admin'),
    Promise = require('promise'),
    requestModule = require('request');

/**
 * topic list
 * @param req
 * @param res
 */
exports.getTopicList = async (req, res)=> {
    let responseObj = Response();
    let index = req.query.pageIndex ? req.query.pageIndex : 1;
    let pageSize = req.query.pageSize ? req.query.pageSize : 20;
    let pageIndex = index == null ? 1 : (index - 1) * pageSize;
    let searchText = req.query.searchText == 'undefined' ? '' : req.query.searchText;
    let orderField = req.query.order ? req.query.order : '';
    let sort = req.query.sort ? req.query.sort : '';
    let topic_type = req.query.topic_type ? req.query.topic_type : '';
    let params = {};
    if (searchText != 'undefined' && searchText) {
        let reg = new RegExp("^[0-9]*$");
        if (!reg.test(searchText)) {
            params.title = new RegExp(searchText);
        } else {
            params.$or = [{'topic_id': searchText}, {'title': new RegExp(searchText)}];
        }
    }
    if (topic_type) {
        params.topic_type = topic_type;
    }
    let order = {};
    order.sort = {'release_date': -1};
    if (orderField == 'topic_id' && sort) {
        order.sort = {topic_id: sort};
    } else if (orderField == 'release_date' && sort) {
        order.sort = {release_date: sort};
    }
    try {
        var [topicList, topicCount] = await Promise.all([
            TopicModel.find(params).skip(parseInt(pageIndex)).limit(parseInt(pageSize)).sort(order.sort).exec(),
            TopicModel.count(params)
        ]);
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
        let totalPage = topicCount % 20 == 0 ? topicCount / 20 : Math.ceil(topicCount / 20);
        let topicType = await config.baozoumanhua;
        await res.send({
            success: true,
            message: 'ok',
            topicList: topicList,
            totalCount: topicCount,
            totalPage: totalPage,
            currentPage: index,
            topicType: topicType
        });
    } catch (err) {
        responseObj.errMsg(false, err.message);
        logger.error("getTopicList Error : " + err.message);
        res.send(responseObj);
    }
};


/**
 * save topic
 * @param req
 * @param res
 */
exports.saveTopic = async (req, res)=> {
    let responseObj = Response();
    let params = req.body;
    if (params._id) {
        try {
            let topic = await TopicModel.findOne({_id: params._id});
            if (!topic) {
                responseObj.errMsg(false, 'no such topic!');
                res.send(responseObj);
            }
            topic.title = params.title;
            topic.collect_count = params.collect_count;
            topic.view_count = params.view_count;
            topic.state = params.state;
            await topic.save();
            await res.send(responseObj);
        } catch (err) {
            responseObj.errMsg(false, err.message);
            logger.error("getTopicList Error : " + err.message);
            res.send(responseObj);
        }
        let topic = await TopicModel.findOne();

    } else {
        console.log('save topic.....');
    }

};


exports.videowall = async (req, res)=> {
    let responseObj = Response();
    let params = {};
    let searchText = req.query.searchText ? req.query.searchText : '';
    params.topic_type = 'videos';
    if (searchText) {
        let reg = new RegExp("^[0-9]*$");
        if (!reg.test(searchText)) {
            params.title = new RegExp(searchText);
        } else {
            params.$or = [{'topic_id': searchText}, {'title': new RegExp(searchText)}];
        }
    }
    let topicList = await TopicModel.find(params)
        .where('state', 1)
        .select('topic_id title image_url video_url')
        .exec();
    responseObj.topicList = topicList;
    await res.send(responseObj);
};


/**
 * pull topic for baozoumanhua
 * 爬取暴走漫画帖子,爆漫,趣图,文字.
 * @param _params
 */
exports.pullTopic = async (_params)=> {
    requestModule.get(_params.url, async (err, data)=> {
        if (err) {
            logger.error("#########======>>pull Topic Error :" + err.message);
            return;
        }
        var $ = cheerio.load(data.body.toString());
        let topicValues = await getTopicValue($, _params);//获取values
        try {
            Promise.all(topicValues.map(async (topic) => {//迭代insert
                let f_topic = await TopicModel.findOne({site_id: topic.site_id});
                if (!f_topic) {
                    let newTopic = new TopicModel(topic);
                    await newTopic.save();
                }
            }));
        } catch (err) {
            logger.error("########===pullTopic Error===>>>" + err.message);
            console.dir("########===pullTopic Error===>>>" + err.message);
        }
    });
};

/**
 * pull topic for baozoumanhua
 * 爬取暴走漫画帖子,视频
 * @param _params
 */
exports.pullVideoTopic = (_params)=> {
    requestModule.get(_params.url, (err, data)=> {
        if (err) {
            logger.error("#########======1>>pull Video Topic Error :" + err.message);
            return;
        }
        var $ = cheerio.load(data.body.toString());
        let topicValues = getVideoTopicValue($, _params);
        ConverVideoTopicValue(topicValues, (err, topics)=> {
            try {
                Promise.all(topics.map(async (topic) => {//迭代insert
                    let newTopic = new TopicModel(topic);
                    await newTopic.save();
                }));
            } catch (err) {
                logger.error("########===pullTopic Error===>>>" + err.message);
                console.dir("########===pullTopic Error===>>>" + err.message);
            }
        });
    });
};






/*get value*/
let getVideoTopicValue = ($, _params)=> {
    let topicValues = [];
    $("div.video-main>div#top-programmes>div.video-section").each(function () {
        var topic_second_type = $(this).find('div.vs-header>div.vs-title>h2').text();
        $(this).find('div.video-items>div.video-i').each(function () {
            var params = {};
            params.site_type = _params.site_type;
            params.topic_type = _params.topic_type;
            params.topic_second_type = topic_second_type;
            var video_url_temp = $(this).find('a.vi-thumb').attr('href');
            var image_url = $(this).find('a.vi-thumb').find('img').attr('src');
            var title = $(this).find('p.vi-title>a').text();
            var view_count = $(this).find('div.vi-info>span:first-child').text();
            var site_id = video_url_temp.replace(/[^0-9]/ig, "");
            params.image_url = image_url;
            params.video_url_temp = video_url_temp;
            params.title = title;
            params.site_id = site_id;
            params.view_count = view_count;
            params.release_date = dateUtil.currentDate();
            params.create_date = dateUtil.currentDate();
            params.update_date = dateUtil.currentDate();
            topicValues.push(params);
        });
    });
    return topicValues;
};


let ConverVideoTopicValue = (_topicValues, next) => {
    let topicValueArr = [];
    let topicValues = _topicValues;
    async.mapSeries(topicValues, (item, cb)=> {
        TopicModel.findOne({site_id: item.site_id}, (err, topic) => {
            if (!err && !topic) {
                requestModule.get(config.baozoumanhua_service + item.video_url_temp, (err, data)=> {
                    if (err) {
                        logger.error("#########======3>>pull Video Topic Error :" + err.message);
                        return;
                    }
                    let $$ = cheerio.load(data.body.toString());
                    var video_url = $$("div.video-stage-left>div.video-stage-main div.v-player-box-main>p>object>embed").attr('src');
                    item.video_url = video_url;
                    topicValueArr.push(item);
                    cb(null, item);
                });
            } else {
                cb('error or exist topic ');
            }
        });
    }, (err)=> {
        console.log("#######" + topicValueArr.length + "------" + JSON.stringify(topicValueArr));
        next(err, topicValueArr);
    });
};


/*get value*/
let getTopicValue = ($, _params)=> {
    let topicValues = [];
    $("div.main-container>div.articles>div.article-" + _params.topic_type).each(function () {
        let avatar = $(this).find('div.user-item-wrap>div.user-avator img').attr('src');
        let username = $(this).find('div.user-item-wrap>div.article-meta-body div.article-author-field>a.article-author-name').text();
        let release_date = $(this).find('div.user-item-wrap>div.article-meta-body div.pull-right>span.article-date').text();
        let title = $(this).find('div.article-body>div.article-content>h4.article-title>a').text();
        let image_url = "";
        if (_params.topic_type != 'text') {
            image_url = $(this).find('div.article-body>div.article-content a img.lazy').attr('data-original-image-url');
            if (!image_url) {
                image_url = $(this).find('div.article-body>div.article-content ul li img').attr('src');
            }
            if (!image_url) {
                image_url = $(this).find('div.article-body>div.article-content video').attr('data-original-image-url');
            }
        }
        release_date = dateUtil.convertDateTime(release_date);
        let site_id = $(this).find('div.article-body>div.article-content>h4.article-title>a').attr('href');
        let topic_second_type = $(this).find('div.user-item-wrap>div.article-meta-body div.pull-right strong.article-label>a').text();
        if (site_id) {
            if (site_id.indexOf('?') > -1) {
                site_id = site_id.substring(site_id.indexOf('/articles/') + 10, site_id.indexOf('?'));
            } else {
                site_id = site_id.substring(site_id.indexOf('/articles/') + 10, site_id.length);
            }
        }
        let value = {
            avatar: avatar,
            title: title,
            site_id: site_id,
            site_type: _params.site_type,
            username: username,
            image_url: image_url,
            topic_type: _params.topic_type,
            topic_second_type: topic_second_type,
            release_date: release_date,
            create_date: dateUtil.currentDate(),
            update_date: dateUtil.currentDate()
        };
        topicValues.push(value);
    });
    return topicValues;
};