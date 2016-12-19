'use strict';
const Model = require('../../../models/Model'),
    qiniu = require('../../../utils/qiniu'),
    uuid = require('../../../utils/uuid'),
    config = require('../../../config/config'),
    qiniutoken = qiniu.upToken('baozou'),
    logger = require('../../../utils/logger.js').getLogger('admin'),
    StoryModel = require('../../../models/StoryModel'),
    Response = require('../../../utils/responseObj');


/*common delete model */
exports.deleteModel = async (req, res) => {
    let responseObj = Response();
    let model = req.params.model;
    let _id = req.params._id;
    if (!_id) {
        res.json({success: false, message: '_id is empty'});
        return;
    }
    try {
        await Model.getModel(model).findOne({"_id": _id}).remove();
        await res.send(responseObj);
    } catch (err) {
        responseObj.errMsg(false, err.message);
        logger.error("deleteModel Error : " + err.message);
        res.send(responseObj);
    }
};

/*common upload image */
exports.upload = async (req, res)=> {
    let _id = req.body._id;
    let model = req.body.model;
    if (_id) {
        let body = await qiniu.uploadFile(req.files.files.path, uuid.v1(), qiniutoken);
        if (!body.success) return res.json({success: false, message: '上传失败'});
        try {
            let commonModel = await Model.getModel(model).findOne({"_id": _id});
            console.log(commonModel);
            if (!commonModel) return res.json({success: false, "message": "no such model!"});
            if (model == 'user')
                commonModel.avatar = config.qiniu + body.key;
            await commonModel.save();
            await res.json({success: true, "message": "ok", avatar: config.qiniu + body.key});
        } catch (err) {
            console.log(err.message);
            res.json({success: false, "message": err.message});
        }
    } else {
        let body = await qiniu.uploadFile(req.files.files.path, uuid.v1(), qiniutoken);
        if (!body.success) return res.json({success: false, message: '上传失败'});
        let image_url = config.qiniu + body.key;
        res.json({success: true, message: 'ok', image_url: image_url});
    }
};


/*upload image for qiniu */
exports.uploadForQiniu = async (req, res)=> {
    let responseObj = Response();
    if (req.files.files.type.indexOf('image') == -1) return res.send({
        success: false,
        message: '提交的不是图片文件',
        code: '001'
    });
    let body = await qiniu.uploadFile(req.files.files.path, uuid.v1(), qiniutoken);
    if (body.success) {
        responseObj.qiniu_image = config.qiniu + body.key;
    } else {
        responseObj.errMsg(false, body.message);
    }
    await res.send(responseObj);
};