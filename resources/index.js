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

var yo = require('yo-yo'),
	xhr = require('xhr')

var displayAccounts,
	displayTransactions

var elBody,
	elBanner

var loggedin = true,
	username = '',
	password = '',
	newAccountName = '',
	first = '',
	last = '',
	fromAcct = '',
	toAcct = '',
	amount = '',
	startAt = 0

var changeUsername = function () {
	username = this.value
}

var changePassword = function () {
	password = this.value
}

var changeNewAccountName = function () {
	newAccountName = this.value
}

var changeFirst = function () {
	first = this.value
}

var changeLast = function () {
	last = this.value
}

var closeAlert = function () {

	var closedBanner = renderBanner('')
	yo.update(elBanner, closedBanner)
}

var changeFrom = function () {
	fromAcct = this.value
}

var changeTo = function () {
	toAcct = this.value
}

var changeAmount = function () {
	amount = this.value
}

var changeStartAt = function () {
	startAt = +(this.value)
}

var sendNewTransact = function () {
	
	xhr.post('/api/accounts/'+fromAcct+'/to/'+toAcct, {
		body: JSON.stringify({
			amount: amount,
			startAt: startAt
		}),
		headers: {
			'content-type': 'application/json'
		},
		withCredentials: true
	},
	function (err, resp, body) {
		
		body = JSON.parse(body)
		if (err || !body || body.status === 'error') {
			
			newBanner = renderBanner('Invalid Transaction: '+body.msg, 'danger')
			yo.update(elBanner, newBanner)
			return
		}

		newBanner = renderBanner('Transaction Created', 'success')
		yo.update(elBanner, newBanner)
		update()
	})
}

var cancelTrans = function () {

	xhr.del('/api/transactions/'+this.id,{
		withCredentials: true
	},
	function (err, resp, body) {
		
		if (err || !body || body.status === 'error') {

			newBanner = renderBanner('Could not delete transaction: '+body.msg, 'danger')
			yo.update(elBanner, newBanner)
			return
		}

		newBanner = renderBanner('Transaction Deleted', 'success')
		yo.update(elBanner, newBanner)
		update()
	})
}


var getTransactions = function (callback) {
	
	xhr.get('/api/transactions', {
		withCredentials: true
	},
	function (err, resp, body) {
		
		body = JSON.parse(body)
		if (err || !body || !body.transactions) {
			
			callback('can\'t get transactions')
			return
		}

		callback(null, body.transactions)
	})
}

var cancelNewTrans = function () {
	var newBanner = renderBanner('Transaction Creation Cancelled', 'info')
	yo.update(elBanner, newBanner)
	update()
}

var renderNewTransacts = function (cancel, submit) {

	toAcct = ''
	fromAcct = ''
	amount = ''
	startAt = 0
	return yo`<div class="container"><div class="col-md-4 col-md-offset-4">
		<div class="form-group">
		<label>From</label>
		<select onchange=${changeFrom} class="form-control">
		${displayAccounts.map(function (acct) {
			if (!acct.balance) {
				return
			}

			if (fromAcct === '') {
				fromAcct = acct._id
			}

			return yo`<option value=${acct._id}>${acct._id}</option>`
		})}	
		</select>
		</div>
		<div class="form-group">
		<label>To</label>
		<select onchange=${changeTo} class="form-control">
		${displayAccounts.map(function (acct) {
			if (!acct.balance) {
				return
			}

			if (toAcct === '') {
				toAcct = acct._id
			}

			return yo`<option value=${acct._id}>${acct._id}</option>`
		})}	
		</select>
		</div>
		<div class="form-group">
		<label>Amount (can be negative)</label>
		<input type="text" class="form-control" onchange=${changeAmount}></input>
		</div>
		<div class="form-group">
		<label>Delay</label>
		<select class="form-control" onchange=${changeStartAt}>
			<option value="0">Immediate</option>
			<option value="3.6e+6">1 hour</option>
			<option value="8.64e+7">1 day</option>
			<option value="6.048e+8">1 week</option>
			<option value="2147483647">24 days</option>
		</select>
		</div>
		<button onclick=${cancel} class="btn btn-danger">cancel</button>
		<button onclick=${submit} class="btn btn-info">submit</button>
	</div></div>`
}

var newAccount = function () {
	
	xhr.post('/api/accounts/new', {
		body: JSON.stringify({
			name: newAccountName
		}),
		headers: {
			'content-type': 'application/json'
		},
		withCredentials: true
	},
	function (err, resp, body) {
		
		var newBanner
		newAccountName = ''
		body = JSON.parse(body)
		if (err || !body || body.status === 'error') {
			
			newBanner = renderBanner('Could not create an account', 'danger')
			yo.update(elBanner, newBanner)
			update()
			return
		}

		newBanner = renderBanner('Account Created', 'success')
		yo.update(elBanner, newBanner)
		update()
	})
}

var cancelNewAccount = function () {
	var newBanner = renderBanner('Account Creation Cancelled', 'info')
	yo.update(elBanner, newBanner)
	update()
}

var renderNewAccount = function (cancel, submit, fieldUpdate) {
	
	return yo`<div class="container"><div class="col-md-4 col-md-offset-4">
		<div class="form-group">
		<label>Account Name (optional)</label>
		<input type="text" class="form-control" onchange=${fieldUpdate}></input>
		</div>
		<button onclick=${cancel} class="btn btn-danger">cancel</button>
		<button onclick=${submit} class="btn btn-info">submit</button>
	</div></div>`
}

var login = function (callback) {
	
	xhr.post('/login', {
		body: JSON.stringify({
			username: username,
			password: password
		}),
		headers: {
			"content-type": "application/json"
		},
		withCredentials: true
	},
	function (err, resp, body) {

		body = JSON.parse(body)
		if (err || !body || body.status === 'error') {
			
			callback('invalid auth')
			return
		}
			
		if (!body.msg) callback('missing api key')
		callback(null)
	})

	return false
}

var renderLogin = function (sendCreds, signUp) {

	return yo`<div class="container"><div class="col-md-4 col-md-offset-4">
		<div class="form-group">
		<label>Username</label>
		<input type="email" class="form-control" onchange=${changeUsername}></input>
		</div>
		<div class="form-group">
		<label>Password</label>
		<input type="password" class="form-control" onchange=${changePassword}></input>
		</div>
		<button onclick=${sendCreds} class="btn btn-default">submit</button> Need an account? <a onclick=${signUp}>sign up</a>
	</div></div>`
}

var sendSignUp = function () {

	var newBanner

	xhr.post('/login/signup', {
		body: JSON.stringify({
			first: first,
			last: last,
			username: username,
			password: password
		}),
		headers: {
			'content-type': 'application/json'
		},
		withCredentials: true
	},
	function (err, resp, body) {

		body = JSON.parse(body)
		if (err || !body || body.status === 'error') {
			
			newBanner = renderBanner('Could not signup: '+body.msg, 'danger')
			yo.update(elBanner, newBanner)
			return
		}

		newBanner = renderBanner('Account Created, check your email.', 'info')
		yo.update(elBanner, newBanner)
		getLogin()
		return
	})
}

var renderSignUp = function (signUp, goBack) {

	return yo`<div class="container"><div class="col-md-4 col-md-offset-4">
		<div class="form-group">
		<label>Username (Email)</label>
		<input type="email" class="form-control" onchange=${changeUsername}></input>
		</div>
		<div class="form-group">
		<label>Password</label>
		<input type="password" class="form-control" onchange=${changePassword}></input>
		</div>
		<div class="form-group">
		<label>Firstname</label>
		<input type="text" class="form-control" onchange=${changeFirst}></input>
		</div>
		<div class="form-group">
		<label>Lastname</label>
		<input type="text" class="form-control" onchange=${changeLast}></input>
		</div>
		<button onclick=${signUp} class="btn btn-default">submit</button> Have an account? <a onclick=${goBack}>login</a>
	</div></div>`
}

var renderAccountSide = function (accts, rowSelect) {
	
	return yo`
	<table class="table table-hover">
	<thead>
		<tr>
			<th>Name</th>
			<th>Account Id</th>
			<th>Balance</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
	${accts.map(function (acct) {

		if (!acct.balance) {
			return
		}

		return yo`<tr id=${acct._id}>
			<td>${acct.name}</td>
			<td>${acct._id}</td>
			<td>${'$'+acct.balance}</td>
			<td><a href='/api/history/${acct._id}'>history</a></td>
		</tr>`
	})}
		<tr id="account" class='warning' onclick=${rowSelect}>
			<td>New Account</td>
			<td></td>
			<td></td>
			<td></td>
		</tr>
	</tbody>
	</table>`
}

var renderTransactionSide = function (transacts, rowSelect, cancelTrans) {
	
	return yo`
	<table class="table table-hover">
	<thead>
		<tr>
			<th>Date</th>
			<th>From</th>
			<th>To</th>
			<th>Amount</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
	${transacts.map(function (trans) {

		return yo`<tr>
			<td>${new Date(trans.startAt)}</td>
			<td>${trans.from}</td>
			<td>${trans.to}</td>
			<td>${'$'+trans.amount}</td>
			<td><button class="close" id=${trans._id} onclick=${cancelTrans}>\u274C</button></td>
		</tr>`
	})}
		<tr id="transacts" class='warning' onclick=${rowSelect}>
			<td>New Transaction</td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
		</tr>
	</tbody>
	</table>`
}

var renderAccounts = function (accts, trans, rowSelect, cancelTrans) {

	return yo`<div class="container"><div class="row">
		<div class="col-md-6">
			${renderAccountSide(accts, rowSelect)}
		</div>
		<div class="col-md-6">
			${renderTransactionSide(trans, rowSelect, cancelTrans)}
		</div>
	</div></div>`
}

var renderBanner = function (msg, type) {

	if (!msg || !type || msg === '') {
		return yo`<div style="padding:20px"></div>`
	}

	return yo`<div class="alert alert-${type} alert-dismissible" role="alert">
	  <button type="button" class="close" onclick=${closeAlert}><span>\u274C</s</span></button>
	  ${msg}
	</div>`
}

var getAccounts = function (callback) {


	xhr.get('/api/accounts', {
		withCredentials: true
	},
	function (err, resp, body) {
		
		body = JSON.parse(body)
		if (err || !body || body.status === 'error') {
			
			callback('not authorized')
			return
		}

		callback(null, body.accounts)
	})
}

var rowSelect = function () {

	if (this.id === 'account') {
		
		var accountForm = renderNewAccount(cancelNewAccount, newAccount, changeNewAccountName)
		yo.update(elBody, accountForm)
		return
	}

	if (this.id === 'transacts') {
		var transactForm = renderNewTransacts(cancelNewTrans, sendNewTransact)
		yo.update(elBody, transactForm)
	}
}

var getLogin = function () {
	
	var loggedin = false
	var newRender = renderLogin(update, getSignUp)
	yo.update(elBody, newRender)
}

var getSignUp = function () {
	
	var newRender = renderSignUp(sendSignUp, getLogin)
	yo.update(elBody, newRender)
}


var update = function () {

	if (!loggedin) { 
		
		login(function (err) {
			
			if (err) {

				var newBanner = renderBanner('Invalid Credentials', 'danger')
				yo.update(elBanner, newBanner)
				return
			}

			loggedin = true
			update()
		})
		return
	}

	getAccounts(function (err, accounts) {

		if (err) {
			return
		}

		displayAccounts = accounts
		getTransactions(function (err, transacts) {

			if (err) {
				displayTransactions = []
			}
			else {
				displayTransactions = transacts
			}

			var newRender = renderAccounts(displayAccounts, displayTransactions, rowSelect, cancelTrans)
			yo.update(elBody, newRender)
		})
	})
}

getAccounts(function (err, accounts) {
	
	elBody = yo`<div></div>`
	if (err) {
		loggedin = false
		elBody = renderLogin(update, getSignUp)
	}
	else {
		update()
	}

	elBanner = renderBanner('')
	document.body.appendChild(elBanner)
	document.body.appendChild(elBody)
})
