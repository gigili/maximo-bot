import {Command, MessageVariables, User} from "../utility/types";
import commands from "./staticCommands";
import {getCommandLevelFromMessage, getPermissionLevels} from "../utility/helpers";
import {DB} from "../utility/db";
import {client as tmiClient} from "../utility/tmiClient";

export async function GetCommandName(command: string, args: string[], user: User, channel: string): Promise<boolean> {
	let commandFound = false;
	const message = `${command} ${args.join(" ")}`;

	switch (String(command).toLowerCase()) {
		case "!hello":
			commands.hello(channel, user);
			commandFound = true;
			break;
		case "!wrongtip":
			commands.wrongTip(channel, user).then(() => {
			});
			commandFound = true;
			break;

		case "!wrongtop":
			commands.wrongTop(channel, user);
			commandFound = true;
			break;

		case "!dad":
			commands.dadJoke(channel).then(() => {
			});
			commandFound = true;
			break;

		case "!chuck":
			commands.chuckJokes(channel).then(() => {
			});
			commandFound = true;
			break;

		case "!lurk":
			commands.lurk(channel, user);
			commandFound = true;
			break;

		case "!uptime":
			commands.uptime(channel, user).then(() => {
			});
			commandFound = true;
			break;

		case "!hug":
			commands.hug(channel, user, args[0]);
			commandFound = true;
			break;

		case "!yeet":
			commands.yeet(channel, user, args[0]);
			commandFound = true;
			break;
		case "!add":
			addCommand(channel, message, user).then(() => {
			});
			commandFound = true;
			break;
		case "!edit":
			updateCommand(channel, message, user).then(() => {
			});
			commandFound = true;
			break;
		case "!delete":
			deleteCommand(channel, message, user).then(() => {
			});
			commandFound = true;
			break;
		case "!alias":
			addAlias(channel, message, user).then(() => {
			});
			commandFound = true;
			break;
		case "!rmalias":
			removeAlias(channel, message, user).then(() => {
			});
			commandFound = true;
			break;
	}

	if (!commandFound) return await handleCommandFromDB(command, args, channel, user);
	return commandFound;
}

export async function addCommand(channel: string, message: string, user: User) {
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
		await tmiClient.say(channel, `Command ${command} added successfully`);
	} else {
		console.error(res);
		await tmiClient.say(channel, `Unable to add command ${command}`);
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

export async function addAlias(channel: string, message: string, user: User) {
	const permissions = getPermissionLevels(user);
	if (permissions.level < 2) return;

	const messageParts = message.split(" ");
	const command = messageParts[1] ?? null;
	const alias = messageParts[2] ?? null;
	const db = await DB.getInstance();

	if (!command || !command.startsWith("!")) {
		await tmiClient.say(channel, "Invalid command usage. Use !alias !{cmd_name} !{alias_name}");
		return;
	}

	if (!alias) {
		await tmiClient.say(channel, "Missing alias. Use !alias !{cmd_name} !{alias_name}");
		return;
	}

	const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ?", [channel, command]);
	if (!result) {
		await tmiClient.say(channel, `Hey @${user["display-name"]} the command ${command} doesn't exist`);
		return;
	}

	const aliasExist = await db.get("SELECT * FROM alias WHERE channel = ? AND alias = ?", [channel, alias]);
	if (aliasExist) {
		await tmiClient.say(channel, `Hey @${user["display-name"]} the alias ${alias} already exist`);
		return;
	}

	const params = [channel, command, alias];
	const res = await db.run("INSERT INTO alias (channel, command, alias) VALUES(?, ?, ?)", params);

	if (res) {
		await tmiClient.say(channel, `Alias ${alias} was added successfully for the command ${command}`);
	} else {
		console.error(res);
		await tmiClient.say(channel, `Unable to add alias ${alias}`);
	}
}

export async function removeAlias(channel: string, message: string, user: User) {
	const permissions = getPermissionLevels(user);
	if (permissions.level < 2) return;

	const messageParts = message.split(" ");
	const alias = messageParts[1] ?? null;
	const db = await DB.getInstance();

	if (!alias) {
		await tmiClient.say(channel, "Invalid alias provided. Use !rmalias !{alias_name}");
		return;
	}

	const aliasExist = await db.get("SELECT * FROM alias WHERE channel = ? AND alias = ?", [channel, alias]);
	if (!aliasExist) {
		await tmiClient.say(channel, `Hey @${user["display-name"]} the alias ${alias} doesn't exist`);
		return;
	}

	const params = [channel, alias];
	const res = await db.run("DELETE FROM alias WHERE channel = ? AND alias = ?", params);

	if (res) {
		await tmiClient.say(channel, `Alias ${alias} was deleted successfully`);
	} else {
		console.error(res);
		await tmiClient.say(channel, `Unable to delete alias ${alias}`);
	}
}

async function getCommandFromDB(command: string, channel: string, user: User): Promise<boolean | Command> {
	const permissions = getPermissionLevels(user);
	const db = await DB.getInstance();

	const params = [command, command, channel];
	const result = await db.get(
		"SELECT c.* FROM commands AS c LEFT JOIN alias a on c.channel = a.channel WHERE (c.command = ? OR a.alias = ?) AND c.channel = ?",
		params
	);

	if (!result) return false;
	if (result.level > permissions.level) return false;

	return result as Command;
}

async function handleCommandFromDB(cmd: string, args: string[], channel: string, user: User): Promise<boolean> {
	const result = await getCommandFromDB(cmd, channel, user);
	if (!result) return false;

	//!test @test => Hey {toUser} this is a test => Hey test this is test
	const variables: MessageVariables = {
		"{toUser}": (args.length > 0 && args[0].includes("@")) ? args[0].replace("@", "") : args[0] ?? "",
		"{user}": user["display-name"] ?? user.username,
	};

	const command = result as Command;
	let output = command.output;

	for (const key in variables) {
		if (!key) continue;
		if (!variables.hasOwnProperty(key)) continue;
		output = output.replace(key, variables[key]);
	}

	await tmiClient.say(channel, output);

	return true;
}
