require("dotenv").config();

module.exports = {
	options: {
		debug: false,
	},
	identity: {
		username: '3mpee3mpee',
		password: process.env.OAUTH_TOKEN,
	},
	channels: ['3mpee3mpee'],
};
