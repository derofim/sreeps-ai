"use strict";

module.exports = function(grunt) {

	var NodeUglifier = require('node-uglifier');

	var fs = require('fs');
	var path = require('path');

	var config = require('./.screeps.json');

	grunt.loadNpmTasks('grunt-screeps');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-jsdoc');

	function generateSeed() {
		return Math.floor((Math.sin(Math.random()).toString().substr(6)) * 1000);
	}

	grunt.registerMultiTask('uglifier', 'Uglify Node.js soure code.', function() {
		var options = this.options({
			randomSeed: (this.options.randomSeed !== undefined) ? this.options.randomSeed : generateSeed()
		});

		var mainFile = this.data.mainFile;
		var destFile = this.data.destFile;

		var obfuscatedSource = new NodeUglifier(mainFile, {
			rngSeed: options.randomSeed
		});

		obfuscatedSource = obfuscatedSource.merge().uglify();
		obfuscatedSource.exportToFile(destFile);
	});

	grunt.registerTask('default', ['watch']);

	grunt.initConfig({

		screeps: {
			options: {
				email: config.email,
				password: config.password,
				branch: 'default',
				ptr: false
			},
			dist: {
				src: ['dist/main.js']
			}
		},

		jsdoc: {
			dist: {
				src: ['src/*.js'],
				options: {
					destination: 'doc'
				}
			}
		},

		babel: {
			options: {
				sourceMap: false,
				//presets: ['es2015']
			},
			dist: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['*.js', '**/*.js'],
					dest: 'tmp/'
				}]
			}
		},

		eslint: {
			target: ['src/*.js']
		},

		uglify: {
			uglify: {
				options: {
					sourceMap: false,
				},
				files: {
					'dist/main.js': ['dist/main-uglifier.js']
				}
			}
		},

		uglifier: {
			uglifier: {
				mainFile: 'src/main.js',
				destFile: 'dist/main-uglifier.js'
			}
		},

		watch: {
			scripts: {
				files: ['src/*.js'],
				tasks: ['eslint', 'uglifier', 'uglify', 'screeps']
			}
		}

	});
}
