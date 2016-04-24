var crypto = require('crypto'),
	hasher = require('password-hash-and-salt'),
	waterfall = require('async/waterfall')

module.exports = function (helper, config, validator) {

	return {
		signup: function (req, res, next) {

			var result = validator.validate(req.body, '/user')

			if (!result.valid) {
				res.status(500)
				res.send({
					status: 'error',
					msg: result.errors
				})
				
				return
			}

			waterfall([
				function (next) {
					next(null, req.body.password)
				},
				helper.hashPass,
				function (hash, next) {
					req.body.password = hash
					req.body.verified = false
					req.body.role = 'user'
					req.body.accounts = []
					next(null, req.body)
				},
				helper.setUser
			],
			function (err) {

				if (err) {
					
					res.status(500)
					res.send({
						status: 'error',
						msg: err
					})
					return
				}

				res.send({
					status: 'ok',
					msg: 'sending verify email'
				})

				next()
			})
		},
		emailVerify: function (req, res) {
			
			waterfall([
				helper.generateToken,
				function (token, next) {
					next(null, {
						token: token,
						value: req.body.username,
						created: new Date()
					})
				},
				helper.setSession,
				function (session, next) {
					next(null, {
						text: 'Thank you for signing up for our eBanking app\n' + 'Please verify your email at\n' + config.http_address + config.http_root + 'verify/' + session.token,
						from: config.email_from,
						to: req.body.first + ' ' + req.body.last + ' <' + req.body.username + '>',
						subject: 'CSC385 Project: Verify your username'
					})
				},
				helper.sendEmail
			],
			function (err) {
				
				if (err) {
					console.log(err)
				}
			})
		},
		verify: function (req, res) {
			
			if (!(req.params && req.params.token)) {

				res.status(500)
				res.send({
					status: 'error',
					msg: 'invalid verify url'
				})
				return
			}

			waterfall([
				function (next) {
					next(null, req.params.token)
				},
				helper.getSession,
				function (session, next) {
					next(null, session.value, {
						verified: true
					})
				},
				helper.updateUser
			],
			function (err) {
				
				if (err) {

					res.status(500)
					res.send({
						status: 'error',
						msg: err
					})
					return
				}

				res.send({
					status: 'ok',
					msg: 'email verified'
				})
			})
		}
	}
}
