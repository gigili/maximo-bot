import {config} from "../utility/config";
import {client} from "../utility/tmiClient";
import {memeboxConfig} from "./config";

const WebSocket = require('ws');

export const MemeBox = {
	initMemeBox() {
		if (!config.memebox.enabled) return;
		config.memebox.wsClient = new WebSocket(config.memebox.url);

		Object.keys(memeboxConfig.events).forEach((eventName) => {
			if (memeboxConfig.events[eventName].enabled) {
				const event = memeboxConfig.events[eventName];
				client.on(eventName, () => {
					const clipData = {
						id: event.clipID,
						repeatX: 0,
						repeatSeconds: 0
					};

					config.memebox.wsClient.send(`TRIGGER_CLIP=${JSON.stringify(clipData)}`)
				})
			}
		})
	}
}
