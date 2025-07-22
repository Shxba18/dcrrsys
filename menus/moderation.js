const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const { createModerationEmbed } = require('./embeds');

// Panel s tlačítky
function createModPanelEmbed(targetUser) {
    return {
        embeds: [
            {
                title: '🛡️ Moderation Panel',
                description: `Akce pro uživatele <@${targetUser.id}>`,
                color: 0xff5555
            }
        ],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`ban_${targetUser.id}`).setLabel('Ban').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId(`kick_${targetUser.id}`).setLabel('Kick').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId(`mute_${targetUser.id}`).setLabel('Mute').setStyle(ButtonStyle.Primary),
            )
        ]
    };
}

// Oprávnění
function hasModPerms(member) {
    return member.permissions.has(PermissionsBitField.Flags.BanMembers) ||
           member.permissions.has(PermissionsBitField.Flags.KickMembers) ||
           member.permissions.has(PermissionsBitField.Flags.ModerateMembers);
}

// Panel příkaz
async function sendModPanel(message) {
    const user = message.mentions.members.first();
    if (!user) return message.reply('Označ uživatele pro moderaci.');
    await message.channel.send(createModPanelEmbed(user.user));
}

// Handler pro tlačítka
async function handleModButton(interaction) {
    if (!hasModPerms(interaction.member)) return interaction.reply({ content: 'Nemáš oprávnění.', ephemeral: true });

    const [action, userId] = interaction.customId.split('_');
    const guild = interaction.guild;
    const target = await guild.members.fetch(userId).catch(() => null);
    if (!target) return interaction.reply({ content: 'Uživatel nenalezen.', ephemeral: true });

    let reason = 'Bez udání důvodu.';
    let duration = 10; // default mute 10 minut

    if (action === 'ban') {
        if (!target.bannable) return interaction.reply({ content: 'Tohoto uživatele nemohu zabanovat.', ephemeral: true });
        await target.ban({ reason });
        await interaction.reply({ embeds: [createModerationEmbed({
            title: 'Uživatel zabanován',
            description: `<@${target.id}> byl zabanován.`,
            moderator: interaction.user.tag,
            target: target.user.tag,
            action: 'Ban',
            reason,
            thumbnail: target.user.displayAvatarURL()
        })] });
    }
    if (action === 'kick') {
        if (!target.kickable) return interaction.reply({ content: 'Tohoto uživatele nemohu kicknout.', ephemeral: true });
        await target.kick(reason);
        await interaction.reply({ embeds: [createModerationEmbed({
            title: 'Uživatel kicknut',
            description: `<@${target.id}> byl kicknut.`,
            moderator: interaction.user.tag,
            target: target.user.tag,
            action: 'Kick',
            reason,
            thumbnail: target.user.displayAvatarURL()
        })] });
    }
    if (action === 'mute') {
        if (!target.moderatable) return interaction.reply({ content: 'Tohoto uživatele nemohu mutnout.', ephemeral: true });
        await target.timeout(duration * 60 * 1000, reason);
        await interaction.reply({ embeds: [createModerationEmbed({
            title: 'Uživatel mutnut',
            description: `<@${target.id}> byl mutnut na ${duration} minut.`,
            moderator: interaction.user.tag,
            target: target.user.tag,
            action: 'Mute',
            reason,
            thumbnail: target.user.displayAvatarURL()
        })] });
    }}

module.exports = {
    sendModPanel,
    handleModButton
};