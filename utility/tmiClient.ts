import {config} from "./config";
import {MemeBox} from "../memebox";
import {ConnectionOptions} from "./types";
import {DB} from "./db";

const tmi = require('tmi.js');
require("dotenv").config();

const connectionOptions: ConnectionOptions = {
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

client.connect()
	.then(() => {
		MemeBox.initMemeBox()
		DB.getInstance().then(r => console.info(r));
	})
	.catch(() => console.error(`[ERROR] Unable to connect to IRC server`));
