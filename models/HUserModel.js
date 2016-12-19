/**
 * Created by liusheng on 16/11/11.
 */
var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment');

var HUserSchema = new mongoose.Schema({
    number_id: {type : Number, index: { unique: true }},
    uuid:{type:String,default:''},
    username: {type: String,default:''},
    nickname:{type:String,default :''},
    phone: {type: String, default:''},
    email: {type: String,default:''},
    birthday:{type:Date,default:null},
    sex: {type: Number,default:1},
    password:{type:String,default: ''},
    introduction:{type:String,default:''},
    avatar: { type: String, default: '' },
    state: { type: Number, default: 1 },
    create_date: {type: Date, default: null},
    update_date: {type: Date, default: null}
});

HUserSchema.plugin(autoIncrement.plugin, {
    model: 'HUser',
    field: 'number_id',
    startAt: 1,
    incrementBy:1
});

module.exports = mongoose.model('HUser', HUserSchema);