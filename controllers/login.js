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
					maxAge: 8.64e+7, 
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
