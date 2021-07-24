import {Command, Services, User} from "../utility/types";
import commands from "./staticCommands";
import {DB} from "../utility/db";

export async function GetCommandName(command: string, args: string[], user: User, channel: string, service: Services): Promise<boolean | Command> {
	let commandFound = false;
	let output = null;

	switch (String(command).toLowerCase()) {
		case "!hello":
			output = commands.hello();
			commandFound = true;
			break;
		case "!wrongtip":
			output = commands.wrongTip();
			commandFound = true;
			break;
		case "!wrongtop":
			output = commands.wrongTop();
			commandFound = true;
			break;
		case "!dad":
			output = commands.dadJoke();
			commandFound = true;
			break;
		case "!chuck":
			output = commands.chuckJokes();
			commandFound = true;
			break;
		case "!uptime":
			output = commands.uptime(channel);
			commandFound = true;
			break;
		case "!yeet":
			output = commands.yeet();
			commandFound = true;
			break;
	}

	if (!commandFound) return await getCommandFromDB(command, channel, service);
	return {
		channel: channel,
		command: command,
		output: await output,
		level: "0",
		created_at: ""
	} as Command;
}


export async function getCommandFromDB(command: string, channel: string, service: Services): Promise<boolean | Command> {
	const db = await DB.getInstance();

	const params = [command, command, channel, service, service];
	const result = await db.get(`
			SELECT c.*
			FROM commands AS c
					 LEFT JOIN alias a on c.channel = a.channel
			WHERE (c.command = ? OR a.alias = ?)
			  AND c.channel = ?
			  AND (c.service = ? OR a.service = ?)`,
		params
	);

	if (!result) return false;
	return result as Command;
}
