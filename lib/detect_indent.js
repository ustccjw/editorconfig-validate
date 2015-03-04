'use strict'

var commentRegex = require('comment-regex')

function detect_indent(contents) {
	var indentations = []
	contents = contents.replace(commentRegex(), '')

	contents.split(/\n/g).forEach(function (line, index) {
		if (!line) {
			return
		}
		var style = null
		var size = 0
		var matches = line.match(/^\s+/)
		var indent = null
		if (matches !== null) {
			indent = matches[0]
			if (indent === line) {
				return
			}
			if (indent.search('\t') !== -1) {
				style = 'tab'
			}
			if (indent.search(' ') !== -1) {
				if (style) {
					style = 'mix'
				} else {
					style = 'space'
				}
			}
			size = indent.length
		}
		indentations.push({
			line: index + 1,
			style: style,
			size: size
		})
	})
	return indentations
}

module.exports = detect_indent
