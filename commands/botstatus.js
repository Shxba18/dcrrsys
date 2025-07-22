const { ActivityType } = require('discord.js');

async function handleBotStatusCommand(message, args) {
    if (message.author.id !== '1045059299111604224') {
        return message.reply('U dont have permission to use this command.');
    }

    const typeInput = args[0]?.toLowerCase();
    const activity = args.slice(1).join(' ');

    if (!typeInput || !activity) {
        return message.reply('❌ Použití: `!botstatus <playing|watching|listening> <aktivita>`');
    }

    const typeMap = {
        playing: ActivityType.Playing,
        watching: ActivityType.Watching,
        listening: ActivityType.Listening
    };

    const type = typeMap[typeInput];

    if (typeof type === 'undefined') {
        return message.reply('❌ Neplatný typ. Použij `playing`, `watching` nebo `listening`.');
    }

    try {
        await message.client.user.setPresence({
            activities: [{ name: activity, type }],
            status: 'dnd'
        });

        return message.reply(`✅ Status změněn na **${typeInput} ${activity}**`);
    } catch (err) {
        console.error('Chyba při nastavování presence:', err);
        return message.reply('❌ Nepodařilo se změnit status.');
    }
}

module.exports = {
    handleBotStatusCommand
};
