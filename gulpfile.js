const { src, dest, watch, series, parallel } = require('gulp');
const ts = require('gulp-typescript');
const templateCache = require('gulp-angular-templatecache');
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const merge = require('merge-stream');

// for production / build
function jsTask() {
    var tsProject = ts.createProject('tsconfig.json');
    return src('app/**/*.ts')
        .pipe(tsProject())
        .pipe(concat('otr-ui-shared-components.js'))
        .pipe(dest('dist'))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(uglify())
        .pipe(dest('dist'));
}

function cssTask() {
    return src('app/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('otr-ui-shared-components.css'))
        .pipe(dest('dist'));
}

function htmlTask() {
    return src('app/**/*.html')
        .pipe(templateCache({
            filename: 'otr-ui-shared-components.tpls.js',
            module: 'otr-ui-shared-components.tpls',
            standalone: true
        }))
        .pipe(dest('dist'))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(uglify())
        .pipe(dest('dist'));
}

function createIndex() {
    const indexStream = src(['dist/*.js', '!dist/*.min.js'])
        .pipe(concat('index.js'))
        .pipe(dest('dist'));

    const minifiedIndexStream = src(['dist/*.min.js'])
        .pipe(concat('index.min.js'))
        .pipe(dest('dist'));

    return merge(indexStream, minifiedIndexStream);
}

function cleanScripts() {
    return src('dist')
        .pipe(clean());
}

exports.clean = cleanScripts;
exports.build = series(parallel(jsTask, cssTask, htmlTask), createIndex);