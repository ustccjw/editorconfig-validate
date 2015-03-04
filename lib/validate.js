'use strict'

var detectIndent = require('./detect_indent')
// var detectNewline = require('detect-newline')
// var detectTrailingWhitespace = require('detect-trailing-whitespace')

function validate(contents, config) {
	var report = {}
	var style = {}
	var indentStyle = config.indent_style
	var indentSize = config.indent_size
	if (indentStyle || indentSize) {
		var indentations = detectIndent(contents)
		indentations.forEach(function (indentation) {
			var line = indentation.line
			if (indentation.style && indentation.style !== indentStyle) {
				report[line] = report[line] || []
				report[line].push({
					type: 'indent_style',
					config: indentStyle,
					actual: indentation.style
				})
			} else if (indentStyle === 'space' && indentation.size &&
				indentation.size % indentSize) {
				report[line] = report[line] || []
				report[line].push({
					type: 'indent_size',
					config: indentSize,
					actual: indentation.size
				})
			}
		})
	}
	return report
}

module.exports = validate
