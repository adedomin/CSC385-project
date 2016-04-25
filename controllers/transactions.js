var waterfall = require('async/waterfall'),
	Transactions = require('../models/transactions')

module.exports = function (transMan, helper) {

	return {
		
		getTransactions: function (req, res) {
			
			helper.getTransactions(req.session.value, function (err, transactions) {
			
				if (err) {
					
					res.send({})
					return
				}

				res.send({
					transactions: transactions
				})
			})
		},
		addTransaction: function (req, res) {
			
			if (!req.params ||
				!req.params.acctId1 ||
				!req.params.acctId2 ||
				!req.body ||
				!req.body.amount) {
			
				res.status(500)
				res.send({
					status: 'error',
					msg: 'accounts not defined'
				})
				return
			}

			if (!req.body.startAt) {
				
				req.body.startAt = 0
			}

			transMan.addTransaction(new Transactions (
				req.session.value,
				req.body.startAt,
				req.params.acctId1,
				req.params.acctId2,
				req.body.amount
			),
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
					msg: 'transaction registered'
				})
			})
		},
		removeTransaction: function (req, res) {
			
			if (!req.params.transid) {
				
				res.status(500)
				res.send({
					status: 'error',
					msg: 'no transaction id to delete'
				})
				return
			}

			transMan.removeTransaction(req.params.transid, req.session.value, function (err) {

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
					msg: 'transaction canceled'
				})
			})
		}
	}
}
