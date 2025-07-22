const os = require('os');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'dev',
  description: 'Developer utility commands',
  async execute(message, args) {
    const sub = args[0];

    if (message.author.id !== '1045059299111604224') {
      return message.reply('❌ Tento příkaz může použít pouze developer bota.');
    }

    if (!sub) {
      return message.reply('❌ Usage: `!dev <eval|off|botinfo|serverinfo|memory|servers|reload|uptime>`');
    }

    if (sub === 'eval') {
      const code = args.slice(1).join(' ');
      if (!code) return message.reply('❌ Zadej kód k vyhodnocení.');
      try {
        let evaled = eval(code);
        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
        await message.reply(`📥 Input:\n\`\`\`js\n${evaled}\n\`\`\``);
      } catch (err) {
        await message.reply(`❌ Output:\n\`\`\`js\n${err}\n\`\`\``);
      }
    }

    else if (sub === 'off') {
      await message.reply('✦✦✦ Turning off');
      process.exit(0);
    }

    else if (sub === 'botinfo') {
      const embed = new EmbedBuilder()
        .setTitle('🤖 Bot Info')
        .setColor(0x4B0082)
        .addFields(
          { name: 'Ping', value: `${message.client.ws.ping}ms`, inline: true },
          { name: 'Serverů', value: `${message.client.guilds.cache.size}`, inline: true },
          { name: 'Uživatelů', value: `${message.client.users.cache.size}`, inline: true },
          { name: 'Platforma', value: `${os.platform()}`, inline: true },
          { name: 'Uptime', value: `${formatUptime(process.uptime())}`, inline: true }
        );

      return message.reply({ embeds: [embed] });
    }

    else if (sub === 'serverinfo') {
      const guild = message.guild;
      const embed = new EmbedBuilder()
        .setTitle(`🛡️ Server Info: ${guild.name}`)
        .setColor(0x4B0082)
        .addFields(
          { name: 'ID', value: guild.id, inline: false },
          { name: 'Členů', value: `${guild.memberCount}`, inline: false },
          { name: 'Vytvořen', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
          { name: 'Owner', value: `<@${guild.ownerId}>`, inline: false }
        );

      return message.reply({ embeds: [embed] });
    }

    else if (sub === 'memory') {
      const memoryUsage = process.memoryUsage();
      const embed = new EmbedBuilder()
        .setTitle('🧠 Memory Usage')
        .setColor(0x4B0082)
        .addFields(
          { name: 'RSS', value: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`, inline: true },
          { name: 'Heap Total', value: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`, inline: true },
          { name: 'Heap Used', value: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
        );
      return message.reply({ embeds: [embed] });
    }

    else if (sub === 'servers') {
      const serverList = message.client.guilds.cache.map(g => `${g.name} (${g.id})`).join('\n');
      return message.reply(`📋 Servery:\n\`\`\`\n${serverList}\n\`\`\``);
    }

    else if (sub === 'reload') {
      const commandName = args[1];
      if (!commandName) return message.reply('❌ Zadej název příkazu k reloadu.');

      const commandsPath = path.join(__dirname, '../textCommands');
      const commandPath = path.join(commandsPath, `${commandName}.js`);

      if (!fs.existsSync(commandPath)) {
        return message.reply('❌ Tento příkaz neexistuje.');
      }

      try {
        delete require.cache[require.resolve(commandPath)];
        const newCommand = require(commandPath);
        message.client.textCommands.set(newCommand.name, newCommand);
        return message.reply(`✅ Reloadnuto: \`${newCommand.name}\``);
      } catch (error) {
        return message.reply(`❌ Chyba při reloadu:\n\`\`\`js\n${error.message}\n\`\`\``);
      }
    }

    else if (sub === 'uptime') {
      return message.reply(`⏱️ Bot běží už: \`${formatUptime(process.uptime())}\``);
    }

    else {
      return message.reply('❌ Neznámý subpříkaz.');
    }
  }
};

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}
