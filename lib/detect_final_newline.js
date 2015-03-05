'use strict'

var detectNewline = require('detect-newline')

function detectFinalNewline(contents, endOfLine) {
	var endOfLine = endOfLine || detectNewline(contents)
	endOfLine = endOfLine === '\r\n' ? '\\r\\n' : '\\n'
	var regExp = new RegExp(endOfLine + '$')
	return regExp.test(contents)
}

module.exports = detectFinalNewline
