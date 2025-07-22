const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require('discord.js');
const { handleBotStatusCommand } = require('./commands/botstatus');
const { handleTicketOpen, handleTicketClose, sendTicketPanel, handleTicketPanelButton } = require('./menus/ticket');
const { sendModPanel, handleModButton } = require('./menus/moderation');
const { handleReactionRolesSetup, handleReactionRolesInteraction, handleReactionRolesMessage } = require('./menus/reactionroles');
const { sendSubscriptionPanel } = require('./menus/subscription');
const { sendClearChatMenu, handleClearChatInteraction } = require('./menus/clearchat');
const connectToDatabase = require('./database');
connectToDatabase();
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// ➸ Slash příkazy
client.commands = new Collection();
const slashCommands = [];

// ➸ Zaregistruj slash příkazy
client.once(Events.ClientReady, async () => {
    console.log(`✅ Přihlášen jako ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        console.log('🔄 Registruji slash příkazy...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: slashCommands }
        );
        console.log('✅ Slash příkazy úspěšně nahrány!');
    } catch (err) {
        console.error('❌ Chyba při registraci příkazů:', err);
    }
});

// ➸ Textové příkazy (!ticketpanel, !info, ...)
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // 📥 Embed a role krok pro reakční role
    await handleReactionRolesMessage(message);

    if (message.content === '!ticketpanel') {
        await sendTicketPanel(message.channel);
        return message.reply('➸ Ticket panel odeslán.');
    }

    if (message.content.startsWith('!rr')) {
        await handleReactionRolesSetup(message);
        return;
    }

    if (message.content === '!subscription') {
        await sendSubscriptionPanel(message.channel);
        return message.reply('➸ Subscribe panel odeslán.');
    }

    if (message.content.startsWith('!avatar')) {
        const args = message.content.slice('!avatar'.length).trim().split(/ +/);
        const avatarCommand = require('./commands/avatar');
        await avatarCommand.execute(message, args);
        return;
    }

    if (message.content.startsWith('!botstatus')) {
        const args = message.content.slice('!botstatus'.length).trim().split(/ +/);
        await handleBotStatusCommand(message, args);
        return;
    }

    if (message.content.startsWith('!dev')) {
        const args = message.content.slice('!dev'.length).trim().split(/ +/);
        const developerCommand = require('./commands/developer');
        await developerCommand.execute(message, args);
        return;
    }

    if (message.content.startsWith('!rep')) {
        const args = message.content.slice('!rep'.length).trim().split(/ +/);
        const repCommand = require('./commands/reputation');
        await repCommand.execute(message, args);
        return;
    }

    if (message.content === '!help') {
        const helpCommand = require('./commands/help');
        await helpCommand.execute(message);
        return;
    }

    if (message.content === '!clearchat') {
        await sendClearChatMenu(message);
        return;
    }

    if (message.content.startsWith('!modpanel')) {
        await sendModPanel(message);
        return;
    }
});

// ➸ Slash příkazy a interakce
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction, client);
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ Chyba při provádění příkazu.', ephemeral: true });
        }
    }

    // ➸ Giveaway tlačítko
    if (interaction.isButton() && interaction.customId === 'create_giveaway_button') {
        const command = client.commands.get('giveaway');
        if (command) {
            await interaction.reply({ content: '↦ Použij příkaz `/giveaway vytvor` pro vytvoření soutěže.', ephemeral: true });
        }
        return;
    }

    // ➸ Ticket systém
    if (
        (interaction.isButton() && (
            interaction.customId === 'open_ticket_menu' ||
            interaction.customId === 'create_ticket_final' ||
            interaction.customId === 'close_ticket'
        )) ||
        (interaction.isStringSelectMenu() && (
            interaction.customId === 'ticket_type' ||
            interaction.customId === 'ticket_severity'
        ))
    ) {
        await handleTicketPanelButton(interaction);
        return;
    }

    // ➸ Reakční role
    if (
        (interaction.isStringSelectMenu() && interaction.customId.startsWith('rr_')) ||
        (interaction.isButton() && interaction.customId.startsWith('rr_'))
    ) {
        await handleReactionRolesInteraction(interaction);
        return;
    }

    // ➸ Clear chat
    if (
        interaction.isStringSelectMenu() &&
        interaction.customId === 'clearchat_select_channel'
    ) {
        await handleClearChatInteraction(interaction);
        return;
    }

    // ➸ Moderace tlačítka
    if (interaction.isButton() && (
        interaction.customId.startsWith('ban_') ||
        interaction.customId.startsWith('kick_') ||
        interaction.customId.startsWith('mute_') ||
        interaction.customId.startsWith('warn_')
    )) {
        await handleModButton(interaction);
        return;
    }
});

client.login(process.env.TOKEN);
