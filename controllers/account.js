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

var Account = require('../models/account'),
	waterfall = require('async/waterfall'),
	each = require('async/each'),
	RSS = require('rss')

module.exports = function (helper) {

	return {
		
		newAccount: function (req, res) {
			
			if (!req.body || !req.body.name) {
				
				res.status(500)
				res.send({
					status: 'error',
					field: 'name',
					msg: 'missing field name'
				})
				return
			}

			waterfall([
				function (next) {
					next(null, new Account(req.session.value, req.body.name, null))
				},
				helper.createAccount,
				function (account, next) {
					next(null, req.session.value, account._id)
				},
				helper.addAccountToUser
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
					msg: 'account added'
				})
			})
		},
		getAccount: function (req, res) {
			
			if (!req.params || !req.params.accountid) {
				
				res.status(500)
				res.send({
					status: 'error',
					msg: 'no id provided'
				})
				return			
			}

			helper.getAccount(req.params.accountid, function (err, account){

				if (err) {

					res.status(404)
					res.send({
						status: 'error',
						msg: 'account not found'
					})
					return
				}

				account = helper.checkAccountAccess(
					req.session.value, account
				)

				if (!account) {

					res.status(401)
					res.send({
						status: 'error',
						msg: 'not authorized to access'
					})
					return
				}

				res.send(account)
			})
		},
		getAccounts: function (req, res) {
			
			var retrieved = []
			waterfall([
				function (next) {
					next(null, req.session.value)
				},
				helper.getUser,
				function (user, next) {
					next(null, user.accounts)
				},
				function (accounts, next) {

					next(null, accounts, function (accountid, next) {

						helper.getAccount(accountid, function (err, account){
							
							if (err) {

								next(err)
								return
							}

							account = helper.checkAccountAccess(
								req.session.value, account
							)

							if (account) {
								retrieved.push(account)
							}
							next(null)
						})
					})
				},
				each
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
					accounts: retrieved
				})
			})
		},
		getHistory: function (req, res) {
			
			if (!req.params || !req.params.acccountid) {
				res.status(500)
				res.send({
					status: 'error',
					msg: 'no paramert given'
				})
			}

			helper.getHistory(req.params.acccountid, function (err, histories) {
				
				var feed = new RSS({
					title: 'Transactions History',
					description: 'for '+req.params.acccountid,
				})
					
				histories.forEach(function (history) {
					feed.item({
						title: history.changedBy,
						description: 'amount: '+history.amount,
						date: history.date,
						guid: history._id
					})
				})

				res.type('application/rss+xml')
				res.send(feed.xml())
			})
		}
	}
}
