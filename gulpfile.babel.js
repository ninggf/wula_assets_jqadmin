import gulp from "gulp";
import clean from "gulp-rimraf";
import less from "gulp-less";
import cssmin from "gulp-clean-css";

import uglify from "gulp-uglify";
import jsvalidate from "gulp-jsvalidate";
import notify from "gulp-notify";
import babel from "gulp-babel";
import minimist from "minimist";
import webserver from "gulp-webserver";
import include from "gulp-include";
import cssBase64 from "gulp-css-base64";

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
			"css/login.css",
			"css/black/theme*.css",
			"css/blue/theme*.css",
			'js/*.js'
		], {read: false}
	).pipe(clean());
});

gulp.task('default', ['build'], function () {

});

// 生成最终文件，并清空生成的中间文件.
gulp.task('build', ['css', 'jqa', 'js'], function () {
});

// 编译less文件
gulp.task('css', ['icss'], function () {
	let ccss = gulp.src(['less/jqadmin.less', 'less/login.less', 'less/select2.less', 'less/b*/*.less'])
		.pipe(less())
		.pipe(gulp.dest('css'));

	if (options.env === 'pro')
		return ccss.pipe(cssmin())
			.pipe(gulp.dest('css'));
});

gulp.task('icss', [], function () {
	let ccss = gulp.src(['less/ztree.less'])
		.pipe(less())
		.pipe(cssBase64())
		.pipe(gulp.dest('css'));

	if (options.env === 'pro')
		return ccss.pipe(cssmin())
			.pipe(gulp.dest('css'));
});
// 编译js文件
gulp.task('js', [], function () {
	let js = gulp.src([
		'src/ms/*.js'
	]).pipe(include()).pipe(babel({
		presets: ['env']
	})).pipe(jsvalidate())
		.on('error', notify.onError(e => e.message))
		.pipe(gulp.dest('js'));

	if (options.env === 'pro')
		return js.pipe(uglify())
			.pipe(gulp.dest('js'));
});
// 编译jqadmin文件
gulp.task('jqa', [], function () {
	let js = gulp.src([
		'src/jqa/*.js'
	]).pipe(gulp.dest('js'));

	if (options.env === 'pro')
		return js.pipe(uglify())
			.pipe(gulp.dest('js'));

});
gulp.task('watch', ['build'], function () {
	options.env = 'dev';
	gulp.watch(['less/**'], ['css']);
	gulp.watch(['src/ms/**'], ['js']);
	gulp.watch(['src/jqa/**'], ['jqa']);

	gulp.src('.').pipe(webserver({
		open    : 'demo/',
		fallback: '404.html'
	}));
});