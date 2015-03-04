var validate = require('../gulpplugin')
var fs = require('vinyl-fs')

fs.src(['../index.js'], {
		buffer: false
	}).
	pipe(validate()).
	on('report', function (report, filePath) {
		console.log(report, filePath)
	}).
	on('error', function (err, filePath) {
		console.error(err, filePath)
	})
