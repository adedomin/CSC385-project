module.exports = function (helper) {
	return {
		
		returnUser: function (req, res) {
			
			helper.getUser(req.session.value, function (err, user) {
				
				delete user.password
				res.send(user)
			})
		},
		getUser: function (req, res) {
			
			if (!req.params || !req.params.username) {

				res.status(404)
				res.send({
					status: 'error',
					msg: 'user not found'
				})
				return
			}

			if (!(req.role && req.role === 'admin')) {
				res.status(401)
				res.send({
					status: 'error',
					msg: {
						txt: 'you are not authorized to use this resource',
						requireRole: 'admin',
						requestersRole: req.role
					}
				})
				return
			}

			helper.getUser(req.params.username, function (err, user) {

				if (err) {
					
					res.status(404)
					res.send({
						status: 'error',
						msg: err
					})
					return
				}
				delete user.password
				res.send(user)
			})
		}
	}
}
