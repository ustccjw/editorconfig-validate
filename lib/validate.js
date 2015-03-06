'use strict'

var iconv = require('iconv-lite')
var detectCharset = require('node-icu-charset-detector').detectCharset
var detectIndent = require('./detect_indent')
var detectEndOfLine = require('./detect_end_of_line')
var detectFinalNewline = require('./detect_final_newline')
var detectTrailingWhitespace = require('./detect_trailing_whitespace')

/**
 * vidate buffer via config
 * suppoer: charset, indent_style, indent_size, end_of_line,
 * insert_final_newline, trim_trailing_whitespace
 * @param  {object} buffer
 * @param  {object} config
 * @return {object}        report
 */
function validate(buffer, config) {
	if (!Buffer.isBuffer(buffer)) {
		throw new Error('arguments error: buffer error')
	}
	if (typeof config !== 'object') {
		throw new Error('arguments error: config must be object')
	}

	var report = {}
	var indentStyle = config.indent_style
	var indentSize = config.indent_size && +config.indent_size
	var endOfLine = config.end_of_line
	var insertFinalNewline = config.insert_final_newline && config.insert_final_newline.toString()
	var trimTrailingWhitespace = config.trim_trailing_whitespace && config.trim_trailing_whitespace.toString()
	var charset = config.charset

	if (charset) {
		var detectedCharset = detectCharset(buffer).toString()
		if (iconv.decode(buffer, charset) !==
			iconv.decode(buffer, detectedCharset)) {
			report.global = report.global || []
			report.global.push({
				type: 'charset',
				config: charset,
				actual: detectedCharset
			})

			// charset not sure, stop detect
			return report
		}
	}
	var contents = iconv.decode(buffer, charset || 'utf8')

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
			} else if (indentStyle === 'space' &&
				(obj.size < indentSize || obj.size % indentSize)) {
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
			report.global = report.global || []
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

	if (!Object.keys(report).length) {
		report = null
	}
	return report
}

module.exports = validate
