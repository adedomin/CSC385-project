var Accounts = function (owner, name, historyid) {
	owner = owner.replace('.', ':dot:')
	this.name = name.replace('.', '')
	this.history = historyid
	this.acl = {}
	this.acl[owner] = [
		'send',
		'owner'
	]
	this.balance = '0.00'
	this.card = {}
}

module.exports = Accounts
