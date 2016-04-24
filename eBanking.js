var config = require('./config/test')

var express = require('express'),
	app = express(),
	apiRoute = express.Router(),
	loginRoute = express.Router(),
	staticRoute = express.static(__dirname+'/resources'),
	SignupController = require('./controllers/signup')
	UserController = require('./controllers/user')
	bodyParser = require('body-parser')

var crypto = require('crypto'),
	hasher = require('password-hash-and-salt')

var nedb = require('nedb'),
	users = new nedb({
		filename: config.db.users,
		autoload: true
	})
	sessions = new nedb({
		filename: config.db.sessions,
		autoload: true
	})
//	accounts = new nedb({
//		filename: './db/accounts.db',
//		autoload: true
//	}),
//	history = new nedb({
//		filename: './db/history.db',
//		autoload: true
//	})

users.ensureIndex({ fieldName: 'username', unique: true })
sessions.ensureIndex({ fieldName: 'token'})
sessions.ensureIndex({ 
	fieldName: 'created',
	expireAfterSeconds: 86400
})

var Validator = require('jsonschema').Validator,
	validator = new Validator(),
	schemas = require('./schemas')

validator.addSchema(schemas.user, '/user')

var emailjs = require('emailjs'),
	email = emailjs.server.connect(config.email_config)

var signupController = SignupController(users, sessions, config, validator, hasher, crypto, email)
var userController = UserController(users, sessions, config, validator, hasher, crypto, email)

app.use(bodyParser.json())

loginRoute.route('/signup')
	.post([
		signupController.signup,
		signupController.emailVerify
	])

loginRoute.route('/')
	.post(userController.login)

app.get(config.http_root+'verify/:token', signupController.verify)

apiRoute.use(function (req, res, next) {
	console.log('api call')
	next()
})

apiRoute.get('/testauth', [
	userController.verifyLogin, function (req, res) {
		res.send("you are auth'd :D")
		return
	}
])

app.use(config.http_root+'api', apiRoute) 
app.use(config.http_root+'login', loginRoute) 

app.listen(config.http_port, config.http_bind_addr)
