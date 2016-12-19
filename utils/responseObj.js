var Response =  function() {
    this.success = true;
    this.message = "ok";
    this.errMsg =  function(success, message) {
        this.success = success;
        this.message = message;
        //delete this.errMsg;
    };
    //if(this.success) delete this.errMsg;

};
module.exports = function(options) {
    return new Response(options);
};