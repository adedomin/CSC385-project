var config = require('./config/test')

var express = require('express'),
	app = express(),
	apiRoute = express.Router(),
	loginRoute = express.Router(),
	staticRoute = express.static(__dirname+'/resources'),
	SignupController = require('./controllers/signup')
	bodyParser = require('body-parser')

var nedb = require('nedb'),
	users = new nedb({
		filename: './db/users.db',
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

users.ensureIndex({ fieldname: 'username', unique: true })

signupController = SignupController(users, config)

app.use(bodyParser.json())

loginRoute.route(config.http_root+'signup')
	.post([
		signupController.signup,
		signupController.emailVerify
	])

apiRoute.use(function (req, res, next) {
	console.log()
	next()
})

app.use(config.http_root+'api', apiRoute) 
app.use(config.http_root+'login', loginRoute) 

app.get(config.http_root+'verify/:userid', signupController.verify)

app.listen(config.http_port, config.http_bind_addr)
