/*
Copyright 2016 Anthony DeDominic <dedominica@my.easternct.edu>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
