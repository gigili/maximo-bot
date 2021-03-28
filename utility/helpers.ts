import {PermissionLevels, User} from "./types";

export function getPermissionLevels(user: User): PermissionLevels {
	const levels: PermissionLevels = {
		isBroadcaster: false,
		isMod: false,
		isSub: false,
		level: 0
	}

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

export function getCommandLevelFromMessage(msg: string): number {
	console.log("includes --level", msg.includes("--level"));
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
