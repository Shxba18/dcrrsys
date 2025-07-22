// === reactionroles.js ===
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ComponentType
} = require('discord.js');

let reactionRoleData = {};

// Hlavní příkaz !rr
async function handleReactionRolesSetup(message) {
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return message.reply('❌ Tento příkaz může použít pouze administrátor.');
  }

  reactionRoleData[message.author.id] = {
    step: 0,
    channel: null,
    embed: {
      title: '',
      description: '',
    },
    roles: []
  };

  const row = new ActionRowBuilder().addComponents(
    new ChannelSelectMenuBuilder()
      .setCustomId('rr_channel_select')
      .setPlaceholder('➤ Vyber kanál, kam se embed odešle')
      .addChannelTypes(0)
  );

  await message.reply({ content: '📥 Vyber kanál:', components: [row] });
}

// Zpracování interakcí
async function handleReactionRolesInteraction(interaction) {
  console.log('[INTERACTION]', interaction.customId);
  const userId = interaction.user.id;
  const data = reactionRoleData[userId];
  if (!data) return;

  if (interaction.customId === 'rr_channel_select') {
    try {
      data.channel = interaction.values[0];
      console.log(`[DEBUG] ${interaction.user.tag} vybral kanál: ${data.channel}`);

      const embed = new EmbedBuilder()
        .setTitle('Zadej název a popis embedu do chatu ve formátu:\n`název|popis`');

      await interaction.reply({
        content: '📝 Pošli název a popis embedu',
        embeds: [embed],
        ephemeral: true
      });

      data.step = 1;
    } catch (error) {
      console.error('❌ Chyba při zpracování rr_channel_select:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: '❌ Nastala chyba při výběru kanálu.',
          ephemeral: true
        });
      }
    }
  } else if (interaction.customId === 'rr_role_add') {
    try {
      const selectedRoles = interaction.values;
      data.roles.push(...selectedRoles);

      await interaction.reply({
        content: `✅ Přidány role: ${selectedRoles.map(id => `<@&${id}>`).join(', ')}`,
        ephemeral: true
      });
    } catch (error) {
      console.error('❌ Chyba při přidávání rolí:', error);
    }
  } else if (interaction.customId === 'rr_finish') {
    try {
      const targetChannel = interaction.client.channels.cache.get(data.channel);
      if (!targetChannel) {
        return interaction.reply({ content: '❌ Kanál nebyl nalezen.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle(data.embed.title)
        .setDescription(data.embed.description)
        .setColor(0x432b9e);

      const menu = new StringSelectMenuBuilder()
        .setCustomId('rr_select_roles')
        .setPlaceholder('➤ Vyber roli')
        .addOptions(
          data.roles.map(roleId => {
            const role = interaction.guild.roles.cache.get(roleId);
            return new StringSelectMenuOptionBuilder()
              .setLabel(role?.name || 'Neznámá role')
              .setValue(roleId);
          })
        );

      const row = new ActionRowBuilder().addComponents(menu);
      await targetChannel.send({ embeds: [embed], components: [row] });

      delete reactionRoleData[userId];
      await interaction.reply({ content: '✅ Panel úspěšně odeslán!', ephemeral: true });
    } catch (error) {
      console.error('❌ Chyba při dokončení reakčních rolí:', error);
    }
  } else if (interaction.customId === 'rr_select_roles') {
    try {
      const roleId = interaction.values[0];
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) return interaction.reply({ content: '❌ Role nenalezena.', ephemeral: true });

      const member = interaction.guild.members.cache.get(interaction.user.id);

      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
        return interaction.reply({
          content: `❌ Role **${role.name}** byla odebrána.`,
          ephemeral: true
        });
      } else {
        await member.roles.add(roleId);
        return interaction.reply({
          content: `✅ Role **${role.name}** byla přidána.`,
          ephemeral: true
        });
      }
    } catch (error) {
      console.error('❌ Chyba při přidávání/odebírání role:', error);
    }
  }
}

// Textová zpráva pro embed setup
async function handleReactionRolesMessage(message) {
  const userId = message.author.id;
  const data = reactionRoleData[userId];
  if (!data || data.step !== 1) return;

  const parts = message.content.split('|');
  if (parts.length !== 2) {
    return message.reply('❌ Zadej text ve formátu `název|popis`.');
  }

  data.embed.title = parts[0].trim();
  data.embed.description = parts[1].trim();

  const roleOptions = message.guild.roles.cache
    .filter(role => role.editable && role.id !== message.guild.id)
    .map(role => new StringSelectMenuOptionBuilder().setLabel(role.name).setValue(role.id));

  const roleMenu = new StringSelectMenuBuilder()
    .setCustomId('rr_role_add')
    .setPlaceholder('➤ Vyber role k přidání')
    .setMinValues(1)
    .setMaxValues(Math.min(25, roleOptions.length))
    .addOptions(roleOptions);

  const row = new ActionRowBuilder().addComponents(roleMenu);

  const finishButton = new ButtonBuilder()
    .setCustomId('rr_finish')
    .setLabel('✅ Odeslat panel')
    .setStyle(ButtonStyle.Success);

  const buttonRow = new ActionRowBuilder().addComponents(finishButton);

  await message.reply({
    content: '🎭 Vyber role, které se mají použít:',
    components: [row, buttonRow]
  });

  data.step = 2;
}

module.exports = {
  handleReactionRolesSetup,
  handleReactionRolesInteraction,
  handleReactionRolesMessage
};