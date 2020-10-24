import {MemeBoxConfig} from "../utility/types";

export const memeBoxConfig: MemeBoxConfig = {
	events: {
		hosted: { // Channel is now hosted by another broadcaster.
			enabled: true,
			clipID: "",
			message: "{args[1]} hosted us for {args[2]} viewers <3",
		},
		raided: { // Channel is now being raided by another broadcaster.
			enabled: true,
			clipID: "0bfb38e8-88b1-4ef0-b91e-965239481197",
			message: "{args[1]} raided us with {args[2]} viewers <3",
		},
		ban: { // Username has been banned on a channel.
			enabled: true,
			clipID: "",
		},
		cheer: { // Username has cheered to a channel.
			enabled: true,
			clipID: "9a6161b8-9eaf-4f67-8e20-773481e5220c",
		},
		anongiftpaidupgrade: { // Username is continuing the Gift Sub they got from an anonymous user in channel.
			enabled: true,
			clipID: "",
		},
		giftpaidupgrade: { // Username is continuing the Gift Sub they got from sender in channel.
			enabled: true,
			clipID: "",
		},
		resub: { // Username has resubbed on a channel.
			enabled: true,
			clipID: "",
		},
		subgift: { // Username gifted a subscription to recipient in a channel.
			enabled: true,
			clipID: "0bfb38e8-88b1-4ef0-b91e-965239481197"
		},
		submysterygift: { // Username is gifting a subscription to someone in a channel.
			enabled: true,
			clipID: "",
		},
		subscription: { // Username has subscribed to a channel.
			enabled: true,
			clipID: "",
		},
	}
}
