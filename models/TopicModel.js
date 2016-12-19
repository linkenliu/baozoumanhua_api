'use strict';
let mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment');

let TopicSchema = new mongoose.Schema({
    topic_id: {type : Number, index: { unique: true }},
    username:{type:String},
    title: {type: String},
    site_id: {type: String},
    site_type: {type: String},
    topic_type: {type: String},
    topic_second_type: {type: String},
    avatar: {type: String},
    image_url: {type: String},
    video_url: {type: String},
    release_date: {type: Date},
    view_count: { type: Number, default: 1 },
    collect_count: { type: Number, default: 1 },
    share_count: { type: Number, default: 1 },
    state: { type: Number, default: 1 },
    create_date: {type: Date},
    update_date: {type: Date}
});

TopicSchema.plugin(autoIncrement.plugin, {
    model: 'topic',
    field: 'topic_id',
    startAt: 1,
    incrementBy:1
});
module.exports = mongoose.model('topic', TopicSchema);