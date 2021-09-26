import {ChuckNorrisJoke, DadJoke} from "../utility/types";
import {AxiosRequestConfig} from "axios";

const axios = require("axios");

export default {
	hello() {
		return `Hey {user}. Welcome, sit back and enjoy`;
	},

	async wrongTip(): Promise<string> {
		const gistUrl = "https://gist.githubusercontent.com/gigili/275b0f19c4cb564bda3d3a81c0136d8f/raw/d3719d3a19570f59982286950947e309bc7e6105/wrong-developer-tips.json";
		const result = await axios.get(gistUrl);
		const randomTipIndex = Math.floor(Math.random() * result.data.length) + 1;
		return `Hey {user}, your wrong tip is: ${result.data[randomTipIndex]}`;
	},

	wrongTop() {
		return `Hey {user}, I think you meant the tip not top Kappa`;
	},

	async dadJoke() {
		const url = "https://icanhazdadjoke.com/";
		const headers: AxiosRequestConfig = {
			headers: {
				"Accept": "application/json",
				"User-Agent": "MaximoBot (https://github.com/gigili/maximo-bot/)",
			}
		}

		const {data} = await axios.get(url, headers);
		return (data as DadJoke).joke;
	},

	async chuckJokes() {
		const url = "https://api.chucknorris.io/jokes/random?category=dev";
		const {data} = await axios.get(url);
		return (data as ChuckNorrisJoke).value;
	},

	async uptime(channel: string) {
		const channelName = channel.replace("#", "");
		const res = await axios.get(`https://beta.decapi.me/twitch/uptime/${channelName}`);
		return `The up time is: ${res.data}`;
	},

	yeet() {
		return `{user} has yeeted {toUser} into the oblivion.`;
	},
};
