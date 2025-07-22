const { EmbedBuilder } = require('discord.js');

function createTicketPanelEmbed() {
    return new EmbedBuilder()
        .setTitle('**✚** Ticket Menu **✚**')
        .setDescription(
            '↦ Here you can choose what problem do you have.\n\n' +
            '↦ After you choose your problem, you will be able to select severity of your problem.\n\n'
        )
        .setColor('#732aee');
}

function createTicketEmbed({ user, reason, priority }) {
    // Výběr barvy podle závažnosti
    let color = '#55ff55'; // default
    if (priority === 'Vysoká') color = '#b91010';
    else if (priority === 'Střední') color = '#f8f211';
    else if (priority === 'Nízká') color = '#11f83e';

    return new EmbedBuilder()
        .setTitle('Your Ticket has been created successfully!')
        .setDescription(`↦ Ticket opened by <@${user.id}>`)
        .addFields(
            { name: '➸ Důvod a důležitost', value: reason || 'neuvedeno' }
        )
        .setColor(color)
        .setFooter({ text: '↦ Nebojte se náš Tým byl již upozorněn o vašem Ticketu' })
        .setTimestamp();
}

function createTicketLogEmbed({ user, action, channel }) {
    return new EmbedBuilder()
        .setTitle('📝 Ticket Log')
        .setDescription(`Ticket ${action} by <@${user.id}>`)
        .addFields(
            { name: 'Channel', value: channel ? `<#${channel.id}>` : 'N/A', inline: true }
        )
        .setColor(action === 'opened' ? '#55ff55' : '#ff5555')
        .setTimestamp();
}

module.exports = {
    createTicketPanelEmbed,
    createTicketEmbed,
    createTicketLogEmbed
};