export interface User {
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

export interface DadJoke {
	id: string,
	joke: string,
	status: number
}

export interface ChuckNorrisJoke {
	categories: string[],
	created_at: string,
	updated_at: string,
	"icon_url": string,
	"id": string,
	"url": string,
	"value": string
}

export interface TwitchAuth {
	"access_token": string,
	"expires_in": number,
	"scope": string[],
	"token_type": "bearer"
}
