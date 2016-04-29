var yo = require('yo-yo'),
	xhr = require('xhr')

var elBody,
	elBanner

var loggedin = true,
	username = '',
	password = ''

var changeUsername = function () {
	username = this.value
}

var changePassword = function () {
	password = this.value
}

var closeAlert = function () {

	var closedBanner = renderBanner('')
	yo.update(elBanner, closedBanner)
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
		api_key = body.msg.split(' ')[1]
		console.log(body.msg.split(' '))
		console.log(api_key)
		callback(null)
	})

	return false
}

var renderLogin = function (sendCreds) {

	return yo`<div class="col-md-4 col-md-offset-4">
		<div class="form-group">
		<label>Username</label>
		<input type="email" class="form-control" onchange=${changeUsername}></input>
		</div>
		<div class="form-group">
		<label>Password</label>
		<input type="password" class="form-control" onchange=${changePassword}></input>
		</div>
		<button onclick=${sendCreds} class="btn btn-default">submit</button>
	</div>`
}

var renderAccounts = function (accts, update) {

	return yo`<div>
		<ul>
			${accts.map(function (acct) {
				return yo`<li>${acct._id}<li>`
			})}
		</ul>
		<button onclick=${update}>get account updates</button>
	</div>`
}

var renderBanner = function (msg, type) {

	if (!msg || !type || msg === '') {
		return yo`<div></div>`
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

		var newRender = renderAccounts(accounts, update)
		yo.update(elBody, newRender)
	})
}

getAccounts(function (err, accounts) {
	
	if (err) {
		loggedin = false
		elBody = renderLogin(update)
	}

	else elBody = renderAccounts(accounts, update)
	elBanner = renderBanner('')
	document.body.appendChild(elBanner)
	document.body.appendChild(elBody)
})
