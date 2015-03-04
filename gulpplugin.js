'use strict'

var Transform = require('readable-stream').Transform
var validate = require('./index')

function editorconfig(options) {
	var stream = new Transform({
		objectMode: true
	})

	//should reformat after readable-stream support simplified constructor api
	stream._transform = function (file, enc, next) {
		var self = this
		if (file.isStream()) {
			file.contents.on('error', self.emit.bind(self, 'error'))
		}
		validate(file, options).then(function (report) {
			if (report) {
				self.emit('report', report, file.path)
				self.push(file)
				return next()
			}
		}).catch(function (err) {
			self.emit('error', err, file.path)
		})
	}
	return stream
}

module.exports = editorconfig
