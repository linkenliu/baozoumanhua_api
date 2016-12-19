'use strict';
module .exports = {
    service_path:'http://127.0.0.1:3000/',
    baozoumanhua_service:'http://baozoumanhua.com',
    baozoumanhua:[
        {
            "value":"",
            "text":"---请选择---"
        },
        {
            "value":"baoman",
            "text":"暴漫"
        },
        {
            "value":"qutu",
            "text":"趣图"
        },
        {
            "value":"videos",
            "text":"视频"
        },
        {
            "value":"text",
            "text":"文字"
        }
    ],
    "qiniu_config":{
        "accessKey":"you qiniu accessKey",
        "secretKey":"you qiniu secretKey"
    },
    "mongoDB":"mongodb://127.0.0.1:27017/database",
    "redisDB": {
        "dbhost": "127.0.0.1",
        "port": 6379,
        "password": ""
    },
    qiniu:'you qiniu service'
};