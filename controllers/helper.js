var crypto = require('crypto'),
	hasher = require('password-hash-and-salt')

module.exports = function (users, sessions, accounts, transactions, email) {

	return {
		generateToken: function (next) {

			crypto.randomBytes(48, function(err, buffer) {

				if (err || buffer.length < 48) {
					
					req.newToken = null
					next(err)
					return
				}

				next(null, buffer.toString('hex'))
			})
		},
		getUser: function (username, next) {
			
			if (!username) {
				
				next('no user was requested')
				return
			}

			users.findOne({ username: username }, function (err, user) {
			
				if (err || user === null) {

					next('user not found')
					return
				}

				next(null, user)
			})
		},
		updateUser: function (username, changes, next) { 

			users.update({ username: username }, { $set: changes }, {}, function (err) {
				
				if (err) {
					
					next(err)
					return
				}

				next(null)
			})
		},
		addAccountToUser: function (username, accountid, next) { 

			users.update({ username: username }, { $push: { accounts: accountid }}, {}, function (err) {
				
				if (err) {
					
					next(err)
					return
				}

				next(null)
			})
		},
		removeUser: function (username, next) {
			
			users.remove({ username: username}, function (err, user) {
				
				next(null, user)
			})
		},
		getSession: function (sessionid, next) {
			
			if (!sessionid) {
				
				next('no session requested')
				return
			}

			sessions.findOne({ token: sessionid }, function (err, session) {
				
				if (err || session === null) {
					
					next('no session found')
					return
				}

				next(err, session)
			})
		},
		setUser: function (user, next) {
			
			if (!user) {
				
				next('no user requested to be saved')
				return
			}

			users.insert(user, function (err) {
				if (err) {

					next('error saving user')
					return
				}

				next(null, user)
			})
		},
		setSession: function (session, next) {
			
			if (!session) {
				
				next('no session requested to be saved')
				return
			}

			sessions.insert(session, function (err) {
				if (err) {

					next('error saving session')
					return
				}

				next(null, session)
			})
		},
		removeSession: function (sessionid, next) {
			
			sessions.remove({ token: sessionid }, function (err, session) {
				
				next(null, session)
			})
		},
		getAccount: function (accountid, next) {
		
			accounts.findOne({ _id: accountid }, function (err, account) {
				
				if (err || accounts === null) {
					
					next('no acct')
					return
				}

				next(null, account)
			})
		},
		checkAccountAccess: function (username, account) {

			if (!account.acl) {
				
				return null
			}

			var acl = account.acl[username.replace('.', ':dot:')]

			if (!acl) {
				
				return null
			}

			if (acl.indexOf('owner') !== -1) {
				
				return account
			}

			if (acl.indexOf('send') !== -1) {
				
				return {
					name: account.name,
					_id: account._id
				}
			}

			return null
		},
		createAccount: function (account, next) {
			
			accounts.insert(account, function (err, account) {
			
				if (err || account === null) {
					
					console.log(err)
					next('could not create an account')
					return
				}

				next(null, account)
			})
		},
		updateAccount: function (account, next) {

			accounts.update({ _id: account._id }, account, {}, function (err) {
				
				if (err) {
					
					next('account could not be updated')
					return
				}

				next(null)
			})
		},
		addTransaction: function (transaction, next) {

			transactions.insert(transaction, function (err, transaction) {
				
				if (err || transaction === null) {
					
					next('transaction not saved')
					return
				}

				next(null, transaction)
			})
		},
		checkPass: function (password, hash, next) {
			
			if (!password || !hash) {
				
				next('no passwords asked to be verified')
				return
			}

			hasher(password).verifyAgainst(hash, function (err, verified) {
				
				if (!verified || err) {	

					next('passwords do not match')
					return
				}

				next(null)
			})
		},
		hashPass: function (password, next) {
			
			hasher(password).hash(function (err, hash) {
				if (err) {
					next(err)
					return
				}

				next(null, hash)
			})
		},
		sendEmail: function (emailMsg, next) {
			
			email.send(emailMsg, function (err, message) {
				
				if (err) {
				
					next(err)
					return
				}

				next(null, message)
			})
		}
	}
}