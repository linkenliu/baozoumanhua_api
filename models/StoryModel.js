'use strict';
let mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment');

let StorySchema = new mongoose.Schema({
    story_id: {type : Number, index: { unique: true }},
    title: {type: String},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    image_url: {type: String},
    cover: {type: String},
    content:{type:String},
    release_date: {type: Date},
    view_count: { type: Number, default: 1 },
    collect_count: { type: Number, default: 1 },
    recommend:{type: Number, default: 0},
    state: { type: Number, default: 1 },
    create_date: {type: Date},
    update_date: {type: Date}
});



StorySchema.plugin(autoIncrement.plugin, {
    model: 'story',
    field: 'story_id',
    startAt: 1,
    incrementBy:1
});
let Story = mongoose.model('story', StorySchema);

let Promise = require('bluebird');
Promise.promisifyAll(Story);
Promise.promisifyAll(Story.prototype);
module.exports = Story;