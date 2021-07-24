import {GetCommandName} from "../commands/handler";
import {MessageVariable, MessageVariables, Services} from "../utility/types";
import {DB} from "../utility/db";

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
			self.onMessage(message).then();
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

		let output = undefined;
		switch (getCommandFromMessage) {
			case "!add":
				output = await this.addCommand(message);
				break;
			case "!edit":
				output = await this.updateCommand(message);
				break;
			case "!delete":
				output = await this.deleteCommand(message);
				break;
			case "!alias":
				output = await this.addAlias(message);
				break;
			case "!rmalias":
				output = await this.removeAlias(message);
				break;
		}

		if (output != undefined) {
			message.channel.send(output);
			return;
		}

		if (message && message.content.startsWith("!")) {
			let commandOutput = await GetCommandName(
				getCommandFromMessage,
				getRestOfMessage,
				message.author,
				message.guild.name,
				Services.Discord
			);

			if (!commandOutput) return;

			//!test @test => Hey {toUser} this is a test => Hey test this is test
			const variables: MessageVariables = {
				[MessageVariable.toUser]: message.mentions.users.first(),
				[MessageVariable.User]: message.author,
			};

			let msgOutput = typeof commandOutput === "boolean" ? "" : commandOutput.output;
			for (const [key, value] of Object.entries(variables)) {
				msgOutput = msgOutput.replace(key, value);
			}

			message.channel.send(msgOutput);
		}
	}

	async addCommand(message: any) {
		/*const permissions = getTwitchPermissionLevels(user);
		if (permissions.level < 2) return;*/
		const channel = message.guild.name;
		const messageParts = message.content.split(" ");
		const command = messageParts[1] ?? null;
		const output = messageParts?.slice(2)?.join(" ") ?? null;
		const db = await DB.getInstance();

		if (!command || !command.startsWith("!")) {
			return "Invalid command name. Use !add !{cmd_name} {output}";
		}

		if (!output) {
			return "Command needs and output. Use !add !{cmd_name} {output}";
		}

		const level = this.getCommandLevelFromMessage(message);
		if (level == "-1") {
			return `Invalid permission level specified. Supported options are: --level {all|sub|mod|broadcaster}`;
		}

		const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ? AND service = ?", [channel, command, Services.Discord]);
		if (result) return `Hey {user} the command ${command} already exists`;

		const clean_output = output.replace(/--level(\s.+\s|\s.+$)/, "");
		const params = [channel, command, clean_output, level, Services.Discord];

		const res = await db.run("INSERT INTO commands (channel, command, output, level, service) VALUES(?, ?, ?, ?, ?)", params);

		if (res) {
			return `Command ${command} added successfully`;
		} else {
			console.error(res);
			return `Unable to add command ${command}`;
		}
	}

	async updateCommand(message: any) {
		// const permissions = getTwitchPermissionLevels(user);
		// if (permissions.level < 2) return;

		const channel = message.guild.name;
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

		let level = this.getCommandLevelFromMessage(output);
		if (level == "-1") {
			return `Invalid permission level specified. Supported options are: --level {all|sub|mod|broadcaster}`;
		}

		const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ? AND service = ?", [channel, command, Services.Discord]);
		if (!result) {
			return `Hey {user} the command ${command} doesn't exist`;
		}

		const clean_output = output.replace(/--level(\s.+\s|\s.+$)/, "");
		const res = await db.run("UPDATE commands SET output = ?, level = ? WHERE channel = ? AND command = ? AND service = ?", [clean_output, level, channel, command, Services.Discord]);
		if (res) {
			return `Command ${command} was updated successfully`;
		} else {
			console.error(res);
			return `Unable to update command ${command}`;
		}
	}

	async deleteCommand(message: any) {
		// const permissions = getTwitchPermissionLevels(user);
		// if (permissions.level < 2) return;

		const channel = message.guild.name;
		const messageParts = message.split(" ");
		const command = messageParts[1] ?? null;
		const db = await DB.getInstance();

		if (!command || !command.startsWith("!")) {
			return "Invalid command name. Use !delete !{cmd_name}";
		}

		const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ? AND service = ?", [channel, command, Services.Discord]);
		if (!result) {
			return `Hey {user} the command ${command} doesn't exist`;
		}

		await db.run("DELETE FROM alias WHERE channel = ? AND command = ? AND service = ?", [channel, command, Services.Discord]);
		const res = await db.run("DELETE FROM commands WHERE channel = ? AND command = ? AND service = ?", [channel, command, Services.Discord]);
		if (res) {
			return `Command ${command} was deleted successfully`;
		} else {
			console.error(res);
			return `Unable to delete command ${command}`;
		}
	}

	async addAlias(message: any) {
		// const permissions = getTwitchPermissionLevels(user);
		// if (permissions.level < 2) return;

		const channel = message.guild.name;
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

		const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ? AND service = ?", [channel, command, Services.Discord]);
		if (!result) {
			return `Hey {user} the command ${command} doesn't exist`;
		}

		const aliasExist = await db.get("SELECT * FROM alias WHERE channel = ? AND alias = ? AND service = ?", [channel, alias, Services.Discord]);
		if (aliasExist) {
			return `Hey {user} the alias ${alias} already exist`;
		}

		const params = [channel, command, alias, Services.Discord];
		const res = await db.run("INSERT INTO alias (channel, command, alias, service) VALUES(?, ?, ?, ?)", params);

		if (res) {
			return `Alias ${alias} was added successfully for the command ${command}`;
		} else {
			console.error(res);
			return `Unable to add alias ${alias}`;
		}
	}

	async removeAlias(message: any) {
		// const permissions = getTwitchPermissionLevels(user);
		// if (permissions.level < 2) return;

		const channel = message.guild.name;
		const messageParts = message.split(" ");
		const alias = messageParts[1] ?? null;
		const db = await DB.getInstance();

		if (!alias) {
			return "Invalid alias provided. Use !rmalias !{alias_name}";
		}

		const aliasExist = await db.get("SELECT * FROM alias WHERE channel = ? AND alias = ? AND service = ?", [channel, alias, Services.Discord]);
		if (!aliasExist) {
			return `Hey {user} the alias ${alias} doesn't exist`;
		}

		const params = [channel, alias, Services.Discord];
		const res = await db.run("DELETE FROM alias WHERE channel = ? AND alias = ? AND service = ?", params);

		if (res) {
			return `Alias ${alias} was deleted successfully`;
		} else {
			console.error(res);
			return `Unable to delete alias ${alias}`;
		}
	}

	getCommandLevelFromMessage(msg: any): string {
		if (!msg.content.includes("--level")) return "@everyone";

		const lvl = msg.content.split("--level ");
		if (!lvl[1]) return "-1";

		const role = msg.guild.roles.cache.filter((r: any) => r.name == lvl[1].trim());
		const roleID = role.keys().next().value;
		if (role.has(roleID)) {
			return role.get(roleID).name ?? "@everyone";
		} else {
			return "@everyone";
		}
	}
}
