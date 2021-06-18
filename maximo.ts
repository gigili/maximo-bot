import {TwitchClient} from "./utility/clients/tmiClient";
import {DiscordClient} from "./utility/clients/discordClient";
import {DB} from "./utility/db";

DB.getInstance().then(r => console.info(r));

const twitchClient = new TwitchClient();
twitchClient.startClient();

const discordClient = new DiscordClient();
discordClient.initClient();

process.on("unhandledRejection", (err, promise) => {
	console.error(`Error: ${err}`);
});
