const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');
const ts = require('gulp-typescript');
const merge = require("merge2");

const tsProject = ts.createProject('tsconfig.json');

gulp.task('default', function () {
    let { js, dts } = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    js = js.pipe(terser({
        module: true,
        ecma: 2017,
    }));

    return merge([ js, dts ])
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest('dist'));
});
