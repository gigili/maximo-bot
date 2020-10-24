export type User = {
	'badges': { broadcaster: string, 'warcraft': string },
	'color': string,
	'display-name': string,
	'emotes': { '25': string[] },
	'mod': boolean,
	'room-id': string,
	'subscriber': boolean,
	'turbo': boolean,
	'user-id': string,
	'user-type': string,
	'emotes-raw': string,
	'badges-raw': string,
	'username': string,
	'message-type': string
}

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
