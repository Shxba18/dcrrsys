const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
require('dotenv').config(); // <- pokud máš .env

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[VAROVÁNÍ] Příkaz ${file} nemá 'data' nebo 'execute'!`);
  }
}

const rest = new REST().setToken(process.env.TOKEN);

// ❗️Uprav si následující dvě ID:
const CLIENT_ID = '1339906489732829246';
const GUILD_ID = '1339695673481625602'; // zatím zaregistrujeme jen na 1 serveru (rychlejší)

(async () => {
  try {
    console.log(`🔄 Nahrávám ${commands.length} slash příkaz(ů)...`);

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log('✅ Slash příkazy úspěšně nahrány!');
  } catch (error) {
    console.error(error);
  }
})();
