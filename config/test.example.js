var config = {}

// port which the server should listen on
config.http_port = 8000

// to listen on all interfaces
// SET THIS TO NULL
// added for testing uses
config.http_bind_addr = '127.0.0.1'

// used for the email body
config.http_address = 'http://127.0.0.1:8000'

// used by all the routes to find the base of the app
config.http_root = '/'

// smtp connection info for your email
config.email_config = {
	user: 'your-user',
	password: 'your-pass',
	host: 'your-host',
	ssl: true
}

// what you want the from field in your email to have
config.email_from = 'your project name <your@email.tld>'

config.db = {
	users: './db/users.db',
	sessions: './db/sessions.db',
	accounts: './db/accounts.db',
	transactions: './db/transactions.db',
	history: './dbhistory.db'
}

module.exports = config
