const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Zobrazí seznam dostupných příkazů',
  
  async execute(message) {
    const embed = new EmbedBuilder()
      .setColor(0x4B0082)
      .setTitle('ㅤ')
      .setImage('https://media.tenor.com/AfEysfVhY5IAAAAC/leanoshi.gif')
      .setDescription(
        '**➀ ADMIN\n**' +
        '`!ticketpanel` – shows ticket panel\n' +
        '`!clearchat` – menu for clearing chat\n' +
        '`!botstatus <text>` – changes bot status\n' +
        '`!modpanel` – opens moderation panel\n' +
        '**➁ DEV\n**' +
        '`!dev` – dev commands\n' +
        '**➂ MEMBERS\n**' +
        '`!avatar` – shows your avatar\n' +
        '`!rep` – reputation info\n' +
        '`!help` – this help message'
      )
      .setFooter({ text: '©richdanny', iconURL: message.client.user.displayAvatarURL() });

    await message.reply({ embeds: [embed] });
  }
};
