import {ChuckNorrisJoke, DadJoke, User} from "../utility/types";
import {AxiosRequestConfig} from "axios";
import {getTwitchToken} from "../utility/auth";

const tmiClient = require("../utility/tmiClient");
const axios = require("axios");

let token = null;
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

	lurk(channel: string) {
		tmiClient.say(channel, 'No worries, we all like some background noise while working :)')
	},

	//TODO: Fix this, 400 response code | NOT WORKING
	async uptime(channel: string, user: User) {
		if (!token) {
			token = await getTwitchToken();
		}

		const response = await axios.get(`https://api.twitch.tv/helix/streams?user_login=gacbl`, {
			headers: {
				"Authorization": `Bearer ${token}`,
				"Client-Id": process.env.CLIENT_ID
			}
		});
		const date = response.data.data.started_at;

		await tmiClient.say(channel, `Hey @${user.username}, the up time is: ${date}`);
	}
}
