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
