const gulp = require('gulp');
const terser = require('gulp-terser');
const ts = require('gulp-typescript');
const merge = require("merge2");

const tsProject = ts.createProject('tsconfig.json');

gulp.task('default', function () {
    let { js, dts } = tsProject.src()
        .pipe(tsProject());

    js = js.pipe(terser({
        module: true,
        ecma: 2017,
    }));

    return merge([ js, dts ])
        .pipe(gulp.dest('dist'));
});
