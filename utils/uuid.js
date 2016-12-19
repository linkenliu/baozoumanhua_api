var uuid = require('node-uuid');

/* 删除'-'组成32位UUID */
module.exports = {
	v1: function() {
		return uuid.v1().replace(/\-/g, '');
	}
};