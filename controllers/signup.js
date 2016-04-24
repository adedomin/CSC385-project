module.exports = function (users, sessions, config, validator, hasher, crypto, email) {

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

			hasher(req.body.password).hash(function (err, hash) {
				if (err) {
					res.status(500)
					res.send({
						status: 'error',
						msg: err
					})
				}

				req.body.password = hash
				req.body.verified = false
				req.body.role = 'user'

				users.insert(req.body, function (err,user) {
					
					if (err) {
						
						res.status(500)
						res.send({
							status: 'error',
							msg: err
						})
						return
					}

					req.unverified = user
					res.send({
						status: 'ok',
						msg: 'verifying email'
					})
					next()
				})
			})
		},
		emailVerify: function (req, res) {
			
			crypto.randomBytes(48, function(err, buffer) {
				var token = buffer.toString('hex');
				sessions.insert({ 
					token: token,
					value: req.unverified._id,
					created: Date.now()
				})
				email.send({
					text: 'Thank you for signing up for our eBanking app\n' + 'Please verify your email at\n' + config.http_address + config.http_root + 'verify/' + token,
					from: config.email_from,
					to: req.unverified.first + ' ' + req.unverified.last + ' <' + req.unverified.username + '>',
					subject: 'CSC385 Project: Verify your username'
				}, function (err, message) {
				
					if (err) {
						users.remove({ _id: req.unverified._id }, {})
					}
				})
			})
		},
		verify: function (req, res) {
			
			sessions.findOne({ token: req.params.token }, function (err, session) {

				if (err || session === null) {
					res.status(500)
					res.send({
						status: 'error',
						msg: err
					})
					return
				}

				users.update({
					_id: session.value
				}, 
				{ 
					$set: { verified: true} 
				},
				function (err) {
					
					if (err) {

						res.status(500)
						res.send({
							status: 'error',
							msg: err.msg
						})
						return
					}

					res.send({
						status: 'ok',
						msg: 'email verified'
					})
				})
			})
		}
	}
}
