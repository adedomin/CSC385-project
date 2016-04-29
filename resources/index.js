var yo = require('yo-yo'),
	xhr = require('xhr')

var displayAccounts,
	selectedAccount = '',
	transersFor,
	historyFor

var elBody,
	elBanner

var loggedin = true,
	username = '',
	password = '',
	newAccountName = '',
	first = '',
	last = ''

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

var renderAccounts = function (accts, update, rowSelect, getTransactions) {

	return yo`<div class="container"><div class="row">
		<div class="col-md-6">
		<table class="table table-hover">
			<thead>
			<tr>
				<th>Name</th>
				<th>Account Id</th>
				<th>Balance</th>
			</tr>
			</thead>
			<tbody>
			${accts.map(function (acct) {
				var isSelected = ''
				if (!acct.balance) {
					return
				}
				if (acct._id === selectedAccount) {
					isSelected = 'info'
				}
				return yo`<tr id=${acct._id} class=${isSelected} onclick=${rowSelect}>
					<td>${acct.name}</td>
					<td>${acct._id}</td>
					<td>${acct.balance}</td>
				</tr>`
			})}
			<tr id="new" class='warning' onclick=${rowSelect}>
				<td>New Account</td>
				<td></td>
				<td></td>
			</tr>
		</tbody>
		</table>
		</div>
		<div class="col-md-6">
			<div><span>dfasf</span></div>
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

	if (this.id === 'new') {
		
		var accountForm = renderNewAccount(cancelNewAccount, newAccount, changeNewAccountName)
		yo.update(elBody, accountForm)
		return
	}

	selectedAccount = this.id
	var newRender = renderAccounts(displayAccounts, update, rowSelect)
	yo.update(elBody, newRender)
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
		var newRender = renderAccounts(displayAccounts, update, rowSelect)
		yo.update(elBody, newRender)
	})
}

getAccounts(function (err, accounts) {
	
	if (err) {
		
		loggedin = false
		elBody = renderLogin(update, getSignUp)
	}
	else {
	
		displayAccounts = accounts
		elBody = renderAccounts(displayAccounts, update, rowSelect)
	}

	elBanner = renderBanner('')
	document.body.appendChild(elBanner)
	document.body.appendChild(elBody)
})
