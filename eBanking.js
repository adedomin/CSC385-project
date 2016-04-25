var config = require('./config/test')

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
	bodyParser = require('body-parser')

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
	})
	transactions = new nedb({
		filename: config.db.transactions,
		autoload: true
	})
//	history = new nedb({
//		filename: './db/history.db',
//		autoload: true
//	})

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

var Validator = require('jsonschema').Validator,
	validator = new Validator(),
	schemas = require('./schemas')

validator.addSchema(schemas.user, '/user')

var emailjs = require('emailjs'),
	email = emailjs.server.connect(config.email_config)

var helperController = HelperController(users, sessions, accounts, transactions, email)
var signupController = SignupController(helperController, config, validator)
var loginController = LoginController(helperController)
var userController = UserController(helperController)
var accountController = AccountController(helperController)
var transactionController 

var TransactionsManager = require('./models/transactions-manager'),
	transactionsManager = new TransactionsManager(helperController, function (ts) { 
		console.log(ts) 
	})

transactionController = TransactionController(transactionsManager, helperController)

app.use(bodyParser.json())

loginRoute.route('/signup')
	.post([
		signupController.signup,
		signupController.emailVerify
	])

loginRoute.route('/')
	.post(loginController.login)

apiRoute.use(function (req, res, next) {
	console.log('api call')
	next()
})

apiRoute.use(loginController.verifyLogin)
apiRoute.use(loginController.getRole)

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

app.use(config.http_root+'api', apiRoute) 
app.use(config.http_root+'login', loginRoute) 

app.get(config.http_root+'verify/:token', signupController.verify)

app.listen(config.http_port, config.http_bind_addr)
