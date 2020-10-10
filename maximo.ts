import {User} from "./utility/types";

const client = require("./utility/tmiClient");
const commandController = require("./commands/handler");

client.on('message', (channel: string, tags: User, message: string, self: unknown) => {
	if (self) return;

	const getCommandFromMessage = message.split(" ")[0];
	const getRestOfMessage = message.split(" ").slice(1);

	if (!message || !message.startsWith("!")) {
		return false;
	}

	commandController.GetCommandName(
		getCommandFromMessage,
		getRestOfMessage,
		tags,
		channel
	);
});

process.on('unhandledRejection', (err, promise) => {
	console.error(`Error: ${err}`);
});
