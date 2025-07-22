const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'Zobrazí avatar uživatele',
  
  async execute(message, args) {
    let user = message.mentions.users.first() || 
               (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null) || 
               message.author;

    if (!user) {
      return message.reply('❌ Nepodařilo se najít uživatele.');
    }

    const member = message.guild.members.cache.get(user.id);

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Avatar uživatele ➸ ${user.username}`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor('Random');

    if (member?.avatar) {
      embed.addFields({
        name: 'Server Avatar',
        value: `[Zobrazit ↦](${member.displayAvatarURL({ dynamic: true, size: 1024 })})`
      });
    }

    return message.reply({ embeds: [embed] });
  }
};
