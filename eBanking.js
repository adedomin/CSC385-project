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

var config = require('./config/test')
			
var async = require('async'),
	Decimal = require('decimal.js')

var express = require('express'),
	app = express(),
	apiRoute = express.Router(),
	loginRoute = express.Router(),
	staticRoute = express.static(__dirname+'/resources'),
	HelperController = require('./controllers/helper'),
	SignupController = require('./controllers/signup'),
	LoginController = require('./controllers/login'),
	UserController = require('./controllers/user'),
	AccountController = require('./controllers/account'),
	TransactionController = require('./controllers/transactions'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser')

var nedb = require('nedb'),
	users = new nedb({
		filename: config.db.users,
		autoload: true
	}),
	sessions = new nedb({
		filename: config.db.sessions,
		autoload: true
	}),
	accounts = new nedb({
		filename: config.db.accounts,
		autoload: true
	}),
	transactions = new nedb({
		filename: config.db.transactions,
		autoload: true
	}),
	history = new nedb({
		filename: config.db.history,
		autoload: true
	}),
	logging = new nedb({
		filename: config.db.logging,
		autoload: true
	})

users.ensureIndex({ 
	fieldName: 'username', 
	unique: true 
})
sessions.ensureIndex({ fieldName: 'token'})
sessions.ensureIndex({ 
	fieldName: 'created',
	expireAfterSeconds: 900000
})
transactions.ensureIndex({ fieldName: 'owner' })
history.ensureIndex({ fieldName: 'accountId' })
logging.ensureIndex({ fieldName: 'username' })
logging.ensureIndex({ fieldName: 'ip' })

var Validator = require('jsonschema').Validator,
	validator = new Validator(),
	schemas = require('./schemas')

validator.addSchema(schemas.user, '/user')

var emailjs = require('emailjs'),
	email = emailjs.server.connect(config.email_config)

var helperController = HelperController(users, sessions, accounts, transactions, history, email)
var signupController = SignupController(helperController, config, validator)
var loginController = LoginController(helperController)
var userController = UserController(helperController)
var accountController = AccountController(helperController)
var transactionController 

var TransactionsManager = require('./models/transactions-manager'),
	transactionsProcessor = require('./models/transactions-processor')(helperController)
	transactionsManager = new TransactionsManager(
		helperController, transactionsProcessor
	)

transactionController = TransactionController(transactionsManager, helperController)

app.use(bodyParser.json())
app.use(cookieParser())

loginRoute.route('/signup')
	.post([
		signupController.signup,
		signupController.emailVerify
	])

loginRoute.route('/')
	.post(loginController.login)

apiRoute.use(loginController.verifyLogin)
apiRoute.use(function (req, res, next) {
	var remote = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	logging.insert({
		username: req.session.value,
		postData: req.body,
		reqUrl: req.originalUrl,
		ip: remote,
		date: new Date()
	})
	next()
})


apiRoute.get('/testauth', function (req, res) {
		res.send("you are auth'd :D")
		return
	}
)

apiRoute.get('/user', userController.returnUser)
apiRoute.get('/user/:username', userController.getUser)
apiRoute.get('/accounts', accountController.getAccounts)
apiRoute.get('/accounts/:accountid', accountController.getAccount)
apiRoute.post('/accounts/new', accountController.newAccount)
apiRoute.post('/accounts/:acctId1/to/:acctId2', transactionController.addTransaction)
apiRoute.get('/transactions', transactionController.getTransactions)
apiRoute.delete('/transactions/:transid', transactionController.removeTransaction)
apiRoute.get('/history/:acccountid', accountController.getHistory)

app.use(config.http_root+'api', apiRoute) 
app.use(config.http_root+'login', loginRoute) 
app.use(config.http_root, staticRoute)

app.get(config.http_root+'verify/:token', signupController.verify)

app.listen(config.http_port, config.http_bind_addr)
