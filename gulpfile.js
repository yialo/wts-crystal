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
const sassGlob = require('gulp-sass-glob');
const zopfli = require('imagemin-zopfli');

// Task functions

const minsvg = function mimimizeSvgImages() {
  return gulp.src('./spec/img-raw/*.svg')
    .pipe(minimage([
      minimage.svgo({
        plugins: [
          { addAttributesToSVGElement: false },
          { addClassesToSVGElement: false },
          { cleanupAttrs: false },
          { cleanupEnableBackground: true },
          { cleanupIDs: false },
          { cleanupListOfValues: true },
          { cleanupNumericValues: true },
          { collapseGroups: true },
          { convertColors: true },
          { convertPathData: true },
          { convertShapeToPath: false },
          { convertStyleToAttrs: false },
          { convertTransform: true },
          { inlineStyles: false },
          { mergePaths: true },
          { minifyStyles: false },
          { moveElemsAttrsToGroup: true },
          { moveGroupAttrsToElems: false },
          { prefixIds: false },
          { removeAttrs: true },
          { removeComments: true },
          { removeDesc: true },
          { removeDimensions: true },
          { removeDoctype: true },
          { removeEditorsNSData: true },
          { removeElementsByAttr: false },
          { removeEmptyAttrs: true },
          { removeEmptyContainers: true },
          { removeEmptyText: true },
          { removeHiddenElems: true },
          { removeMetadata: true },
          { removeNonInheritableGroupAttrs: true },
          { removeRasterimg: false },
          { removeScriptElement: true },
          { removeStyleElement: true },
          { removeTitle: true },
          { removeUnknownsAndDefaults: true },
          { removeUnusedNS: true },
          { removeUselessDefs: false },
          { removeUselessStrokeAndFill: true },
          { removeViewBox: false },
          { removeXMLNS: false },
          { removeXMLProcInst: true },
          { sortAttrs: false },
        ],
      }),
    ]))
    .pipe(gulp.dest('./source/img/'));
};

const minbitmap = function minimizeBitmapImages() {
  return gulp.src('./spec/img-raw/*.{jpg,png}')
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
    .pipe(sassGlob())
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
