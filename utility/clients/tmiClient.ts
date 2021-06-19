import {config} from "../config";
import {MemeBox} from "../../memebox";
import {ConnectionOptions, MessageVariable, MessageVariables, Services, User} from "../types";
import {GetCommandName} from "../../commands/handler";

const tmi = require("tmi.js");
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

export class TwitchClient {
	startClient() {
		client.connect()
			.then(() => {
				MemeBox.initMemeBox();
			})
			.catch(() => console.error(`[ERROR] Unable to connect to IRC server`));

		client.on("message", async (channel: string, user: User, message: string, self: unknown) => {
			if (self) return;

			const getCommandFromMessage = message.split(" ")[0];
			const getRestOfMessage = message.split(" ").slice(1);

			if (message.startsWith("!drop") && user.username.toLowerCase() === "gacbl") {
				const emotes = [
					"Kappa", "KappaPride", "KappaRoss", "KappaWealth", "",
					"LUL", "LuvHearts", "PogChamp", "GlitchCat", "KappaClaus",
					"bleedPurple", "CorgiDerp", "Keepo", "FrankerZ"
				];

				const emote = emotes[Math.floor(Math.random() * emotes.length)];
				setTimeout(() => {
					client.say(channel, `!drop ${emote}`);
				}, 3500);
				return;
			}

			if (message && message.startsWith("!")) {
				let commandOutput = await GetCommandName(
					getCommandFromMessage,
					getRestOfMessage,
					user,
					channel,
					Services.Twitch
				);

				if (!commandOutput) return;

				const toUser = (getRestOfMessage.length > 0 && getRestOfMessage[0].includes("@")) ? getRestOfMessage[0].replace("@", "") : getRestOfMessage[0] ?? "";

				//!test @test => Hey {toUser} this is a test => Hey test this is test
				const variables: MessageVariables = {
					[MessageVariable.toUser]: toUser,
					[MessageVariable.User]: user["display-name"] ?? user.username,
				};

				for (const [key, value] of Object.entries(variables)) {
					commandOutput = commandOutput.replace(key, value);
				}

				await client.say(channel, commandOutput);
			}
		});
	}
}


