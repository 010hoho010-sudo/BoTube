const { EmbedBuilder } = require('discord.js');

function buildVideoEmbed(video) {
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`🎬 ${video.title}`)
    .setDescription(`📝 ${video.description}`)
    .addFields(
      { name: '⏱️ المدة', value: video.duration || 'غير محدد', inline: true },
      { name: '📂 التصنيف', value: video.category || 'عام', inline: true }
    )
    .setFooter({ text: 'VideoBot' })
    .setTimestamp();

  if (video.thumbnail) {
    embed.setImage(video.thumbnail);
  }

  return embed;
}

function buildListEmbed(videos) {
  const list = videos
    .map((v, i) => `${i + 1}. **${v.title}** — \`${v.category}\``)
    .join('\n');

  return new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle('📚 قائمة الفيديوهات')
    .setDescription(list)
    .setFooter({ text: `العدد الكلي: ${videos.length}` })
    .setTimestamp();
}

module.exports = { buildVideoEmbed, buildListEmbed };
