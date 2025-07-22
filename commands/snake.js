const SnakeGame = require("snakecord");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "snake",
  description: "Play a snake game directly in Discord",
  cooldown: 300,
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks", "AddReactions", "ReadMessageHistory", "ManageMessages"],
  command: {
    enabled: false, // disable message commands
  },
  slashCommand: {
    enabled: true,
  },

  async interactionRun(interaction) {
    await interaction.reply({ content: "**Starting Snake Game**", ephemeral: false });
    await startSnakeGame(interaction);
  },
};

async function startSnakeGame(interaction) {
  const snakeGame = new SnakeGame({
    title: "Snake Game",
    color: "BLUE",
    timestamp: true,
    gameOverTitle: "Game Over",
  });

  await snakeGame.newGame(interaction);
}
