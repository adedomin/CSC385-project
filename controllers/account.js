var Account = require('../models/account'),
	waterfall = require('async/waterfall'),
	each = require('async/each')

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

							retrieved.push(account)
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
		transfer: function (req, res) {
			
		}
	}
}
