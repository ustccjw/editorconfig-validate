'use strict'

var detectNewline = require('detect-newline')

function detectFinalNewline(contents, endOfLine) {
	var endOfLine = endOfLine || detectNewline(contents)
	endOfLine = endOfLine === '\r\n' ? '\\r\\n' : '\\n'
	var regExp = new RegExp(endOfLine + '$', 'mg')
	if (contents.search(regExp) !== -1) {
		return {
			line: contents.split(/\n/g).length,
			finalNewline: true
		}
	} else {
		return {
			line: contents.split(/\n/g).length,
			finalNewline: false
		}
	}
}

module.exports = detectFinalNewline
