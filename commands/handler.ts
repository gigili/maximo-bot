import {User} from "../utility/types";
import commands from "./staticCommands";

export function GetCommandName(command: string, args: string[], user: User, channel: string) {
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
			if(channel.replace("#", "").toLowerCase() !== "gacbl") break;
			commands.lurk(channel, user);
			break;

		case "!uptime":
			commands.uptime(channel, user);
			break;

		case "!hug":
			commands.hug(channel, user, args[0])
			break;

		case "!yeet":
			commands.yeet(channel, user, args[0]);
			break;
		
		case "!git":
			if(channel.replace("#", "").toLowerCase() !== "gacbl") break;
			commands.github(channel, user);
			break;
			
		case "!regex":
			commands.regex(channel, user);
			break;
	}
}
