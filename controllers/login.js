var crypto = require('crypto'),
	hasher = require('password-hash-and-salt')
	waterfall = require('async/waterfall')

module.exports = function (helper) {

	return {
		
		login: function (req, res, next) {

			var cookieToken = ''
			if (!(req.body && req.body.password)) {
				
				res.status(401)
				res.send({
					status: 'error',
					msg: 'no password provided'
				})
				return
			}

			waterfall([
				function (next) { 
					next(null, req.body.username)
				},
				helper.getUser,
				function (user, next) {
					if (!user.verified) { 
						next('user\'s email is not verified') 
						return
					}
					next (null, req.body.password, user.password)
				},
				helper.checkPass,
				helper.generateToken,
				function (token ,next) {
					cookieToken = token
					next (null, {
						token: token,
						value: req.body.username,
						created: new Date()
					})
				},
				helper.setSession
			],
			function (err) {
				
				if (err) {
					
					console.log(err)
					res.status(401)
					res.send({
						status: 'error',
						msg: 'not authorized'
					})
					return
				}
				
				res.cookie('session', cookieToken, { 
					maxAge: 900000, 
					httpOnly: true 
				})

				res.send({
					status: 'ok',
					msg: 'api-token: '+cookieToken
				})

				next()
			})
		},
		verifyLogin: function (req, res, next) {

			var sessionid
			
			if (req.cookies &&
				req.cookies.session) {

				sessionid = req.cookies.session
			}
			else if (req.get('api-token')) {
				
				sessionid = req.get('api-token')
			}

			helper.getSession(sessionid, function (err, session) {
				
				if (err) {
					
					res.status(401)
					res.send({
						status: 'error',
						msg: 'no valid session found'
					})
					return				
				}
				
				req.session = session
				next()
			})
		},
		getRole: function (req, res, next) {
			
			if (!req.session || !req.session.value) {
				
				res.status(500)
				res.send({
					status: 'error',
					msg: 'no valid session found'
				})
				return
			}

			helper.getUser(req.session.value, function (err, user) {
				
				if (err) {
					
					res.status(401)
					res.send({
						status: 'error',
						msg: 'invalid session, please relogin'
					})
					return
				}

				req.role = user.role
				next()
			})
		}
	}
}
