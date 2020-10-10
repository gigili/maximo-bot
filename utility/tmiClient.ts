const tmi = require('tmi.js');
require("dotenv").config();

const client = new tmi.Client({
	options: {debug: true},
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: process.env.BOT_NAME,
		password: process.env.BOT_TOKEN
	},
	channels: ['gacbl']
});

client.connect().catch(err => console.error(err));
module.exports = client;
