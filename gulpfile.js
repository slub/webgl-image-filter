var gulp = require('gulp');
var closureCompiler = require('gulp-closure-compiler');

/**
 * Build of library with google closure compiler - simple optimization
 */
gulp.task('js-compile-simple', function() {
	return gulp.src(['src/**/*.js', 'lib/closure-library/closure/goog/**/*.js'])
    	.pipe(closureCompiler({
    		compilerPath: 'node_modules/closure-compiler/node_modules/google-closure-compiler/compiler.jar',
    		fileName: 'dist/glif.js',
    		compilerFlags: {
    			closure_entry_point: 'glif',
    			compilation_level: 'SIMPLE',
    			only_closure_dependencies: true,
    			warning_level: 'VERBOSE'
    		},
			output_wrapper: '/*!\n * WebGL image filter library\n * https://github.com/slub/webgl-image-filter/\n *\n * Released under the MIT license (https://github.com/slub/webgl-image-filter/blob/master/LICENSE)\n *\n * Date: 2015-11-04\n	*/\n(function(){%output%}).call(window);',
		}))
    	.pipe(gulp.dest('dist/')
    );
});

/**
 * Build of library with google closure compiler - advanced optimization (debug)
 */
gulp.task('js-compile-advanced-debug', function() {
	return gulp.src(['src/**/*.js', 'lib/closure-library/closure/goog/**/*.js'])
    	.pipe(closureCompiler({
    		compilerPath: 'node_modules/closure-compiler/node_modules/google-closure-compiler/compiler.jar',
    		fileName: 'dist/glif.min.js',
    		compilerFlags: {
    			closure_entry_point: 'glif',
    			formatting: [
    			     'pretty_print',
    			],
    			compilation_level: 'ADVANCED_OPTIMIZATIONS',
    			only_closure_dependencies: true,
			    generate_exports: true,
    			define: [
    			    'goog.DEBUG=false'
    			],
				output_wrapper: '/*!\n * WebGL image filter library\n * https://github.com/slub/webgl-image-filter/\n *\n * Released under the MIT license (https://github.com/slub/webgl-image-filter/blob/master/LICENSE)\n *\n * Date: 2015-11-04\n	*/\n(function(){%output%}).call(window);',
    			warning_level: 'VERBOSE'
    		}
    	}))
    	.pipe(gulp.dest('dist/')
    );
});

/**
 * Build of library with google closure compiler - advanced optimization 
 */
gulp.task('js-compile-advanced', function() {
	return gulp.src(['src/**/*.js', 'lib/closure-library/closure/goog/**/*.js'])
    	.pipe(closureCompiler({
    		compilerPath: 'node_modules/closure-compiler/node_modules/google-closure-compiler/compiler.jar',
    		fileName: 'dist/glif.min.js',
    		compilerFlags: {
    			closure_entry_point: 'glif',
    			compilation_level: 'ADVANCED_OPTIMIZATIONS',
    			only_closure_dependencies: true,
			    generate_exports: true,
    			define: [
    			    'goog.DEBUG=false'
    			],
    			output_wrapper: '/*!\n * WebGL image filter library\n * https://github.com/slub/webgl-image-filter/\n *\n * Released under the MIT license (https://github.com/slub/webgl-image-filter/blob/master/LICENSE)\n *\n * Date: 2015-11-04\n	*/\n(function(){%output%}).call(window);',
    			warning_level: 'VERBOSE'
    		}
    	}))
    	.pipe(gulp.dest('dist/')
    );
});

gulp.task('default', ['js-compile-simple', 'js-compile-advanced']);