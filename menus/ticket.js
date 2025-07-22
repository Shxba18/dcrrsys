const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, StringSelectMenuBuilder } = require('discord.js');
const { createTicketPanelEmbed, createTicketEmbed, createTicketLogEmbed } = require('./embeds');
require('dotenv').config();

const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;
const LOG_CHANNEL_ID = process.env.TICKET_LOG_CHANNEL_ID;

// Dočasné úložiště voleb uživatele (v paměti procesu)
const userTicketChoices = {};

async function sendTicketPanel(channel) {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('open_ticket_menu')
            .setLabel('↦ OPEN TICKET HERE')
            .setStyle(ButtonStyle.Primary)
    );
    await channel.send({
        embeds: [createTicketPanelEmbed()],
        components: [row]
    });
}

async function handleTicketOpen(interaction, reason = 'neuvedeno', priority = 'neuvedeno') {
    const guild = interaction.guild;
    const user = interaction.user;

    // Prevent duplicate tickets
    const existing = guild.channels.cache.find(
        c => c.name === `ticket-${user.id}` && c.type === 0
    );
    if (existing) {
        return interaction.reply({ content: 'You already have an open ticket!', ephemeral: true });
    }

    // Create channel with permissions for user and staff
    const channel = await guild.channels.create({
        name: `ticket-${user.id}`,
        type: 0, // GUILD_TEXT
        permissionOverwrites: [
            {
                id: guild.roles.everyone,
                deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
                id: user.id,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ReadMessageHistory,
                ],
            },
            {
                id: STAFF_ROLE_ID,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ReadMessageHistory,
                ],
            }
        ],
    });

    // Send close button in ticket
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('🔒 Close Ticket')
            .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
        content: `<@${user.id}>`,
        embeds: [
            createTicketEmbed({
                user,
                reason: `↦ Důvod: **${reason}**\n↦ Závažnost: **${priority}**`,
                priority
            })
        ],
        components: [row]
    });

    await interaction.reply({ content: `✔ Your ticket has been created: ${channel}`, ephemeral: true });

    // Log ticket open
    if (LOG_CHANNEL_ID) {
        const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            logChannel.send({ embeds: [createTicketLogEmbed({ user, action: 'opened', channel })] });
        }
    }
}

// Handler na tlačítka a select menu pro ticket panel
async function handleTicketPanelButton(interaction) {
    // První klik na "Open Ticket"
    if (interaction.isButton() && interaction.customId === 'open_ticket_menu') {
        // Select menu pro typ problému
        const typeMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_type')
            .setPlaceholder('Vyber typ problému')
            .addOptions([
                { label: 'Technický problém', value: 'Technický problém', emoji: '🛠️' },
                { label: 'Nahlášení', value: 'Nahlášení', emoji: '🚨' },
                { label: 'Spolupráce', value: 'Spolupráce', emoji: '🤝' },
                { label: 'Ostatní', value: 'Ostatní', emoji: '💡' }
            ]);
        // Select menu pro závažnost
        const severityMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_severity')
            .setPlaceholder('Vyber závažnost')
            .addOptions([
                { label: 'Nízká', value: 'Nízká', emoji: '🟢' },
                { label: 'Střední', value: 'Střední', emoji: '🟡' },
                { label: 'Vysoká', value: 'Vysoká', emoji: '🔴' }
            ]);
        await interaction.reply({
            content: '**Typ problému:**\nVyber jednu možnost.\n\n**Závažnost:**\nVyber jednu možnost.',
            components: [
                new ActionRowBuilder().addComponents(typeMenu),
                new ActionRowBuilder().addComponents(severityMenu),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_ticket_final')
                        .setLabel('Vytvořit ticket')
                        .setStyle(ButtonStyle.Success)
                )
            ],
            ephemeral: true
        });
        userTicketChoices[interaction.user.id] = {};
        return;
    }

    // Výběr typu problému
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_type') {
        userTicketChoices[interaction.user.id] = userTicketChoices[interaction.user.id] || {};
        userTicketChoices[interaction.user.id].type = interaction.values[0];
        await interaction.reply({ content: `Zvolený typ: **${interaction.values[0]}**`, ephemeral: true });
        return;
    }

    // Výběr závažnosti
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_severity') {
        userTicketChoices[interaction.user.id] = userTicketChoices[interaction.user.id] || {};
        userTicketChoices[interaction.user.id].severity = interaction.values[0];
        await interaction.reply({ content: `Zvolená závažnost: **${interaction.values[0]}**`, ephemeral: true });
        return;
    }

    // Finální vytvoření ticketu
    if (interaction.isButton() && interaction.customId === 'create_ticket_final') {
        const choice = userTicketChoices[interaction.user.id];
        if (!choice?.type || !choice?.severity) {
            await interaction.reply({ content: 'Nejdříve vyber typ i závažnost!', ephemeral: true });
            return;
        }
        await handleTicketOpen(interaction, choice.type, choice.severity);
        delete userTicketChoices[interaction.user.id];
        return;
    }

    // Zavření ticketu
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        const channel = interaction.channel;
        if (!channel.name.startsWith('ticket-')) {
            await interaction.reply({ content: 'This is not a ticket channel!', ephemeral: true });
            return;
        }
        await interaction.reply({ content: 'Ticket will be deleted in 5 seconds...', ephemeral: true });

        // Log ticket close
        if (LOG_CHANNEL_ID) {
            const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                logChannel.send({ embeds: [createTicketLogEmbed({ user: interaction.user, action: 'closed', channel })] });
            }
        }

        setTimeout(() => {
            channel.delete().catch(() => {});
        }, 5000);
        return;
    }
}

module.exports = {
    sendTicketPanel,
    handleTicketOpen,
    handleTicketPanelButton
};