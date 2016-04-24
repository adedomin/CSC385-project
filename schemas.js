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
