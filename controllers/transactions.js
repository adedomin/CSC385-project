var waterfall = require('async/waterfall'),
	Transactions = require('../models/transactions')

module.exports = function (helper, transMan) {

	return {
		
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

			waterfall([
				function (next) {
					next(null, new Transactions (
						req.session.value,
						req.body.startAt,
						req.params.acctId1,
						req.params.acctId2,
						req.body.amount
					))
				},
				helper.addTransaction,
				transMan.addTransaction
			],
			function (err) {
				
				if (err) {
					
					res.status(500)
					res.send({
						status: 'error',
						msg: err
					})
				}

				res.send({
					status: 'ok',
					msg: 'transaction registered'
				})
				return
			})
		}
	}
}
