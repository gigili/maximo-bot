import {Command, Services, User} from "../utility/types";
import commands from "./staticCommands";
import {getCommandLevelFromMessage, getPermissionLevels} from "../utility/helpers";
import {DB} from "../utility/db";

export async function GetCommandName(command: string, args: string[], user: User, channel: string, service: Services): Promise<any> {
	let commandFound = false;
	let output = null;
	const message = `${command} ${args.join(" ")}`;

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
			const author = service === Services.Discord ? user : "@" + (user["display-name"] ?? user.username);
			output = commands.yeet();
			commandFound = true;
			break;
		case "!add":
			output = addCommand(channel, message, user, service);
			commandFound = true;
			break;
		case "!edit":
			output = updateCommand(channel, message, user, service);
			commandFound = true;
			break;
		case "!delete":
			output = deleteCommand(channel, message, user, service);
			commandFound = true;
			break;
		case "!alias":
			output = addAlias(channel, message, user, service);
			commandFound = true;
			break;
		case "!rmalias":
			output = removeAlias(channel, message, user, service);
			commandFound = true;
			break;
	}

	if (!commandFound) return await handleCommandFromDB(command, args, channel, user, service);
	return output;
}

export async function addCommand(channel: string, message: string, user: User, service: Services) {
	const permissions = getPermissionLevels(user);
	if (permissions.level < 2) return;

	const messageParts = message.split(" ");
	const command = messageParts[1] ?? null;
	const output = messageParts?.slice(2)?.join(" ") ?? null;
	const db = await DB.getInstance();

	if (!command || !command.startsWith("!")) {
		return "Invalid command name. Use !add !{cmd_name} {output}";
	}

	if (!output) {
		return "Command needs and output. Use !add !{cmd_name} {output}";
	}

	const level = getCommandLevelFromMessage(output);
	if (level == -1) {
		return `Invalid permission level specified. Supported options are: --level {all|sub|mod|broadcaster}`;
	}

	const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ? AND service = ?", [channel, command, service]);
	if (result) {
		return `Hey @${user["display-name"]} the command ${command} already exists`;
	}

	const clean_output = output.replace(/--level\s(all|sub|mod|broadcaster)/, "");

	const params = [channel, command, clean_output, level, service];
	const res = await db.run("INSERT INTO commands (channel, command, output, level, service) VALUES(?, ?, ?, ?, ?)", params);

	if (res) {
		return `Command ${command} added successfully`;
	} else {
		console.error(res);
		return `Unable to add command ${command}`;
	}
}

export async function updateCommand(channel: string, message: string, user: User, service: Services) {
	const permissions = getPermissionLevels(user);
	if (permissions.level < 2) return;

	const messageParts = message.split(" ");
	const command = messageParts[1] ?? null;
	const output = messageParts?.slice(2)?.join(" ") ?? null;
	const db = await DB.getInstance();

	if (!command || !command.startsWith("!")) {
		return "Invalid command name. Use !edit !{cmd_name} {output}";
	}

	if (!output) {
		return "Command needs and output. Use !edit !{cmd_name} {output}";
	}

	let level = getCommandLevelFromMessage(output);
	if (level == -1) {
		return `Invalid permission level specified. Supported options are: --level {all|sub|mod|broadcaster}`;
	}

	const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ? AND service = ?", [channel, command, service]);
	if (!result) {
		return `Hey @${user["display-name"]} the command ${command} doesn't exist`;
	}

	if (!output.includes("--level")) {
		level = result["level"];
	}

	const clean_output = output.replace(/--level\s(all|sub|mod|broadcaster)/, "");
	const res = await db.run("UPDATE commands SET output = ?, level = ? WHERE channel = ? AND command = ? AND service = ?", [clean_output, level, channel, command, service]);
	if (res) {
		return `Command ${command} was updated successfully`;
	} else {
		console.error(res);
		return `Unable to update command ${command}`;
	}
}

export async function deleteCommand(channel: string, message: string, user: User, service: Services) {
	const permissions = getPermissionLevels(user);
	if (permissions.level < 2) return;

	const messageParts = message.split(" ");
	const command = messageParts[1] ?? null;
	const db = await DB.getInstance();

	if (!command || !command.startsWith("!")) {
		return "Invalid command name. Use !delete !{cmd_name}";
	}

	const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ? AND service = ?", [channel, command, service]);
	if (!result) {
		return `Hey @${user["display-name"]} the command ${command} doesn't exist`;
	}

	await db.run("DELETE FROM alias WHERE channel = ? AND command = ? AND service = ?", [channel, command, service]);
	const res = await db.run("DELETE FROM commands WHERE channel = ? AND command = ? AND service = ?", [channel, command, service]);
	if (res) {
		return `Command ${command} was deleted successfully`;
	} else {
		console.error(res);
		return `Unable to delete command ${command}`;
	}
}

export async function addAlias(channel: string, message: string, user: User, service: Services) {
	const permissions = getPermissionLevels(user);
	if (permissions.level < 2) return;

	const messageParts = message.split(" ");
	const command = messageParts[1] ?? null;
	const alias = messageParts[2] ?? null;
	const db = await DB.getInstance();

	if (!command || !command.startsWith("!")) {
		return "Invalid command usage. Use !alias !{cmd_name} !{alias_name}";
	}

	if (!alias) {
		return "Missing alias. Use !alias !{cmd_name} !{alias_name}";
	}

	const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ? AND service = ?", [channel, command, service]);
	if (!result) {
		return `Hey @${user["display-name"]} the command ${command} doesn't exist`;
	}

	const aliasExist = await db.get("SELECT * FROM alias WHERE channel = ? AND alias = ? AND service = ?", [channel, alias, service]);
	if (aliasExist) {
		return `Hey @${user["display-name"]} the alias ${alias} already exist`;
	}

	const params = [channel, command, alias, service];
	const res = await db.run("INSERT INTO alias (channel, command, alias, service) VALUES(?, ?, ?, ?)", params);

	if (res) {
		return `Alias ${alias} was added successfully for the command ${command}`;
	} else {
		console.error(res);
		return `Unable to add alias ${alias}`;
	}
}

export async function removeAlias(channel: string, message: string, user: User, service: Services) {
	const permissions = getPermissionLevels(user);
	if (permissions.level < 2) return;

	const messageParts = message.split(" ");
	const alias = messageParts[1] ?? null;
	const db = await DB.getInstance();

	if (!alias) {
		return "Invalid alias provided. Use !rmalias !{alias_name}";
	}

	const aliasExist = await db.get("SELECT * FROM alias WHERE channel = ? AND alias = ? AND service = ?", [channel, alias, service]);
	if (!aliasExist) {
		return `Hey @${user["display-name"]} the alias ${alias} doesn't exist`;
	}

	const params = [channel, alias, service];
	const res = await db.run("DELETE FROM alias WHERE channel = ? AND alias = ? AND service = ?", params);

	if (res) {
		return `Alias ${alias} was deleted successfully`;
	} else {
		console.error(res);
		return `Unable to delete alias ${alias}`;
	}
}

async function getCommandFromDB(command: string, channel: string, user: User, service: Services): Promise<boolean | Command> {
	const permissions = getPermissionLevels(user);
	const db = await DB.getInstance();

	const params = [command, command, channel, service, service];
	const result = await db.get(
		"SELECT c.* FROM commands AS c LEFT JOIN alias a on c.channel = a.channel WHERE (c.command = ? OR a.alias = ?) AND c.channel = ? AND (c.service = ? OR a.service = ?)",
		params
	);

	if (!result) return false;
	if (result.level > permissions.level) return false;

	return result as Command;
}

async function handleCommandFromDB(cmd: string, args: string[], channel: string, user: User, service: Services): Promise<string> {
	const result = await getCommandFromDB(cmd, channel, user, service);
	if (!result) return "";

	const command = result as Command;
	return command.output;
}
