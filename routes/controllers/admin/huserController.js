'use strict';
const
    HUserModel = require('../../../models/HUserModel'),
    dateUtil = require('../../../utils/dateUtil'),
    uuid = require('../../../utils/uuid'),
    config = require('../../../config/config'),
    Response = require('../../../utils/responseObj'),
    moment = require("moment"),
    fse = require('fs-extra'),
    logger = require('../../../utils/logger.js').getLogger('admin'),
    Promise = require('promise'),
    async = require('async');




exports.getHuserList = async (req,res)=>{
    let responseObj = Response();
    try{
        let huserList = await HUserModel.find();
        huserList = await Promise.all(huserList.map(async(huser)=>{
            if(huser.create_date)
                huser._doc.create_date = dateUtil.formatDate(huser.create_date);
            return huser;
        }));
        responseObj.huserList = huserList;
        await res.send(responseObj);
    }catch(err){
        responseObj.errMsg(false,err.message);
        logger.error("getHuserList Error : "+err.message);
        res.send(responseObj);
    }
};