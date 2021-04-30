const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const fileinclude = require('gulp-file-include');

const paths = {
    styles: {
        sass: ['./src/scss/**/*.scss']
    },
    html: ['./src/**/*.html', '!./src/**/_*.html'],
    js: './src/js/**/*.js',
    images: './src/i/**/*',
    fonts: './src/fonts/**/*'
}

const browsersync = () => {
    browserSync.init({
        server: {
            baseDir: './public/'
        }
    })
}

const styles = () => {
    return src(paths.styles.sass)
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(dest('./public/assets/css/'))
        .pipe(browserSync.stream())
}

const scripts = () => {
    return src(paths.js)
        .pipe(dest('./public/assets/js/'))
}

const images = () => {
    return src(paths.images)
        // .pipe(del('./public/assets/i/'))
        .pipe(dest('./public/assets/i/'))
}

const fonts = () => {
    return src(paths.fonts)
        // .pipe(del('./public/assets/fonts/'))
        .pipe(dest('./public/assets/fonts/'))
}

const html = () => {
    return src(paths.html, { base: './src'})
        .pipe(fileinclude({
            prefix: '@@',
            basepath: './src/components'
        }))
        .pipe(dest('./public/'))
}

const cleaning = () => {
    return del('./public/**/*', {force: true});
}

const buildCopy = () => {
    return src([
        paths.fonts,
        paths.images,
        paths.js
    ], { base: './src/' })
    .pipe(dest('./public/assets'));
}

const startWatch = () => {
    watch(paths.styles.sass, styles);
    watch(paths.js, scripts);
    watch(paths.images, images);
    watch(paths.images).on('unlink', e => {
        const path = e.split("\\").slice(1).join('/');

        del(`./public/assets/${path}`);
    });
    watch(paths.fonts, fonts);
    watch(paths.html, html);
    watch(paths.html).on('change', browserSync.reload);
    watch('./src/').on('unlinkDir', e => {
        const path = e.split('/')[1];

        del(`./public/${path}`);
    });
}

exports.build = series(cleaning, buildCopy, html, parallel(styles));
exports.dev = series(cleaning, buildCopy, html, parallel(styles, browsersync, startWatch));
exports.cleaning = cleaning;