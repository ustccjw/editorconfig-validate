'use strict'

// now noly consider C-style comments
var commentRegex = require('comment-regex')
var repeating = require('repeating')

function detectIndent(contents) {
	var indents = []

	// remove coments, but do not remove '\n', or line number will error
	var matches = contents.match(commentRegex())
	if (matches) {
		matches.forEach(function (comment) {
			var newlines = repeating('\n', comment.split('\n').length - 1)
			contents = contents.replace(comment, newlines)
		})
	}
	contents.split(/\n/g).forEach(function (line, index) {
		if (!line) {
			return
		}
		var style = null
		var size = 0
		var matches = line.match(/^[ \t]+/)
		var indent = null
		if (matches !== null) {
			indent = matches[0]
			if (indent === line) {
				return // blank line
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
			indents.push({
				line: index + 1,
				style: style,
				size: size
			})
		}
	})
	return indents
}

module.exports = detectIndent
