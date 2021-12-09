import {User} from "./utility/types";
import {client} from "./utility/tmiClient";
import {AxiosRequestConfig, AxiosResponse} from "axios";

const commandController = require("./commands/handler");
const axios = require("axios");

client.on('message', async(channel: string, tags: User, message: string, self: unknown) => {
        if (self) return;

        const getCommandFromMessage = message.split(" ")[0];
        const getRestOfMessage = message.split(" ").slice(1);

        if(message.startsWith("!drop") && tags.username.toLowerCase() === "gacbl"){
                const emotes = ["Kappa", "KappaPride", "KappaRoss", "KappaWealth", ""];
                const emote = emotes[Math.floor(Math.random() * emotes.length)];
                setTimeout(() => {
                        client.say(channel, `!drop ${emote}`);
                }, 3500);
                return;
        }

        const username = tags.username.toLowerCase();
        const validUser = ((username === "gacbl") || (username === "thatn00b__"));
        if ((message && message === "!bopAll") && validUser) {
                const gistUrl = "https://gist.githubusercontent.com/gigili/fd93ce5d1c13200c2e0c9b2a14584026/raw/known-bot-list.json";
                const result = await axios.get(gistUrl);
                new Promise(async (_, __) => await banAllBots(result.data, 0, channel));
        }

        if (message && message.startsWith("!")) {
                commandController.GetCommandName(
                        getCommandFromMessage,
                        getRestOfMessage,
                        tags,
                        channel
                );

                return;
        }
});

async function banAllBots(bots: any, index: number, ch: string) {
        if (!bots[index]) return;
	
        const bot = bots[index];
        if(typeof bot == "undefined") return;

        index++;

        await client.say(ch, `/ban ${bot} known malicious bot`).then(async () => {
                setTimeout(async () => {
                        await banAllBots(bots, index, ch);
                }, 3500);
        });
}

process.on('unhandledRejection', (err, promise) => {
	console.error(`Error: ${err}`);
});
