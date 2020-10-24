import axios from 'axios';
import {TwitchAuth} from "./types";

const client_secret = process.env.CLIENT_SECRET;
const client_id = process.env.CLIENT_ID;

let token = null;

export function getTwitchToken() {
	return axios.post(`https://id.twitch.tv/oauth2/token?scope=user:edit user:read:broadcast&response_type=token&client_secret=${client_secret}&grant_type=client_credentials&client_id=${client_id}`, {
		headers: {'Accept': 'application/vnd.twitchtv.v5+json'}
	}).then(response => {
		token = (response.data as TwitchAuth).access_token;
		return token;
	}).catch(error => {
		console.error("[ERROR] Failed twitch auth", error.response.data);
	});
}
