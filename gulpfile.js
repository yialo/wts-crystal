'use strict';

// Variables

const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const del = require('del');
const gulp = require('gulp');
const mincss = require('gulp-csso');
const minimage = require('gulp-imagemin');
const minjs = require('gulp-terser');
const mozjpeg = require('imagemin-mozjpeg');
const plumber = require('gulp-plumber');
const pngquant = require('imagemin-pngquant');
const postcss = require('gulp-postcss');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sassglob = require('gulp-sass-glob');
const zopfli = require('imagemin-zopfli');

// Task functions

const minsvg = function mimimizeSvgImages() {
  return gulp.src('./specification/img-raw/*.svg')
    .pipe(minimage([
      minimage.svgo({
        plugins: [
          { cleanupAttrs: false },
          { inlineStyles: false },
          { removeDoctype: true },
          { removeXMLProcInst: true },
          { removeComments: true },
          { removeMetadata: true },
          { removeTitle: true },
          { removeDesc: true },
          { removeUselessDefs: false },
          { removeXMLNS: false },
          { removeEditorsNSData: true },
          { removeEmptyAttrs: true },
          { removeHiddenElems: true },
          { removeEmptyText: true },
          { removeEmptyContainers: true },
          { removeViewBox: false },
          { cleanupEnableBackground: true },
          { minifyStyles: false },
          { convertStyleToAttrs: false },
          { convertColors: true },
          { convertPathData: true },
          { convertTransform: true },
          { removeUnknownsAndDefaults: true },
          { removeNonInheritableGroupAttrs: true },
          { removeUselessStrokeAndFill: true },
          { removeUnusedNS: true },
          { cleanupIDs: false },
          { cleanupNumericValues: true },
          { cleanupListOfValues: true },
          { moveElemsAttrsToGroup: true },
          { moveGroupAttrsToElems: false },
          { collapseGroups: true },
          { removeRasterimg: false },
          { mergePaths: true },
          { convertShapeToPath: false },
          { sortAttrs: false },
          { removeDimensions: true },
          { removeAttrs: true },
          { removeElementsByAttr: false },
          { addClassesToSVGElement: false },
          { addAttributesToSVGElement: false },
          { removeStyleElement: true },
          { removeScriptElement: true },
        ],
      }),
    ]))
    .pipe(gulp.dest('./source/img/'));
};

const minbitmap = function minimizeBitmapImages() {
  return gulp.src('./specification/img-raw/*.{jpg,png}')
    .pipe(minimage([
      pngquant({
        speed: 1,
        quality: 80,
      }),
      zopfli({
        more: true,
      }),
      minimage.jpegtran({
        progressive: true,
      }),
      mozjpeg({
        quality: 90,
      }),
    ]))
    .pipe(gulp.dest('./source/img/'));
};

const cleanbuild = function deleteFormerBuildFolder() {
  return del('./build/');
};

const copyvideo = function copyVideoFilesToBuildFolder() {
  return gulp.src('./source/video/*.mp4')
    .pipe(gulp.dest('./build/video/'));
};

const copyfonts = function copyFontFilesToBuildFolder() {
  return gulp.src('./source/fonts/*.{woff,woff2}')
    .pipe(gulp.dest('./build/fonts/'));
};

const copysvg = function copySvgImagesToBuildFolder() {
  return gulp.src('./source/img/*.svg')
    .pipe(gulp.dest('./build/img/'));
};

const copybitmap = function copyBitmapImagesToBuildFolder() {
  return gulp.src('./source/img/*.{jpg,png}')
    .pipe(gulp.dest('./build/img/'));
};

const scripts = function launchJsCompiler() {
  return gulp.src([
    './source/js/*.js',
    './source/js/vendors/*.js',
  ])
    .pipe(minjs())
    .pipe(gulp.dest('./build/js/'));
};

const style = function launchCssCompiler() {
  return gulp.src('./source/sass/main.scss')
    .pipe(plumber())
    .pipe(sassglob())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
    ]))
    .pipe(gulp.dest('./build/css/'))
    .pipe(mincss())
    .pipe(rename('main.min.css'))
    .pipe(gulp.dest('./build/css/'))
    .pipe(browserSync.stream());
};

const html = function launchHtmlCompiler() {
  return gulp.src('./source/pug/*.pug')
    .pipe(plumber())
    .pipe(pug())
    .pipe(gulp.dest('./build/'))
    .pipe(browserSync.stream());
};

const serve = function launchBrowserSync() {
  browserSync.init({
    cors: true,
    notify: false,
    open: true,
    server: { baseDir: './build/' },
  });
  gulp.watch('./source/js/**/*.js', scripts).on('change', browserSync.reload);
  gulp.watch('./source/sass/**/*.scss', style);
  gulp.watch('./source/pug/**/*.pug', html);
};

// Gulp tasks

gulp.task('build', gulp.series(cleanbuild, gulp.parallel(copyfonts, copyvideo, copysvg, copybitmap), scripts, style, html));
gulp.task('serve', serve);

gulp.task('imagemin', gulp.parallel(minsvg, minbitmap));
gulp.task('imagecopy', gulp.parallel(copysvg, copybitmap));
gulp.task('imagerenew', gulp.series(gulp.parallel(minsvg, minbitmap), gulp.parallel(copysvg, copybitmap)));

gulp.task('svgmin', minsvg);
gulp.task('svgcopy', copysvg);
gulp.task('svgrenew', gulp.series(minsvg, copysvg));

gulp.task('bitmapmin', minbitmap);
gulp.task('bitmapcopy', copybitmap);
gulp.task('bitmaprenew', gulp.series(minbitmap, copybitmap));
