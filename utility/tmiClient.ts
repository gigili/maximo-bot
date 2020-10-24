import {config} from "./config";
import {MemeBox} from "../memebox";

const tmi = require('tmi.js');
require("dotenv").config();

const connectionOptions = {
	reconnect: true,
	secure: true,
};

if (config.debug.enabled) {
	connectionOptions["server"] = config.debug.url;
}

export const client = new tmi.Client({
	options: {debug: true},
	connection: connectionOptions,
	identity: {
		username: process.env.BOT_NAME,
		password: process.env.BOT_TOKEN
	},
	channels: config.channels,
});

client.connect().catch(err => console.error(err)).then(() => {
	MemeBox.initMemeBox();
});
