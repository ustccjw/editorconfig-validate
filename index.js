'use strict'

var isReadable = require('isstream').isReadable
var fs = require('mz/fs')
var editorconfig = require('editorconfig')
var validate = require('./lib/validate')
require('es6-promise').polyfill()

/**
 * make file validate via .editorconfig or config
 * @param  {string|object} file    filePath/vinyl
 * @param  {object}        options validate config
 * @return {Promise}               promise then resolve object/buffer/stream
 */

function editorconfigValidate(file, options) {
	var promiseFile = null
	if (typeof file === 'string') {
		promiseFile = fs.readFile(file, 'utf8').then(function (fileContents) {
			return fileContents
		})
	} else if (typeof file === 'object') {
		promiseFile = Promise.resolve(file.contents)
	}

	var promiseConfig = null
	if (typeof options === 'object') {
		promiseConfig = Promise.resolve(options)
	} else {
		var path = typeof file === 'object' ? file.path : file
		promiseConfig = editorconfig.parse(path)
	}

	return Promise.all([promiseFile, promiseConfig]).then(function (response) {
		var contents = response[0]
		var config = response[1]
		if (typeof contents === 'string') {
			return validate(contents, config)
		}
		if (Buffer.isBuffer(contents)) {
			return validate(contents.toString(), config)
		}
		if (isReadable(contents)) {
			return new Promise(function (resolve, reject) {
				var source = ''
				contents.setEncoding('utf8')
				contents.on('readable', function () {
					var str = contents.read()
					if (str !== null) {
						source += str
					}
				})
				contents.on('end', function () {
					resolve(validate(source, config))
				})
			})
		}
	})
}

module.exports = editorconfigValidate
