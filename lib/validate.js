'use strict'

var detectIndent = require('./detect_indent')
var detectEndOfLine = require('./detect_end_of_line')
var detectFinalNewline = require('./detect_final_newline')
// var detectTrailingWhitespace = require('detect-trailing-whitespace')

function validate(contents, config) {
	contents = contents || ''
	config = config || {}

	var report = {}
	var indentStyle = config.indent_style
	var indentSize = config.indent_size
	var endOfLine = config.end_of_line
	var finalNewline = config.insert_final_newline

	if (indentStyle || indentSize) {
		var indents = detectIndent(contents)
		indents.forEach(function (indent) {
			var line = indent.line
			if (indent.style && indent.style !== indentStyle) {
				report[line] = report[line] || []
				report[line].push({
					type: 'indent_style',
					config: indentStyle,
					actual: indent.style
				})
			} else if (indentStyle === 'space' && indent.size &&
				indent.size % indentSize) {
				report[line] = report[line] || []
				report[line].push({
					type: 'indent_size',
					config: indentSize,
					actual: indent.size
				})
			}
		})
	}

	if (endOfLine) {
		var endOfLines = detectEndOfLine(contents)
		endOfLines.forEach(function (obj) {
			var line = obj.line
			if (endOfLine !== obj.sign) {
				report[line] = report[line] || []
				report[line].push({
					type: 'end_of_line',
					config: endOfLine,
					actual: obj.sign
				})
			}
		})
	}

	if (finalNewline) {
		var obj = detectFinalNewline(contents, endOfLine === 'crlf' ? '\r\n' : '\n')
		var line = obj.line
		if (!obj.finalNewline) {
			report[line] = report[line] || []
			report[line].push({
				type: 'insert_final_newline',
				config: true,
				actual: false
			})
		}
	}
	if (!Object.keys(report).length) {
		return null
	}
	return report
}

module.exports = validate
