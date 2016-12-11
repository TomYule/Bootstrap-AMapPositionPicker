var gulp = require('gulp');
var concat = require('gulp-concat');//合并
var uglify = require('gulp-uglify');//压缩JS
var rename = require('gulp-rename');//重命名

gulp.task('scripts', function () {
    gulp.src('src/js/*.js')
        .pipe(concat('bootstrap.AMapPositionPicker.js'))
        .pipe(gulp.dest('./dist'))
        .pipe(rename('bootstrap.AMapPositionPicker.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
    console.log('gulp task is done');//自定义提醒信息
});
gulp.task('default', function () {
    gulp.run('scripts');
    gulp.watch('src/js/*.js', function () {
        gulp.run('scripts');
    });
});