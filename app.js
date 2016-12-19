var express = require('express');
var path = require('path');
var ejs = require('ejs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var config = require('./config/config');



var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    extend = require('mongoose-schema-extend');
// Connect to mongodb
var connect = function () {
  mongoose.connect(config.mongoDB,{server: {socketOptions: {keepAlive: 1}}});
};
connect();
autoIncrement.initialize(mongoose.connection);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.on('disconnected', connect);



var apiv1Admin = require('./routes/apiv1Admin');
var apiv1Home = require('./routes/apiv1Home');

var app = express();

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  if(req.method=="OPTIONS") res.send(200);/*让options请求快速返回*/
  else  next();
});

require('./routes/chat')(app);






// 设置会话参数
app.use(session({
  name:'connect.sid',//这里的name值得是cookie的name，默认cookie的name是：connect.sid
  secret:'1234567890QWERTY',
  cookie: {
    secure: false
  },
  resave: true, // 即使 session 没有被修改，也保存 session 值，默认为 true。
  saveUninitialized: true
}));


//登陆验证
app.use('/admin',function(req,res,next){
  //session不存在并且不是登陆页面时跳转到对应的页面
  if (!req.session.sessionUser && req.url == "/login") {
    next();
  } else if(req.session.sessionUser){
    app.locals.sessionUser = req.session.sessionUser;
    next();
  } else {
    //否则跳转到登陆页面
    res.render('admin/login',{errData:''});
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'views')));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', apiv1Admin);
app.use('/',apiv1Home);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.send(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send("呃,好像有点问题...");
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send("呃,好像有点问题...");
});


module.exports = app;
