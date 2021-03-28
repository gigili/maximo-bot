import {Config} from "./types";

export const config: Config = {
	channels: ["gacbl"],
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
