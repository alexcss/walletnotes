var gulp        = require('gulp'),                      // main gulp file
	jade        = require('gulp-jade'),                 // jade to convert html
    inject      = require("gulp-inject"),                    // injection plugin for Gulp
    concat      = require('gulp-concat'),                    // concatenates files
    browserify  = require('browserify'),                // to process JS
    source      = require('vinyl-source-stream'),       // to translate from browserify to what gulp understands
    streamify   = require('gulp-streamify'),            // buffer all content to use it in uglify
    uglify      = require('gulp-uglify'),               // minificate js files
    sass        = require('gulp-sass'),                 // thanks GOD for sass ))
    prefix      = require('gulp-autoprefixer'),         // to use actual prefixes
    cache       = require('gulp-cache'),                // cache images not to minify multiple times
    imagemin    = require('gulp-imagemin'),             // minify images size
    livereload  = require('gulp-livereload');           // to use liveReload in chrome

//variables
var outputDir = 'build/';
var AUTOPREFIXER_BROWSERS = [
    'ie >= 8',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

gulp.task('jade', function(){
	return gulp.src('src/templates/**/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(outputDir));
});

gulp.task('js', function () {
    //return browserify('./src/js/main.js')
    //    .bundle()
        //.pipe(source('bundle.js'))
        //.pipe(streamify(uglify()))
        //.pipe(gulp.dest(outputDir + '/js'));
});

gulp.task('glueJs', function() {
    gulp.src([
        './src/js/includes/responsive-nav.js',
        './src/js/includes/easings.min.js',
        './src/js/includes/fullPage.min.js',
        './src/js/includes/animations.js',
        './src/js/main.js'
    ])
        .pipe(concat('main.js'))
        .pipe(gulp.dest(outputDir + '/js'));
});

gulp.task ('sass', function() {
    var config = {};
    // development
        config.sourceComments = 'map';
    // production
        //config.outputStyle = 'compressed';

    return gulp.src('src/sass/main.scss')
        .pipe(sass(config))
        .pipe(prefix(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest(outputDir + '/css'));
});

gulp.task('images', function() {
    return gulp.src('./src/img/**/*')
        //.pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
        .pipe(gulp.dest(outputDir + '/img'))
});

gulp.task('static', function() {
    return gulp.src('src/static/**/*')
        .pipe(gulp.dest(outputDir));
});

gulp.task('watch', function() {
    gulp.watch('src/templates/**/*.jade', ['jade']);
    gulp.watch('src/js/**/*.js', ['glueJs']);
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/sass/**/*.scss', ['sass']);
    gulp.watch('src/img/**/*', ['images']);
    gulp.watch('src/static/**/*', ['static']);
    livereload.listen();                                        // Create LiveReload server
    gulp.watch(['build/**']).on('change', livereload.changed);   // Watch any files in dist/, reload on change
});



gulp.task('default', ['jade', 'glueJs', 'js', 'sass', 'images', 'static', 'watch']);
