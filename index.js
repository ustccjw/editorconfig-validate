'use strict'

var isReadable = require('isstream').isReadable
var fs = require('mz/fs')
var editorconfig = require('editorconfig')
var Promise = require('native-or-bluebird')
var validate = require('./lib/validate')

/**
 * make file validate via .editorconfig or customed rules
 * @param  {string|object} file    filePath/vinyl File
 * @param  {object}        options customed rules
 * @return {object}                promise then resolve validate result(object)
 */

function editorconfigValidate(file, options) {
	var path = null
	if (typeof file === 'string') {
		path = file
	} else if (typeof file === 'object') {
		path = file.path
	}
	if (typeof path !== 'string') {
		return Promise.reject(new Error('arguments error: file should be file path or vinyl file'))
	}

	var promiseFile = null
	if (typeof file === 'string') {
		promiseFile = fs.readFile(file).then(function (fileContents) {
			return fileContents
		})
	} else {
		promiseFile = Promise.resolve(file.contents)
	}

	var promiseConfig = null
	if (typeof options === 'object') {
		promiseConfig = Promise.resolve(options)
	} else {
		promiseConfig = editorconfig.parse(path)
	}

	return Promise.all([promiseFile, promiseConfig]).then(function (response) {
		var contents = response[0]
		var config = response[1]

		if (Buffer.isBuffer(contents)) {
			return validate(contents, config)
		}
		if (isReadable(contents)) {
			return new Promise(function (resolve, reject) {
				var buffers = []
				contents.setEncoding(null)
				contents.on('readable', function () {
					var buffer = contents.read()
					if (buffer !== null) {
						buffers.push(buffer)
					}
				})
				contents.on('end', function () {
					resolve(validate(Buffer.concat(buffers), config))
				})
			})
		}
	})
}

module.exports = editorconfigValidate
