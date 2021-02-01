import {Config} from "./types";

export const config: Config = {
	channels: ["gacbl", "thatn00b__", "gabbo1416"],
	debug: {
		enabled: false,
		url: "irc.fdgt.dev"
	},
	memebox: {
		enabled: false,
		url: "ws://localhost:4444",
		wsClient: null
	}
}
