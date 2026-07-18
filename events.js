const { handleCommand } = require('./commands');
const db = require('./database');

function registerEvents(client) {
  client.once('ready', () => {
    console.log(`✅ البوت شغال باسم: ${client.user.tag}`);
  });

  client.on('interactionCreate', async (interaction) => {
    try {
      // ===== أوامر Slash =====
      if (interaction.isChatInputCommand()) {
        await handleCommand(interaction);
      }

      // ===== ضغطات الأزرار =====
      else if (interaction.isButton()) {
        if (interaction.customId.startsWith('copy_link_')) {
          const videoId = interaction.customId.replace('copy_link_', '');
          const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(videoId);

          if (!video) {
            return interaction.reply({ content: '❌ لم يتم العثور على الفيديو.', ephemeral: true });
          }

          await interaction.reply({
            content: `🔗 رابط الفيديو:\n${video.video_url}`,
            ephemeral: true,
          });
        }
      }
    } catch (err) {
      console.error('حدث خطأ:', err);
      if (interaction.isRepliable() && !interaction.replied) {
        await interaction.reply({ content: '❌ حدث خطأ غير متوقع.', ephemeral: true });
      }
    }
  });
}

module.exports = { registerEvents };
