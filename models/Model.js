'use strict';
let UserModel = require('./UserModel'),
    TopicModel = require('./TopicModel'),
    StoryModel = require('./StoryModel');


exports.getModel = (model)=> {
    if (model=='user') return UserModel;
    else if(model == 'topic') return TopicModel;
    else if(model == 'story') return new StoryModel;
    else return null;

};