import {CommonUserstate} from "tmi.js";

export interface TwitchUser extends CommonUserstate {
	username: string;
}

export interface DiscordUser extends CommonUserstate {
	username: string;
}

export type User = TwitchUser | DiscordUser;

export type DadJoke = {
	id: string,
	joke: string,
	status: number
}

export type ChuckNorrisJoke = {
	categories: string[],
	created_at: string,
	updated_at: string,
	"icon_url": string,
	"id": string,
	"url": string,
	"value": string
}

export type TwitchAuth = {
	"access_token": string,
	"expires_in": number,
	"scope": string[],
	"token_type": "bearer"
}

export type Config = {
	channels: string[],
	debug: {
		enabled: boolean,
		url: string
	},
	memebox: {
		enabled: boolean,
		url: string,
		wsClient: WebSocket | null
	}
}

export type MemeBoxConfig = {
	events: { [key: string]: MemeBoxEvent }
}

export type MemeBoxEvent = {
	enabled: boolean,
	clipID: string,
	message?: string
}

export type MemeBoxAction = {
	id: string,
	message?: string
}

export type ConnectionOptions = {
	reconnect: boolean,
	secure: boolean,
	server?: string
}

export type PermissionLevels = {
	isBroadcaster: boolean,
	isMod: boolean,
	isSub: boolean,
	level: number
}

export type Command = {
	channel: string,
	command: string,
	output: string,
	level: number,
	created_at: string
}

export type MessageVariables = {
	[key: string]: string
}


export enum Services {
	Twitch = "Twitch",
	Discord = "Discord"
}

export type ServicesType = {
	Twitch: Services.Twitch,
	Discord: Services.Discord
}
