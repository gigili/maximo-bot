import {User} from "../utility/types";
import commands from "./staticCommands";
import {getCommandLevelFromMessage, getPermissionLevels} from "../utility/helpers";
import {DB} from "../utility/db";
import {client as tmiClient} from "../utility/tmiClient";

export function GetCommandName(command: string, args: string[], user: User, channel: string): boolean {
	let commandFound = false;
	switch (String(command).toLowerCase()) {
		case "!hello":
			commands.hello(channel, user);
			commandFound = true;
			break;
		case "!wrongtip":
			commands.wrongTip(channel, user);
			commandFound = true;
			break;

		case "!wrongtop":
			commands.wrongTop(channel, user);
			commandFound = true;
			break;

		case "!dad":
			commands.dadJoke(channel);
			commandFound = true;
			break;

		case "!chuck":
			commands.chuckJokes(channel);
			commandFound = true;
			break;

		case "!lurk":
			commands.lurk(channel, user);
			commandFound = true;
			break;

		case "!uptime":
			commands.uptime(channel, user);
			commandFound = true;
			break;

		case "!hug":
			commands.hug(channel, user, args[0])
			commandFound = true;
			break;

		case "!yeet":
			commands.yeet(channel, user, args[0]);
			commandFound = true;
			break;
	}

	return commandFound;
}

export async function addNewCommand(channel: string, message: string, user: User) {
	const permissions = getPermissionLevels(user);
	if (permissions.level < 2) return;

	const messageParts = message.split(" ");
	const command = messageParts[1] ?? null;
	const output = messageParts?.slice(2)?.join(" ") ?? null;
	const db = await DB.getInstance();

	if (!command || !command.startsWith("!")) {
		await tmiClient.say(channel, "Invalid command name. Use !add !{cmd_name} {output}");
		return;
	}

	if (!output) {
		await tmiClient.say(channel, "Command needs and output. Use !add !{cmd_name} {output}");
		return;
	}

	const level = getCommandLevelFromMessage(output);
	if (level == -1) {
		await tmiClient.say(channel, `Invalid permission level specified. Supported options are: --level {all|sub|mod|broadcaster}`);
		return;
	}

	const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ?", [channel, command]);
	if (result) {
		await tmiClient.say(channel, `Hey @${user["display-name"]} the command ${command} already exists`);
		return;
	}

	const params = [channel, command, output, level];
	const res = await db.run("INSERT INTO commands (channel, command, output, level) VALUES(?, ?, ?, ?)", params);

	if (res) {
		await tmiClient.say(channel, `Command ${command} added successfully`)
	} else {
		console.error(res);
		await tmiClient.say(channel, `Unable to add command ${command}`)
	}
}

export async function updateCommand(channel: string, message: string, user: User) {
	const permissions = getPermissionLevels(user);
	if (permissions.level < 2) return;

	const messageParts = message.split(" ");
	const command = messageParts[1] ?? null;
	const output = messageParts?.slice(2)?.join(" ") ?? null;
	const db = await DB.getInstance();

	if (!command || !command.startsWith("!")) {
		await tmiClient.say(channel, "Invalid command name. Use !edit !{cmd_name} {output}");
		return;
	}

	if (!output) {
		await tmiClient.say(channel, "Command needs and output. Use !edit !{cmd_name} {output}");
		return;
	}

	let level = getCommandLevelFromMessage(output);
	if (level == -1) {
		await tmiClient.say(channel, `Invalid permission level specified. Supported options are: --level {all|sub|mod|broadcaster}`);
		return;
	}

	const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ?", [channel, command]);
	if (!result) {
		await tmiClient.say(channel, `Hey @${user["display-name"]} the command ${command} doesn't exist`);
		return;
	}

	if (!output.includes("--level")) {
		level = result["level"];
	}

	const res = await db.run("UPDATE commands SET output = ?, level = ? WHERE channel = ? AND command = ?", [output, level, channel, command]);
	if (res) {
		await tmiClient.say(channel, `Command ${command} was updated successfully`);
	} else {
		console.error(res);
		await tmiClient.say(channel, `Unable to update command ${command}`);
	}
}

export async function deleteCommand(channel: string, message: string, user: User) {
	const permissions = getPermissionLevels(user);
	if (permissions.level < 2) return;

	const messageParts = message.split(" ");
	const command = messageParts[1] ?? null;
	const db = await DB.getInstance();

	if (!command || !command.startsWith("!")) {
		await tmiClient.say(channel, "Invalid command name. Use !delete !{cmd_name}");
		return;
	}

	const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ?", [channel, command]);
	if (!result) {
		await tmiClient.say(channel, `Hey @${user["display-name"]} the command ${command} doesn't exist`);
		return;
	}

	const res = await db.run("DELETE FROM commands WHERE channel = ? AND command = ?", [channel, command]);
	if (res) {
		await tmiClient.say(channel, `Command ${command} was deleted successfully`);
	} else {
		console.error(res);
		await tmiClient.say(channel, `Unable to delete command ${command}`);
	}
}
