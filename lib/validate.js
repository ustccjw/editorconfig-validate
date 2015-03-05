'use strict'

var jschardet = require('jschardet')
var detectIndent = require('./detect_indent')
var detectEndOfLine = require('./detect_end_of_line')
var detectFinalNewline = require('./detect_final_newline')
var detectTrailingWhitespace = require('./detect_trailing_whitespace')

function validate(contents, config) {
	contents = contents || ''
	config = config || {}

	var report = {}
	var indentStyle = config.indent_style
	var indentSize = config.indent_size && +config.indent_size
	var endOfLine = config.end_of_line
	var insertFinalNewline = config.insert_final_newline && config.insert_final_newline.toString()
	var trimTrailingWhitespace = config.trim_trailing_whitespace && config.trim_trailing_whitespace.toString()
	var charset = config.charset

	if (indentStyle || indentSize) {
		var indents = detectIndent(contents)
		indents.forEach(function (obj) {
			var line = obj.line
			if (obj.style && obj.style !== indentStyle) {
				report[line] = report[line] || []
				report[line].push({
					type: 'indent_style',
					config: indentStyle,
					actual: obj.style
				})
			} else if (indentStyle === 'space' && obj.size &&
				obj.size % indentSize) {
				report[line] = report[line] || []
				report[line].push({
					type: 'indent_size',
					config: indentSize,
					actual: obj.size
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

	if (insertFinalNewline) {
		var finalNewline = detectFinalNewline(contents, endOfLine === 'crlf' ? '\r\n' : '\n')
		if (finalNewline.toString() !== insertFinalNewline) {
			report.global.push({
				type: 'insert_final_newline',
				config: insertFinalNewline,
				actual: finalNewline.toString()
			})
		}
	}

	if (trimTrailingWhitespace) {
		var trailingWhitespaces = detectTrailingWhitespace(contents)
		trailingWhitespaces.forEach(function (obj) {
			var line = obj.line
			if ((!(obj.trailingWhitespace)).toString() !== trimTrailingWhitespace) {
				report[line] = report[line] || []
				report[line].push({
					type: 'trim_trailing_whitespace',
					config: trimTrailingWhitespace,
					actual: (!(obj.trailingWhitespace)).toString()
				})
			}
		})
	}

	if (charset) {
		var encoding = jschardet.detect(contents).encoding
		if (encoding !== charset) {
			report.global.push({
				type: 'charset',
				config: charset,
				actual: encoding
			})
		}
	}

	if (!Object.keys(report).length) {
		return null
	}
	return report
}

module.exports = validate
