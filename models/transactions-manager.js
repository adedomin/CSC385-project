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

var each = require('async/each'),
	waterfall = require('async/waterfall'),
	transactionCallback,
	helperObj

var Transactions = function (helper, executeTransaction) {
	
	var that = this
	transactionCallback = executeTransaction
	helperObj = helper
	this.addTransaction = function (transaction, next) {

		if (!next) {

			next = function () {}
		}

		helperObj.addTransaction(transaction, function (err, trans) {

			if (err) {

				next(err)
				return
			}

			var timeout = trans.startAt - Date.now()
			that[trans._id] = setTimeout(function () {
				transactionCallback(trans)
				that.removeTransaction(trans._id, trans.owner)
			}, timeout)

			next(null)
		})
	}
	this.removeTransaction = function (transactionId, owner, next) {

		if (!next) {
			next = function () {}
		}

		if (!this[transactionId]) { 

			next('no such transaction')
			return 
		}

		helperObj.removeTransaction(transactionId, owner, function (err) {

			if (err) {
				
				next('no such transaction or user is not allowed to remove it')
				return
			}

			clearTimeout(that[transactionId])
			delete that[transactionId]

			next(null)
		})
	}

	helperObj.getTransactions(null, function (err, transactions) {
		
		if (err || transactions === null) { transactions = [] }

		each(transactions, function (transaction, next) {

			if (!transaction.startAt) { return }	
			var timeout = transaction.startAt - Date.now()
			that[transaction._id] = setTimeout(function () {
				transactionCallback(transaction)
				that.removeTransaction(transaction._id, transaction.owner)
			}, timeout)
		})
	})
}

module.exports = Transactions
