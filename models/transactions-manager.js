var each = require('async/each'),
	waterfall = require('async/waterfall'),
	transactionCallback

var Transactions = function (transactions, executeTransaction) {
	
	var that = this
	transactionCallback = executeTransaction
	each(transactions, function (transaction, next) {
	
		if (!transaction.startAt) { return }	
		var timeout = transaction.startAt - Date.now()
		that[transaction._id] = setTimeout(function () {
			transactionCallback(transaction)
		}, timeout)
	})
}

Transactions.prototype.addTransaction = function (transaction, next) {

	if (!next) {

		next = function () {}
	}

	if (!transaction._id) { 

		next('missing unique id')
		return 
	}

	var timeout = transaction.startAt - Date.now()
	this[transaction._id] = setTimeout(function () {
		transactionCallback(transaction)
	}, timeout)
	
	next(null)
}

Transactions.prototype.removeTransaction = function (transactionId, next) {

	if (!next) {
		next = function () {}
	}

	if (!this[transactionId]) { 

		next('no such transaction')
		return 
	}

	clearTimeout(this[transactionId])
	delete this[transactionId]

	next(null)
}

module.exports = Transactions
