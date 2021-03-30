# Maximo Bot
![Repo size badge](https://img.shields.io/github/repo-size/gigili/maximo-bot?style=for-the-badge)
![Open issues badge](https://img.shields.io/github/issues/gigili/maximo-bot?style=for-the-badge)
![Licence badge](https://img.shields.io/github/license/gigili/maximo-bot?style=for-the-badge)

Twitch chatbot developed by [GacBL](https://twitch.tv/gacbl) and chat live over on Twitch.

## Commands

| Command    | Description    |
| :---------| :-------------|
| !add !{cmd} {output} --level {all\|sub\|mod\|broadcaster} | Add new command (Limited to mods and broadcaster) |
| !edit !{cmd} {output} --level {all\|sub\|mod\|broadcaster} | Edit existing command (Limited to mods and broadcaster) |
| !delete !{cmd} | Remove command (Limited to mods and broadcaster) |
| !alias !{cmd} !{alias} | Create an alias for an existing function |
| !rmalias !{alias} | Remove an existing alias |
| !hello | Welcomes the users who used the command |
| !wrongTip | Displays a random wrong developer tip |
| !dad | Displays a random dad joke |
| !chuck | Displays a random Chuck Norris developer joke |
| !lurk | Display a message to the user going into the lurk mode |
| !hug @username | Sends a virtual hug to the specified user |
| !yeet @username | Yeets the user into oblivion |

## Variables

| Variable | Output | Example |
| :---------| :-------------| :-------------|
| {toUser} | The user that was specified in the command | !hello @test => Hello there @test |
| {user} | The user who used the command | !test => this is a test @user |
