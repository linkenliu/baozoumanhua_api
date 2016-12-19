'use strict';
const qiniu = require('qiniu'),
      config = require('../config/config');


let accessKey = config.qiniu_config.accessKey,
    secretKey = config.qiniu_config.secretKey;

qiniu.conf.ACCESS_KEY = accessKey;
qiniu.conf.SECRET_KEY = secretKey;


let qiniuObj ={};


qiniuObj.upToken = function(bucketName, callbackUrl, callbackBody, returnUrl) {
    var putPolicy = new qiniu.rs.PutPolicy(bucketName);//只传递一个参数实际上是scope(bucket),其余参数暂不指定
    putPolicy.callbackUrl = callbackUrl || null;//回调地址，即上传成功后七牛服务器调用我的服务器地址,七牛发出的是post请求
    putPolicy.callbackBody = callbackBody || null;//form表单提交的内容会返回
    putPolicy.expires = 3600 * 24 * 365|| null;//uptoken过期时间，默认3600s=1小时
    putPolicy.getFlags(putPolicy);
    return putPolicy.token();
};


qiniuObj.uploadFile = function(localFile, key, upToken) {
    return new Promise((resolve, reject)=>{
        let extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(upToken, key, localFile, extra, function(err, ret) {
            if(err){
                reject({success:false,message:'上传失败'});
            }else{
                resolve({success:true,message:'上传成功',key:ret.key});
            }
        });
    });
};

/**
 * 删除七牛服务器上的文件
 * @param {Object} bucketName 七牛空间名称
 * @param {Object} key	图片key值
 * @param {Object} callback
 */
qiniuObj.delImage = function(bucketName, key){
    let Promise = new Promise((resolve,reject)=>{
        let client = new qiniu.rs.Client();
        client.remove(bucketName, key, function(err) {
            if (err) {
                reject({success:false,message:'删除失败'});
            } else {
                reject({success:true,message:'删除成功'});
            }
        });
    });
    return Promise;
};

module.exports=qiniuObj;