import {User} from "../utility/types";
import commands from "./staticCommands";

export function GetCommandName(command: string, args: unknown, user: User, channel: string) {
	switch (String(command).toLowerCase()) {
		case "!hello":
			commands.hello(channel, user);
			break;
		case "!wrongtip":
			commands.wrongTip(channel, user);
			break;

		case "!wrongtop":
			commands.wrongTop(channel, user);
			break;

		case "!dad":
			commands.dadJoke(channel);
			break;

		case "!chuck":
			commands.chuckJokes(channel);
			break;

		case "!lurk":
			commands.lurk(channel);
			break;

		case "!uptime":
			commands.uptime(channel, user);
			break;
	}
}
