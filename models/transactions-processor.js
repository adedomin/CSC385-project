var async = require('async'),
	Decimal = require('decimal.js')

module.exports = function (helperController) {
	
	return function (ts) {

		var toAccount
		var fromAccount
		var changeAmt = new Decimal(ts.amount).toDP(2).toFixed(2)
		var type = changeAmt.s

		async.parallel([

			function (next) {
				
				helperController.getAccount(ts.to, function (err, acct) {
					next(err, acct)
				})
			},
			function (next) {
				
				helperController.getAccount(ts.from, function (err, acct) {
					next(err, acct)
				})
			}
		],
		function (err, accts) {
			
			if (err) {
				
				console.log('account does not exist')
				return
			}

			if (!(accts[0]) || !(accts[1])) {
				console.log('one of the accounts does not exist.')
				return
			}

			toAccount = helperController.checkAccountAccess(ts.owner, accts[0])
			fromAccount = helperController.checkAccountAccess(ts.owner, accts[1])

			if (!fromAccount.balance) {
				
				console.log('user does not have access to the from account')
				return
			}

			if (!toAccount.balance || type === -1) {
				console.log('user does not have access to withdraw from the to account')
				return
			}

			helperController.transferAccountBalance(toAccount, fromAccount, changeAmt.toString(), function (err) {
				
				if (err) { console.log(err) }
			})
		})
	}
}
