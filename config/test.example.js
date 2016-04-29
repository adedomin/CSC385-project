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
	history: './db/history.db'
}

module.exports = config
