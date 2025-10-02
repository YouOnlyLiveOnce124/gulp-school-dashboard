const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const terser = require('gulp-terser')
const concat = require('gulp-concat')
const htmlmin = require('gulp-htmlmin')
const browserSync = require('browser-sync').create()
const del = require('del')

const paths = {
  src: {
    html: 'src/*.html',
    scss: 'src/scss/main.scss',
    js: 'src/js/app.js',
    images: 'src/images/**/*',
    assets: 'src/assets/**/*',
  },
  dist: 'dist',
}

function clean() {
  return del([paths.dist])
}

function html() {
  return gulp
    .src(paths.src.html)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.stream())
}

function styles() {
  return gulp
    .src(paths.src.scss)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest(paths.dist + '/css'))
    .pipe(browserSync.stream())
}

function scripts() {
  const fs = require('fs')
  if (!fs.existsSync('dist/js')) {
    fs.mkdirSync('dist/js', { recursive: true })
  }

  console.log('🔧 Собираем JS из всех папок...')

  return gulp
    .src([
      'src/services/*.js',
      'src/utils/*.js',
      'src/composables/*.js',
      'src/js/components/UI/*.js',
      'src/js/app.js',
    ])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/js'))
    .on('end', () => {
      console.log('✅ JS собран из всех папок!')
    })
}

function images() {
  const fs = require('fs')
  if (!fs.existsSync('dist/images')) {
    fs.mkdirSync('dist/images', { recursive: true })
  }

  console.log('🖼️ Копируем изображения...')

  return gulp
    .src(paths.src.images)
    .pipe(gulp.dest('dist/images'))
    .on('end', () => {
      console.log('✅ Изображения скопированы!')
    })
}

function uiKit() {
  console.log('🎨 Копируем UI-Kit...')

  return gulp
    .src('src/ui-kit.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(paths.dist))
    .on('end', () => {
      console.log('✅ UI-Kit скопирован!')
    })
}

function serve() {
  browserSync.init({
    server: paths.dist,
    port: 3000,
  })
}

function watch() {
  gulp.watch(paths.src.html, html)
  gulp.watch('src/scss/**/*.scss', styles)
  gulp.watch('src/js/**/*.js', scripts)
  gulp.watch(paths.src.images, images)
  gulp.watch('src/ui-kit.html', uiKit)
}

const build = gulp.series(clean, gulp.parallel(html, styles, scripts, images, uiKit))
const dev = gulp.series(build, gulp.parallel(serve, watch))

exports.clean = clean
exports.build = build
exports.dev = dev
exports.scripts = scripts
exports.images = images
exports.uiKit = uiKit
exports.default = dev
