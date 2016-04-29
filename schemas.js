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

var schemas = {}

schemas.user = {
	'id': '/user',
	'type': 'object',
	'properties': {
		'username': { 
			'type': 'string',
			'required': true
		},
		'first': { 
			'type': 'string',
			'required': true
		},
		'last': {
			'type': 'string',
			'required': true
		},
		'password': {
			'type': 'string', 
			'required': true
		},
		'address': {
			'type': 'string'
		},
		'city': {
			'type': 'string'
		},
		'state': { 
			'enum': [
				'CT','CA'
			]
		}
	}
}

module.exports = schemas
