
// 引入 gulp
var gulp = require('gulp');

// 引入组件
var jshint = require('gulp-jshint');//js语法检查
var concat = require('gulp-concat');//文件合并
var uglify = require('gulp-uglify');//js压缩
var rename = require('gulp-rename');//文件重命名
var minifycss = require('gulp-minify-css');//css压缩
var babel = require('gulp-babel');


gulp.task('jshint', function() {
    gulp.src('./public/js/admin/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


gulp.task('default',function(){
    console.log('hello world');
});