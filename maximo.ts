import {User} from "./utility/types";
import {client} from "./utility/tmiClient";

const commandController = require("./commands/handler");


client.on('message', (channel: string, tags: User, message: string, self: unknown) => {
	if (self) return;

	const getCommandFromMessage = message.split(" ")[0];
	const getRestOfMessage = message.split(" ").slice(1);

	if(message.startsWith("!drop") && tags.username.toLowerCase() === "gacbl"){
		constemotes = ["Kappa", "KappaPride", "KappaRoss", "KappaWealth", ""];
		constemote = emotes[Math.floor(Math.random() * emotes.length)];
		setTimeout(() => {
			client.say(channel, `!drop ${emote}`);
		}, 1500);
		return;
	}
	
	if (message && message.startsWith("!")) {
		commandController.GetCommandName(
			getCommandFromMessage,
			getRestOfMessage,
			tags,
			channel
		);

		return;
	}
});

process.on('unhandledRejection', (err, promise) => {
	console.error(`Error: ${err}`);
});
