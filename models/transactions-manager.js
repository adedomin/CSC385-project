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
