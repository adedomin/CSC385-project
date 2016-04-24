module.exports = function (users, sessions, config, validator, hasher, crypto, email) {

	return {
		
		login: function (req, res) {

			users.findOne({ username: req.body.username}, function (err, user) {
				
				hasher(req.body.password).verifyAgainst(user.password, function (err, verified) {
					
					if (verified) {
						
						crypto.randomBytes(48, function (err, buffer) {
							
							var token = buffer.toString('hex')
							sessions.insert({
								token: token,
								value: req.body.username,
								created: Date.now()
							})

							res.cookie('session', token, { 
								maxAge: 900000, 
								httpOnly: true 
							})
							res.send({
								status: 'ok',
								msg: 'api-token: '+token
							})
						})
					}
				})
			})
		},
		verifyLogin: function (req, res, next) {

			var sessionid
			
			if (req.cookie &&
				req.cookie.session) {

				sessionid = req.cookie.session
			}
			else if (req.get('api-token')) {
				
				sessionid = req.get('api-token')
			}
				
			sessions.findOne({ token: sessionid }, function (err, session) {	
				if (err || session === null) {
					
					res.status(401)
					res.send({
						status: 'error',
						msg: 'no valid session found; please get a new cookie at path /login',
						redirect: '/login'
					})
					return
				}

				next()
				return
			})
		}
	}
}
