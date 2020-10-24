import {User} from "./utility/types";
import {client} from "./utility/tmiClient";

const commandController = require("./commands/handler");


client.on('message', (channel: string, tags: User, message: string, self: unknown) => {
	if (self) return;

	const getCommandFromMessage = message.split(" ")[0];
	const getRestOfMessage = message.split(" ").slice(1);

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
