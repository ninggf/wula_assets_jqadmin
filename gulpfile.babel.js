import gulp from "gulp";
import clean from "gulp-rimraf";
import rename from "gulp-rename";
import less from "gulp-less";
import cssmin from "gulp-clean-css";

import uglify from "gulp-uglify";
import jsvalidate from "gulp-jsvalidate";
import notify from "gulp-notify";
import babel from "gulp-babel";
import minimist from "minimist";
import webserver from "gulp-webserver";

let knownOptions = {
	string : 'env',
	default: {env: process.env.NODE_ENV || 'dev'}
};

let options = minimist(process.argv.slice(2), knownOptions);

// 删除已经生成的文件
gulp.task('clean', [], function () {
	console.log("Clean all files in build folder");
	return gulp.src([
			"css/jqadmin*.css",
			"css/black/theme*.css",
			"css/blue/theme*.css",
			'jqmodules/wula*.js'
		], {read: false}
	).pipe(clean());
});

gulp.task('default', ['build'], function () {

});

// 生成最终文件，并清空生成的中间文件.
gulp.task('build', ['css', 'js'], function () {
});

// 编译less文件
gulp.task('css', [], function () {
	let ccss = gulp.src(['less/*.less', 'less/**/*.less']).pipe(less()).pipe(gulp.dest('css'));
	if (options.env === 'pro')
		return ccss.pipe(cssmin())
			.pipe(rename({extname: '.min.css'}))
			.pipe(gulp.dest('css'));
});
// 编译js文件
gulp.task('js', [], function () {
	let js = gulp.src([
		'src/*.js'
	]).pipe(babel({
		presets: ['env']
	}))
		.pipe(jsvalidate())
		.on('error', notify.onError(e => e.message))
		.pipe(gulp.dest('jqmodules'));

	if (options.env === 'pro')
		return js.pipe(uglify())
			.pipe(rename({
				extname: '.min.js'
			}))
			.pipe(gulp.dest('js'));
});

gulp.task('watch', ['build'], function () {
	options.env = 'dev';
	gulp.src('.').pipe(webserver({
		open    : 'demo/',
		fallback: '404.html'
	}));
	gulp.watch(['less/**'], ['css']);
	gulp.watch(['src/**'], ['js']);
});