#!/usr/bin/env node

var path = require('path'),
	fs = require('fs'),
	program = require('commander'),
	mkdirp = require('mkdirp');

exports.gulpfile = function () {

	var lib = path.join(__dirname, '../lib'),
		libGulpfiles = lib + '/gulpfiles',
		homedir = (process.env.HOME || process.env.HOMEPATH || process.env.HOMEDIR || lib),
		userGulpfiles = homedir + '/gulpfiles',

		list = function (val) {
			return val.split(',');
		},

		use = function (name, gulpfiles) {
			var gulpfile = gulpfiles + '/' + name,
				newGulpfile = process.cwd() + '/' + 'gulpfile.js';

			fs.readFile(gulpfile, function (err, data) {
				if (err) {
					throw err;
				}
				fs.writeFile(newGulpfile, data, function (err) {
					if (err) {
						throw err;
					}
				});
			});
			return true;
		};

	// make sure we've got a ~/gulpfiles for caching gulpfiles
	mkdirp(userGulpfiles, function (err) {
		if (err) {
			throw err;
		}

		// now, let's do work
		program
			.version('1.0.2')
			.option('-l, --list', 'list saved gulpfiles found in ~/gulpfiles')
			.option('-s, --save [name]', 'save current gulpfile to ~/gulpfiles')
			.option('-u, --use [name]', 'use a gulpfile from ~/gulpfiles')
			.option('-d, --delete [name]', 'delete a gulpfile from ~/gulpfiles')
			.parse(process.argv);

		if (program.list) {
			fs.readdir(userGulpfiles, function (err, files) {
				if (err) {
					throw err;
				}
				if (files.length === 0) {
					console.log('default');
					return true;
				}
				for (var i in files) {
					console.log(files[i]);
				}
			});
			return true;
		}

		if (program.save) {
			var gulpfile = userGulpfiles + '/' + program.save;

			fs.readFile('gulpfile.js', function (err, data) {
				if (err) {
					if (err.code === 'ENOENT') {
						console.log('Error: gulpfile.js was not found.');
						return false;
					}
					throw err;
				}
				fs.writeFile(gulpfile, data, function (err) {
					if (err) {
						throw err;
					}
				});
			});
			return true;
		}

		if (program.use) {
			return use(program.use, userGulpfiles);
		}

		if (program.delete) {
			if (program.delete === 'default') {
				console.log('Error: Cannot delete the default gulpfile.');
				return false;
			}
			var gulpfile = userGulpfiles + '/' + program.delete;
			fs.unlink(gulpfile, function (err) {
				if (err) {
					throw err;
				}
			});
			return true;
		}

		// otherwise, use the default gulpfile to create a new gulpfile.js
		var defaultGulpfile = userGulpfiles + '/default';
		fs.exists(defaultGulpfile, function (exists) {
			if (!exists) {
				var libDefaultGulpfile = libGulpfiles + '/default';
				fs.readFile(libDefaultGulpfile, function (err, data) {
					if (err) {
						throw err;
					}
					fs.writeFile(defaultGulpfile, data, function (err) {
						if (err) {
							throw err;
						}
						return use('default', userGulpfiles);
					});
				});
			} else {
				return use('default', userGulpfiles);
			}
		});

	});
};
