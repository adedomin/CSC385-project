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

var waterfall = require('async/waterfall'),
	Transactions = require('../models/transactions')

module.exports = function (transMan, helper) {

	return {
		
		getTransactions: function (req, res) {
			
			helper.getTransactions(req.session.value, function (err, transactions) {
			
				if (err) {
					
					res.send({
						transactions: []
					})
					return
				}

				res.send({
					transactions: transactions
				})
			})
		},
		addTransaction: function (req, res) {
			
			if (!req.params ||
				!req.params.acctId1 ||
				!req.params.acctId2 ||
				!req.body ||
				!req.body.amount) {
			
				res.status(500)
				res.send({
					status: 'error',
					msg: 'accounts not defined'
				})
				return
			}

			if (!(/^\d*\.?\d{0,2}$/.test(req.body.amount))) {
				
				res.status(500)
				res.send({
					status: 'error',
					msg: 'illegal amount value'
				})
				return
			}

			if (!req.body.startAt) {
				
				req.body.startAt = 0
			}

			transMan.addTransaction(new Transactions (
				req.session.value,
				req.body.startAt,
				req.params.acctId1,
				req.params.acctId2,
				req.body.amount
			),
			function (err) {
				
				if (err) {
					
					res.status(500)
					res.send({
						status: 'error',
						msg: err
					})
					return
				}

				res.send({
					status: 'ok',
					msg: 'transaction registered'
				})
			})
		},
		removeTransaction: function (req, res) {
			
			if (!req.params.transid) {
				
				res.status(500)
				res.send({
					status: 'error',
					msg: 'no transaction id to delete'
				})
				return
			}

			transMan.removeTransaction(req.params.transid, req.session.value, function (err) {

				if (err) {
				
					res.status(500)
					res.send({
						status: 'error',
						msg: err
					})
					return
				}

				res.send({
					status: 'ok',
					msg: 'transaction canceled'
				})
			})
		}
	}
}
