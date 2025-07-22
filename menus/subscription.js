const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

async function sendSubscriptionPanel(channel) {
    const embed = new EmbedBuilder()
        .setTitle('BOT SUBSCRIPTION PANEL')
        .setColor(0x4B0082)
        .setImage('https://media.tenor.com/WIG0ro4UEYIAAAAd/lean-po-sum-mo.gif')
        .addFields(
            {
                name: '💜 #RRsys',
                value: '`PRICE 50€ - LIFETIME`\n- `REACTION ROLES SYSTEM`\n- `DEV SYSTEM`\n- `ADVANCED TICKET SYSTEM`\n- `MODERATION SYSTEM (ban, mute, kick, warn, etc.)`\n- `AND MORE FEATURES!`',
                inline: false
            }
        )
        .setFooter({ text: '©richdanny' })
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('buy subscription')
                .setStyle(ButtonStyle.Link) // Změna stylu na Link
                .setURL('https://paypal.me/starzdanny') // Zde vložte URL, na kterou chcete přesměrovat
                .setEmoji('🛒'),
        );

    await channel.send({ embeds: [embed], components: [row] });
}

module.exports = {
    sendSubscriptionPanel
};
