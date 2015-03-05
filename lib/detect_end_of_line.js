'use strict'

function detectEndOfLine(contents) {
	var endOfLines = (contents.match(/(?:\r?\n)/g) || [])
	endOfLines = endOfLines.map(function (endOfLine, index) {
		return {
			line: index + 1,
			sign: endOfLine === '\r\n' ? 'crlf' : 'lf'
		}
	})
	return endOfLines
}

module.exports = detectEndOfLine
