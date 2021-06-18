import {GetCommandName} from "../../commands/handler";
import {Services} from "../types";

const {Client, Intents} = require("discord.js");


export class DiscordClient {
	client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

	initClient() {
		console.log("Booting up discord client");

		const self = this;
		this.client.on("ready", () => {
			console.log(`Logged in as ${this.client.user.tag}!`);
			self.onReady();
		});

		this.client.on("message", (message: any) => {
			self.onMessage(message);
		});

		this.client.login(process.env.BOT_DISCORD_TOKEN);
	}

	onReady() {
		console.log("Discord client booted");
	}

	async onMessage(message: any) {
		if (message.author.bot) return;

		const getCommandFromMessage = message.content.split(" ")[0];
		const getRestOfMessage = message.content.split(" ").slice(1);

		if (message && message.content.startsWith("!")) {
			const commandOutput = await GetCommandName(
				getCommandFromMessage,
				getRestOfMessage,
				message.author,
				message.channel.name,
				Services.Discord
			);

			if (!commandOutput) return;
			message.channel.send(commandOutput);
		}
	}
}
