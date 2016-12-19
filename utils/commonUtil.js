var crypto = require('crypto');

/**
 * password加密       crypto
 * 参数:需要加密的字符串
 * @param {Object} params
 */
exports.encrypt = function(params){
	var cipher = crypto.createCipher('aes-256-cbc','InmbuvP6Z8');
	var crypted = cipher.update(params,'utf8','hex');
	crypted += cipher.final('hex');
	return crypted;
};

/**
 * password 解密  crypto
 * @param {Object} params
 */
exports.decrypt = function(params){
	var decipher = crypto.createDecipher('aes-256-cbc','InmbuvP6Z8');
	var dec = decipher.update(params,'hex','utf8');
	dec += decipher.final('utf8');
	return dec;	
};




