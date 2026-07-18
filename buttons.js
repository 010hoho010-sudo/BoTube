const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function buildVideoButtons(video) {
  const watchButton = new ButtonBuilder()
    .setLabel('▶️ مشاهدة')
    .setStyle(ButtonStyle.Link)
    .setURL(video.video_url);

  const copyButton = new ButtonBuilder()
    .setCustomId(`copy_link_${video.id}`)
    .setLabel('🔗 نسخ الرابط')
    .setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder().addComponents(watchButton, copyButton);
}

module.exports = { buildVideoButtons };
