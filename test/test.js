'use strict'

var assert = require('assert')
var path = require('path')
var gulp = require('gulp')
var editorconfigValidate = require('../index')
var gulpEditorconfigValidate = require('../gulpplugin')

var dir = path.resolve(__dirname, 'dir')

describe('validate indent', function () {
	it('should report indent_style error', function () {
		return editorconfigValidate(path.resolve(dir, 'indent.js'), {
			indent_style: 'tab'
		}).then(function (report) {
			var res = {
				'11': [{
					type: 'indent_style',
					config: 'tab',
					actual: 'space'
				}]
			}
			assert(JSON.stringify(report) === JSON.stringify(res))
		})
	})

	it('should report indent_size error', function () {
		return editorconfigValidate(path.resolve(dir, 'indent.js'), {
			indent_style: 'space',
			indent_size: 4
		}).then(function (report) {
			var res = {
				'10': [{
					type: 'indent_style',
					config: 'space',
					actual: 'tab'
				}],
				'11': [{
					type: 'indent_size',
					config: 4,
					actual: 2
				}]
			}
			assert(JSON.stringify(report) === JSON.stringify(res))
		})
	})
})

describe('validate end_of_line', function () {
	it('should report end_of_line error', function () {
		return editorconfigValidate(path.resolve(dir, 'end_of_line.js'), {
			end_of_line: 'crlf'
		}).then(function (report) {
			var res = {
				'1': [{
					type: 'end_of_line',
					config: 'crlf',
					actual: 'lf'
				}]
			}
			assert(JSON.stringify(report) === JSON.stringify(res))
		})
	})
})

describe('validate insert_final_newline', function () {
	it('should report insert_final_newline error', function () {
		return editorconfigValidate(path.resolve(dir, 'insert_final_newline.js'), {
			insert_final_newline: 'false'
		}).then(function (report) {
			var res = {
				'global': [{
					type: 'insert_final_newline',
					config: 'false',
					actual: 'true'
				}]
			}
			assert(JSON.stringify(report) === JSON.stringify(res))
		})
	})
})

describe('validate trim_trailing_whitespace', function () {
	it('should report trim_trailing_whitespace error', function () {
		return editorconfigValidate(path.resolve(dir, 'trim_trailing_whitespace.js'), {
			trim_trailing_whitespace: 'true'
		}).then(function (report) {
			var res = {
				'0': [{
					type: 'trim_trailing_whitespace',
					config: 'true',
					actual: 'false'
				}],
				'1': [{
					type: 'trim_trailing_whitespace',
					config: 'true',
					actual: 'false'
				}]
			}
			assert(JSON.stringify(report) === JSON.stringify(res))
		})
	})
})

describe('validate charset', function () {
	it('should not report charset error', function () {
		return editorconfigValidate(path.resolve(dir, 'charset.js'), {
			charset: 'utf-8'
		}).then(function (report) {
			var res = null
			assert(JSON.stringify(report) === JSON.stringify(res))
		})
	})
})

describe('validate gulp && editorconfig', function () {
	it('should always ok', function (done) {
		var stream = gulp.src([
			'../**/*.js',
			'!../node_modules/**/*',
			'!./dir/*'
		], {
			cwd: path.resolve(__dirname)
		}).
		pipe(gulpEditorconfigValidate()).
		on('report', function (report, path) {
			if (report !== null) {
				console.log(report, path)
			}
			assert(report === null)
		}).
		on('error', function (err, path) {
			console.error(err, path)
		}).
		on('finish', function () {
			done()
		})
	})
})
