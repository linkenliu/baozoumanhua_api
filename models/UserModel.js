/**
 * Created by liusheng on 16/11/11.
 */
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: {type: String},
    nickname:{type:String},
    phone: {type: String, default:''},
    email: {type: String},
    sex: {type: Number,default:1},
    password:{type:String,default: ''},
    avatar: { type: String, default: '' },
    state: { type: Number, default: 1 },
    create_date: {type: Date, default: null},
    update_date: {type: Date, default: null}
});


module.exports = mongoose.model('User', UserSchema);