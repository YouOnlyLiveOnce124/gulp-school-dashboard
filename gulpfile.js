const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const terser = require('gulp-terser')
const concat = require('gulp-concat')
const htmlmin = require('gulp-htmlmin')
const browserSync = require('browser-sync').create()
const del = require('del')

// Пути
const paths = {
  src: {
    html: 'src/*.html',
    scss: 'src/scss/**/*.scss',
    js: 'src/js/app.js',
    assets: 'src/assets/**/*',
  },
  dist: 'dist',
}

// Очистка
function clean() {
  return del([paths.dist])
}

// HTML
function html() {
  return gulp
    .src(paths.src.html)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.stream())
}

// SCSS -> CSS
function styles() {
  return gulp
    .src(paths.src.scss)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest(paths.dist + '/css'))
    .pipe(browserSync.stream())
}

// JS
function scripts() {
  const fs = require('fs')
  if (!fs.existsSync('dist/js')) {
    fs.mkdirSync('dist/js', { recursive: true })
  }

  console.log('🔧 Собираем JS без минификации...')

  return (
    gulp
      .src(['src/js/components/UI/*.js', 'src/js/app.js'])
      .pipe(concat('app.js'))
      // .pipe(terser()) // ЗАКОММЕНТИРУЙ НА ВРЕМЯ
      .pipe(gulp.dest('dist/js'))
      .on('end', () => {
        console.log('✅ JS собран без минификации!')
      })
  )
}

// Сервер
function serve() {
  browserSync.init({
    server: paths.dist,
    port: 3000,
  })
}

// Вотчер
function watch() {
  gulp.watch(paths.src.html, html)
  gulp.watch(paths.src.scss, styles)
  gulp.watch('src/js/**/*.js', scripts)
}

// Таски
const build = gulp.series(clean, gulp.parallel(html, styles, scripts))
const dev = gulp.series(build, gulp.parallel(serve, watch))

exports.clean = clean
exports.build = build
exports.dev = dev
exports.scripts = scripts // ← ДОБАВЬ ЭТУ СТРОКУ
exports.default = dev
