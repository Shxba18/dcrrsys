const { ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField } = require('discord.js');

async function sendClearChatMenu(message) {
    // Najdi všechny textové kanály, kde má uživatel právo mazat zprávy
    const channels = message.guild.channels.cache
        .filter(c =>
            c.type === 0 && // GUILD_TEXT
            c.permissionsFor(message.member).has(PermissionsBitField.Flags.ManageMessages)
        )
        .map(c => ({
            label: `#${c.name}`,
            value: c.id
        }));

    if (channels.length === 0) {
        await message.reply('Nemáš právo mazat zprávy v žádném kanálu.');
        return;
    }

    const menu = new StringSelectMenuBuilder()
        .setCustomId('clearchat_select_channel')
        .setPlaceholder('Vyber kanál pro vymazání zpráv')
        .addOptions(channels.slice(0, 25)); // Discord limit

    const row = new ActionRowBuilder().addComponents(menu);

    await message.reply({
        content: 'Vyber kanál, kde chceš vymazat posledních 100 zpráv:',
        components: [row],
        ephemeral: true
    });
}

async function handleClearChatInteraction(interaction) {
    if (
        interaction.isStringSelectMenu() &&
        interaction.customId === 'clearchat_select_channel'
    ) {
        const channelId = interaction.values[0];
        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel || channel.type !== 0) {
            await interaction.reply({ content: 'Kanál nenalezen nebo není textový.', ephemeral: true });
            return;
        }

        // Zkontroluj práva
        if (!channel.permissionsFor(interaction.member).has(PermissionsBitField.Flags.ManageMessages)) {
            await interaction.reply({ content: 'Nemáš právo mazat zprávy v tomto kanálu.', ephemeral: true });
            return;
        }

        // Smaž posledních 100 zpráv
        try {
            const messages = await channel.bulkDelete(100, true);
            await interaction.reply({ content: `✅ Vymazáno ${messages.size} zpráv v <#${channel.id}>.`, ephemeral: true });
        } catch (err) {
            await interaction.reply({ content: '❌ Nepodařilo se vymazat zprávy. Zprávy starší 14 dní nejdou smazat.', ephemeral: true });
        }
    }
}

module.exports = {
    sendClearChatMenu,
    handleClearChatInteraction
};