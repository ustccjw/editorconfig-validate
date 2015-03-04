var validate = require('../gulpplugin')
var fs = require('vinyl-fs')

fs.src(['../index.js'], {
		buffer: false
	}).
	pipe(validate()).
	on('report', function (report) {
		console.log(report)
	}).
	on('error', function (err) {
		console.error(err)
	})
