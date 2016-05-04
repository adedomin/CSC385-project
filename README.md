CSC385-Project - Group 4 - eBanking app
=======================================

Installing
----------

### Config

Make sure to copy your own config from the example:

	cp config/test.example.js config/test.js

Edit the config as desired, keep particular note of the email_config object as they are completely invalid, unlike the other defaults.

If you use the email and deploy this outside of your local machine, please be sure to set http_address to the domain name, and root of your web application.

### Dependencies

Just run:

	npm install

at the root of the directory, it should install and compile all the needed dependencies for the application.

### Running

You can background the job and hand it off to init, or you can use a tool like pm2 to run it.

First method:

	node eBanking.js >&err.log & disown

Second method:

	pm2 start eBanking.js

Using the webapp
----------------

Make sure to start the server as described in the install section.
Afterwrads, navigate to the domain name (or ip), and root address of the web application.

You should be greeted by a login prompt, click on sign up at the bottom.
Sign up by filling out all the fields.

Check the username email address you provided for the email to finalize signup.
Note that username emails are not verified;
so if the email does not exist it fails silently.

Once you verifed the email by clicking on the link in the email, go back to the root page of the application.
Sign in using your credentials you provided.

From there, it's self explainatory, you can create accounts, create transactions and view account history.

The other functionality required: bill payer, sharing accounts with users, is not implemented.
