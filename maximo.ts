import {User} from "./utility/types";
import {client} from "./utility/tmiClient";
import {addNewCommand, deleteCommand, GetCommandName, updateCommand} from "./commands/handler";

client.on('message', async (channel: string, user: User, message: string, self: unknown) => {
	if (self) return;

	const getCommandFromMessage = message.split(" ")[0];
	const getRestOfMessage = message.split(" ").slice(1);

	if (message.startsWith("!drop") && user.username.toLowerCase() === "gacbl") {
		const emotes = ["Kappa", "KappaPride", "KappaRoss", "KappaWealth", ""];
		const emote = emotes[Math.floor(Math.random() * emotes.length)];
		setTimeout(() => {
			client.say(channel, `!drop ${emote}`);
		}, 3500);
		return;
	}

	if (message && message.startsWith("!")) {
		const commandFound = GetCommandName(
			getCommandFromMessage,
			getRestOfMessage,
			user,
			channel
		);

		if (commandFound) return;

		if (message.startsWith("!add")) {
			await addNewCommand(channel, message, user)
		} else if (message.startsWith("!edit")) {
			await updateCommand(channel, message, user)
		} else if (message.startsWith("!delete")) {
			await deleteCommand(channel, message, user)
		}
	}
});

process.on('unhandledRejection', (err, promise) => {
	console.error(`Error: ${err}`);
});
