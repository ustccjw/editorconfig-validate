'use strict'

function detectTrailingWhitespace(contents) {
	var trailingWhitespace = []
	contents.split(/\n/g).forEach(function (line, index) {
		trailingWhitespace.push({
			line: index,
			trailingWhitespace: /[ \t]+$/.test(line)
		})
	})
	return trailingWhitespace
}

module.exports = detectTrailingWhitespace
