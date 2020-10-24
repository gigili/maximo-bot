import {Config} from "./types";

export const config: Config = {
	channels: ["gacbl"],
	debug: {
		enabled: true,
		url: "irc.fdgt.dev"
	},
	memebox: {
		enabled: true,
		url: "ws://localhost:4444",
		wsClient: null
	}
}
