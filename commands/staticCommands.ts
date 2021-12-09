import {ChuckNorrisJoke, DadJoke, User} from "../utility/types";
import {AxiosRequestConfig, AxiosResponse} from "axios";
import {getTwitchToken} from "../utility/auth";
import {client as tmiClient} from "../utility/tmiClient";

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
				"Accept": "application/json",
				"User-Agent": "MaximoBot (https://github.com/gigili/maximo-bot/)",
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
		tmiClient.say(channel, `/me ${user.username} was teleported into the lurk lounge.`);
	},

	async uptime(channel: string, user: User) {
		if (!token) {
			token = await getTwitchToken();
		}

		axios.get(`https://api.twitch.tv/helix/users?id=${process.env.BOT_USER_ID}`, {
			headers: {
				"authorization": `Bearer ${token}`,
				"client_id" : process.env.CLIENT_ID
			}
		}).then(async (response: AxiosResponse) => {
			console.log(response.data);
			/*const date = response.data.data.started_at;
			await tmiClient.say(channel, `Hey @${user.username}, the up time is: ${date}`);*/
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
	},
	
	codepow(channel: string, user : User){
		tmiClient.say(channel, `Working on CodePow (Pow IT) which is a Twitter clone for developers which integrates NLP to detect intent and technologies in their messages think StackOverFlow + Twitter (www.codepow.io)`);
	},

	github(channel: string, user: User){
		console.log(channel);
		if(channel === "#gacbl"){
			tmiClient.say(channel, "You can find most of my project on my GitHub profile: https://github.com/gigili");
		}
	}
}
