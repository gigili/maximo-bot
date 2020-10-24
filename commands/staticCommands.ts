import {ChuckNorrisJoke, DadJoke, User} from "../utility/types";
import {AxiosRequestConfig, AxiosResponse} from "axios";
import {getTwitchToken} from "../utility/auth";

const tmiClient = require("../utility/tmiClient");
const axios = require("axios");

let token: String | null = null;
export default {
	hello(channel: string, user: User) {
		tmiClient.say(channel, `Hey ${user.username}. Welcome, sit back and enjoy`);
	},

	async wrongTip(channel: string, user: User) {
		const gistUrl = "https://gist.githubusercontent.com/gigili/275b0f19c4cb564bda3d3a81c0136d8f/raw/d3719d3a19570f59982286950947e309bc7e6105/wrong-developer-tips.json";
		const result = await axios.get(gistUrl)
		const randomTipIndex = Math.floor(Math.random() * result.data.length) + 1;
		const wrongtip = result.data[randomTipIndex];

		await tmiClient.say(channel, `Hey @${user.username}, your wrong tip is: ${wrongtip}`);
	},

	wrongTop(channel: string, user: User) {
		tmiClient.say(channel, `Hey @${user.username}, I think you meant the tip not top Kappa`);
	},

	async dadJoke(channel: string) {
		const url = "https://icanhazdadjoke.com/";
		const headers: AxiosRequestConfig = {
			headers: {
				"Accept": "application/json"
			}
		}

		const {data} = await axios.get(url, headers);
		await tmiClient.say(channel, (data as DadJoke).joke);
	},

	async chuckJokes(channel: string) {
		const url = "https://api.chucknorris.io/jokes/random?category=dev";
		const {data} = await axios.get(url);
		await tmiClient.say(channel, (data as ChuckNorrisJoke).value);
	},

	lurk(channel: string, user: User) {
		tmiClient.say(channel, `${user.username} was teleported into the lurk lounge. Drinks will be served shortly.`)
	},

	async uptime(channel: string, user: User) {
		if (!token) {
			token = await getTwitchToken();
		}

		axios.get(`https://api.twitch.tv/helix/users?id=${process.env.USER_ID}&client_id=${process.env.CLIENT_ID}`, {
			headers: {"Authorization": `Bearer ${token}`}
		}).then(async (response: AxiosResponse) => {
			const date = response.data.data.started_at;
			await tmiClient.say(channel, `Hey @${user.username}, the up time is: ${date}`);
		}).catch((error: any) => {
			console.error("[ERROR]", error.response.data.message);
		});
	},

	hug(channel: string, user: User, message: string) {
		if (!message) return;

		if (message.indexOf("@") !== -1) {
			message = message.replace("@", "");
		}

		tmiClient.say(channel, `Hey ${message}, @${user['display-name']} is sending you virtual hugs <3`);
	},

	yeet(channel: string, user: User, message: string) {
		if (!message) return;

		if (message.indexOf("@") !== -1) {
			message = message.replace("@", "");
		}

		tmiClient.say(channel, `@${user['display-name']} has yeeted ${message} into the oblivion.`);
	}
}
