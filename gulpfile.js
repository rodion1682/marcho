const { src, dest, watch, parallel, series } = require('gulp');

const scss         = require('gulp-sass');
const concat       = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify       = require('gulp-uglify');
const imagemin     = require('gulp-imagemin');
const del          = require('del');
const browserSync  = require('browser-sync').create();

// browsersync setup:

function browsersync(){
  browserSync.init({
    server: {
        baseDir: 'app/'
    },
    notify: false
  });
}

// styles setup (css):

function styles(){
  return src('app/scss/style.scss')
  .pipe(scss({outputStyle: 'compressed'}))
  .pipe(concat('style.min.css'))
  .pipe(autoprefixer({
    overrideBrowserslist: ['last 10 versions'],
    grid: true
  }))
  .pipe(dest('app/css'))
  .pipe(browserSync.stream())
}

// script setup (js):

function scripts(){
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/slick-carousel/slick/slick.js',
    'app/js/main.js'
  ])
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(dest('app/js'))
  .pipe(browserSync.stream())
}

// images minification setup:

function images(){
  return src('app/images/**/*.*')
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
  ]))
  .pipe(dest('dist/images'))
}

// final build app to dist:

function build(){
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js',
  ], {base: 'app'})
  .pipe(dest('dist'))
}

// delete dist folder:

function cleanDist(){
  return del('dist')
}

// watching setup:

function watching(){
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch('app/**/*.html').on('change', browserSync.reload);
}

// tast setup:

exports.styles      = styles;
exports.scripts     = scripts;
exports.browsersync = browsersync;
exports.watching    = watching;
exports.images      = images;
exports.cleanDist   = cleanDist;

// build tast setup:

exports.build       = series(cleanDist, images, build);

// default tast setup:

exports.default = parallel(styles, scripts, browsersync, watching);