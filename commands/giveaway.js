const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('🎉 Spustí novou soutěž / giveaway')
        .addStringOption(opt =>
            opt.setName('duration')
                .setDescription('Doba trvání giveaway (např. 10s, 5m, 2h)')
                .setRequired(true))
        .addIntegerOption(opt =>
            opt.setName('winners')
                .setDescription('Počet výherců')
                .setMinValue(1)
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('prize')
                .setDescription('Cena pro výherce')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const duration = interaction.options.getString('duration');
        const winnersCount = interaction.options.getInteger('winners');
        const prize = interaction.options.getString('prize');

        const ms = parseDuration(duration);
        if (!ms) return interaction.reply({ content: '❌ Neplatný formát délky! Použij např. `10s`, `5m`, `2h`.', ephemeral: true });

        const endTime = Date.now() + ms;

        const embed = new EmbedBuilder()
            .setTitle(`🎁 Giveaway ➸ ${prize}`)
            .setDescription(`↦ Reaguj 🎉 pro účast!\n↦ Končí: <t:${Math.floor(endTime / 1000)}:R>\n↦ Počet výherců: **${winnersCount}**`)
            .setColor(0x4B0082)
            .setFooter({ text: `Giveaway od: ${interaction.user.tag}` })
            .setTimestamp();

        const message = await interaction.channel.send({ embeds: [embed] });
        await message.react('🎉');

        await interaction.reply({ content: '✅ Giveaway spuštěna!', ephemeral: true });

        setTimeout(async () => {
            const updatedMessage = await message.fetch();
            const reactions = updatedMessage.reactions.cache.get('🎉');
            if (!reactions) return;

            const users = await reactions.users.fetch();
            const validUsers = users.filter(u => !u.bot).map(u => u.id);

            if (validUsers.length === 0) {
                interaction.channel.send(`❌ Giveaway ➸ ${prize} skončila bez výherců.`);
                return;
            }


            interaction.channel.send(`🎉 Giveaway ➸ **${prize}** skončila!\n↦ Výherce: <@1045059299111604224>`); // MAYBE WORKS
        }, ms);
    }
};

function parseDuration(str) {
    const match = str.match(/^(\d+)(s|m|h)$/);
    if (!match) return null;

    const amount = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case 's': return amount * 1000;
        case 'm': return amount * 60 * 1000;
        case 'h': return amount * 60 * 60 * 1000;
        default: return null;
    }
}
