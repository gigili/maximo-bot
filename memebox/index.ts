import {config} from "../utility/config";
import {client} from "../clients/tmiClient";
import {memeBoxConfig} from "./config";
import {MemeBoxAction} from "../utility/types";

const WebSocket = require('ws');

export const MemeBox = {
	initMemeBox() {
		if (!config.memebox.enabled) return;
		config.memebox.wsClient = new WebSocket(config.memebox.url);

		Object.keys(memeBoxConfig.events).forEach((eventName) => {
			if (memeBoxConfig.events[eventName].enabled) {
				const event = memeBoxConfig.events[eventName];
				client.on(eventName, (...args: []) => {
					const clipData: MemeBoxAction = {
						id: event.clipID
					};

					if (event.message) {
						const regex = new RegExp(/{.+?}/g);
						clipData.message = event.message;
						let x;
						while ((x = regex.exec(event.message)) !== null) {
							clipData.message = clipData.message.replace(x[0], eval(x[0]));
						}
					}

					if (config.memebox.wsClient !== null) {
						//console.log(config.memebox.wsClient);
						console.log(clipData);
						//config.memebox.wsClient.send(`TRIGGER_CLIP=${JSON.stringify(clipData)}`)
					}
				})
			}
		});

		//client.say("#gacbl", "raid --username gacbl");
	}
}
