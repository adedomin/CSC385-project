module.exports = function (owner, startAt, fromAccountId, toAccountId, amount) {

	this.owner = owner
	this.startAt = new Date(Date.now()+startAt)
	this.from = fromAccountId
	this.to = toAccountId
	this.amount = amount
}
