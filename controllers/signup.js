var emailjs = require('emailjs')

module.exports = function (users, config) {

	var email = emailjs.server.connect(config.email_config)
	return {
		signup: function (req, res, next) {

			users.insert(req.body, function (err,user) {
				
				if (err) {
					
					res.status(500)
					res.send({
						status: 'error',
						msg: err.msg
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
		},
		emailVerify: function (req, res) {

			email.send({
				text: 'Thank you for signing up for our eBanking app\n' +
					'Please verify your email at\n' + config.http_address + config.http_root + 'verify/' + req.unverified._id,
				from: config.email_from,
				to: req.unverified.first + req.unverified.last + '<' + req.unverified.username + '>',
				subject: 'CSC385 Project: Verify your username'
			}, function (err, message) {
			
				if (err) {
					users.remove({ _id: req.unverified._id }, {})
				}
			})
		},
		verify: function (req, res) {
			
			users.update({
				_id: req.params.userid 
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
		}
	}
}
