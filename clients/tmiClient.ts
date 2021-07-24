import {config} from "../utility/config";
import {MemeBox} from "../memebox";
import {
	ConnectionOptions,
	MessageVariable,
	MessageVariables,
	Services,
	TwitchPermissionLevels,
	User
} from "../utility/types";
import {GetCommandName} from "../commands/handler";
import {DB} from "../utility/db";

const tmi = require("tmi.js");

const connectionOptions: ConnectionOptions = {
	reconnect: true,
	secure: true,
};

if (config.debug.enabled) {
	connectionOptions["server"] = config.debug.url;
}

export const client = new tmi.Client({
	options: {debug: true},
	connection: connectionOptions,
	identity: {
		username: process.env.BOT_NAME,
		password: process.env.BOT_TOKEN
	},
	channels: config.channels,
});

export class TwitchClient {
	startClient() {
		client.connect()
			.then(() => {
				MemeBox.initMemeBox();
			})
			.catch(() => console.error(`[ERROR] Unable to connect to IRC server`));

		client.on("message", async (channel: string, user: User, message: string, self: unknown) => {
			if (self) return;

			const getCommandFromMessage = message.split(" ")[0];
			const getRestOfMessage = message.split(" ").slice(1);

			if (message.startsWith("!drop") && user.username.toLowerCase() === "gacbl") {
				const emotes = [
					"Kappa", "KappaPride", "KappaRoss", "KappaWealth", "",
					"LUL", "LuvHearts", "PogChamp", "GlitchCat", "KappaClaus",
					"bleedPurple", "CorgiDerp", "Keepo", "FrankerZ"
				];

				const emote = emotes[Math.floor(Math.random() * emotes.length)];
				setTimeout(() => {
					client.say(channel, `!drop ${emote}`);
				}, 3500);
				return;
			}

			let output = undefined;
			switch (getCommandFromMessage) {
				case "!add":
					output = await this.addCommand(channel, message, user);
					break;
				case "!edit":
					output = await this.updateCommand(channel, message, user);
					break;
				case "!delete":
					output = await this.deleteCommand(channel, message, user);
					break;
				case "!alias":
					output = await this.addAlias(channel, message, user);
					break;
				case "!rmalias":
					output = await this.removeAlias(channel, message, user);
					break;
			}

			if (output != undefined) {
				await client.say(channel, output);
				return;
			}

			if (message && message.startsWith("!")) {
				let commandOutput = await GetCommandName(
					getCommandFromMessage,
					getRestOfMessage,
					user,
					channel,
					Services.Twitch
				);

				if (!commandOutput) return;

				const toUser = (getRestOfMessage.length > 0 && getRestOfMessage[0].includes("@")) ? getRestOfMessage[0].replace("@", "") : getRestOfMessage[0] ?? "";

				//!test @test => Hey {toUser} this is a test => Hey test this is test
				const variables: MessageVariables = {
					[MessageVariable.toUser]: toUser,
					[MessageVariable.User]: user["display-name"] ?? user.username,
				};


				let msgOutput = typeof commandOutput === "boolean" ? "" : commandOutput.output;
				for (const [key, value] of Object.entries(variables)) {
					msgOutput = msgOutput.replace(key, value);
				}

				await client.say(channel, msgOutput);
			}
		});
	}

	async addCommand(channel: string, message: string, user: User) {
		const permissions = this.getPermissionLevel(user);
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

		const level = this.getCommandLevelFromMessage(output);
		if (level == -1) {
			return `Invalid permission level specified. Supported options are: --level {all|sub|mod|broadcaster}`;
		}

		const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ? AND service = ?", [channel, command, Services.Twitch]);
		if (result) return `Hey {user} the command ${command} already exists`;

		const clean_output = output.replace(/--level\s(all|sub|mod|broadcaster)/, "");
		const params = [channel, command, clean_output, level.toString(), Services.Twitch];
		const res = await db.run("INSERT INTO commands (channel, command, output, level, service) VALUES(?, ?, ?, ?, ?)", params);

		if (res) {
			return `Command ${command} added successfully`;
		} else {
			console.error(res);
			return `Unable to add command ${command}`;
		}
	}

	async updateCommand(channel: string, message: string, user: User) {
		const permissions = this.getPermissionLevel(user);
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

		let level = this.getCommandLevelFromMessage(output);
		if (level == -1) {
			return `Invalid permission level specified. Supported options are: --level {all|sub|mod|broadcaster}`;
		}

		const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ? AND service = ?", [channel, command, Services.Twitch]);
		if (!result) {
			return `Hey {user} the command ${command} doesn't exist`;
		}

		if (!output.includes("--level")) {
			level = result["level"];
		}

		const clean_output = output.replace(/--level\s(all|sub|mod|broadcaster)/, "");
		const res = await db.run("UPDATE commands SET output = ?, level = ? WHERE channel = ? AND command = ? AND service = ?", [clean_output, level.toString(), channel, command, Services.Twitch]);
		if (res) {
			return `Command ${command} was updated successfully`;
		} else {
			console.error(res);
			return `Unable to update command ${command}`;
		}
	}

	async deleteCommand(channel: string, message: string, user: User) {
		const permissions = this.getPermissionLevel(user);
		if (permissions.level < 2) return;

		const messageParts = message.split(" ");
		const command = messageParts[1] ?? null;
		const db = await DB.getInstance();

		if (!command || !command.startsWith("!")) {
			return "Invalid command name. Use !delete !{cmd_name}";
		}

		const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ? AND service = ?", [channel, command, Services.Twitch]);
		if (!result) {
			return `Hey {user} the command ${command} doesn't exist`;
		}

		await db.run("DELETE FROM alias WHERE channel = ? AND command = ? AND service = ?", [channel, command, Services.Twitch]);
		const res = await db.run("DELETE FROM commands WHERE channel = ? AND command = ? AND service = ?", [channel, command, Services.Twitch]);
		if (res) {
			return `Command ${command} was deleted successfully`;
		} else {
			console.error(res);
			return `Unable to delete command ${command}`;
		}
	}

	async addAlias(channel: string, message: string, user: User) {
		const permissions = this.getPermissionLevel(user);
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

		const result = await db.get("SELECT * FROM commands WHERE channel = ? AND command = ? AND service = ?", [channel, command, Services.Twitch]);
		if (!result) {
			return `Hey {user} the command ${command} doesn't exist`;
		}

		const aliasExist = await db.get("SELECT * FROM alias WHERE channel = ? AND alias = ? AND service = ?", [channel, alias, Services.Twitch]);
		if (aliasExist) {
			return `Hey {user} the alias ${alias} already exist`;
		}

		const params = [channel, command, alias, Services.Twitch];
		const res = await db.run("INSERT INTO alias (channel, command, alias, service) VALUES(?, ?, ?, ?)", params);

		if (res) {
			return `Alias ${alias} was added successfully for the command ${command}`;
		} else {
			console.error(res);
			return `Unable to add alias ${alias}`;
		}
	}

	async removeAlias(channel: string, message: string, user: User) {
		const permissions = this.getPermissionLevel(user);
		if (permissions.level < 2) return;

		const messageParts = message.split(" ");
		const alias = messageParts[1] ?? null;
		const db = await DB.getInstance();

		if (!alias) {
			return "Invalid alias provided. Use !rmalias !{alias_name}";
		}

		const aliasExist = await db.get("SELECT * FROM alias WHERE channel = ? AND alias = ? AND service = ?", [channel, alias, Services.Twitch]);
		if (!aliasExist) {
			return `Hey {user} the alias ${alias} doesn't exist`;
		}

		const params = [channel, alias, Services.Twitch];
		const res = await db.run("DELETE FROM alias WHERE channel = ? AND alias = ? AND service = ?", params);

		if (res) {
			return `Alias ${alias} was deleted successfully`;
		} else {
			console.error(res);
			return `Unable to delete alias ${alias}`;
		}
	}

	getPermissionLevel(user: User): TwitchPermissionLevels {
		const levels: TwitchPermissionLevels = {
			isBroadcaster: false,
			isMod: false,
			isSub: false,
			level: 0
		};

		if (user.badges && user.badges.subscriber) {
			levels.isSub = true;
			levels.level = 1;
		}

		if (user.mod) {
			levels.isMod = true;
			levels.level = 2;
		}

		if (user.badges && user.badges.broadcaster) {
			levels.isBroadcaster = true;
			levels.level = 999;
		}

		return levels;
	}

	getCommandLevelFromMessage(msg: string): number {
		if (!msg.includes("--level")) return 0;

		let level = 0;
		const lvl = msg.split("--level ");
		if (!lvl[1]) return -1;

		switch (lvl[1]) {
			case "all":
				level = 0;
				break;
			case "sub":
				level = 1;
				break;
			case "mod":
				level = 2;
				break;
			case "broadcaster":
				level = 999;
				break;
			default:
				level = 0;
				break;
		}

		return level;
	}
}


