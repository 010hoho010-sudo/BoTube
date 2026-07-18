const { SlashCommandBuilder } = require('discord.js');
const db = require('./database');
const { buildVideoEmbed, buildListEmbed } = require('./embeds');
const { buildVideoButtons } = require('./buttons');

// ==================== تعريف الأوامر (للتسجيل عند ديسكورد) ====================
const commandsData = [
  new SlashCommandBuilder()
    .setName('addvideo')
    .setDescription('إضافة فيديو جديد')
    .addStringOption(opt => opt.setName('title').setDescription('اسم الفيديو').setRequired(true))
    .addStringOption(opt => opt.setName('video_url').setDescription('رابط الفيديو').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('وصف الفيديو').setRequired(false))
    .addStringOption(opt => opt.setName('thumbnail').setDescription('رابط الصورة المصغرة').setRequired(false))
    .addStringOption(opt => opt.setName('duration').setDescription('مدة الفيديو (مثال: 12:30)').setRequired(false))
    .addStringOption(opt => opt.setName('category').setDescription('التصنيف').setRequired(false)),

  new SlashCommandBuilder()
    .setName('editvideo')
    .setDescription('تعديل بيانات فيديو موجود')
    .addStringOption(opt => opt.setName('title').setDescription('اسم الفيديو المراد تعديله').setRequired(true))
    .addStringOption(opt => opt.setName('new_video_url').setDescription('رابط فيديو جديد').setRequired(false))
    .addStringOption(opt => opt.setName('new_description').setDescription('وصف جديد').setRequired(false))
    .addStringOption(opt => opt.setName('new_thumbnail').setDescription('صورة مصغرة جديدة').setRequired(false))
    .addStringOption(opt => opt.setName('new_duration').setDescription('مدة جديدة').setRequired(false))
    .addStringOption(opt => opt.setName('new_category').setDescription('تصنيف جديد').setRequired(false)),

  new SlashCommandBuilder()
    .setName('deletevideo')
    .setDescription('حذف فيديو')
    .addStringOption(opt => opt.setName('title').setDescription('اسم الفيديو المراد حذفه').setRequired(true)),

  new SlashCommandBuilder()
    .setName('listvideos')
    .setDescription('عرض جميع الفيديوهات المتوفرة'),

  new SlashCommandBuilder()
    .setName('video')
    .setDescription('عرض فيديو معيّن')
    .addStringOption(opt => opt.setName('title').setDescription('اسم الفيديو').setRequired(true)),
].map(cmd => cmd.toJSON());

// ==================== منطق تنفيذ كل أمر ====================
async function handleCommand(interaction) {
  const { commandName } = interaction;

  if (commandName === 'addvideo') {
    const title = interaction.options.getString('title');
    const video_url = interaction.options.getString('video_url');
    const description = interaction.options.getString('description') || 'لا يوجد وصف';
    const thumbnail = interaction.options.getString('thumbnail') || null;
    const duration = interaction.options.getString('duration') || 'غير محدد';
    const category = interaction.options.getString('category') || 'عام';

    try {
      const stmt = db.prepare(`
        INSERT INTO videos (title, description, video_url, thumbnail, duration, category)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(title, description, video_url, thumbnail, duration, category);
      await interaction.reply({ content: `✅ تم إضافة الفيديو **${title}** بنجاح.`, ephemeral: true });
    } catch (err) {
      if (err.message.includes('UNIQUE')) {
        await interaction.reply({ content: `⚠️ يوجد فيديو بنفس الاسم مسبقاً.`, ephemeral: true });
      } else {
        console.error(err);
        await interaction.reply({ content: `❌ حدث خطأ أثناء الإضافة.`, ephemeral: true });
      }
    }
  }

  else if (commandName === 'editvideo') {
    const title = interaction.options.getString('title');
    const existing = db.prepare('SELECT * FROM videos WHERE title = ?').get(title);

    if (!existing) {
      return interaction.reply({ content: `❌ لا يوجد فيديو بالاسم **${title}**.`, ephemeral: true });
    }

    const updated = {
      description: interaction.options.getString('new_description') || existing.description,
      video_url: interaction.options.getString('new_video_url') || existing.video_url,
      thumbnail: interaction.options.getString('new_thumbnail') || existing.thumbnail,
      duration: interaction.options.getString('new_duration') || existing.duration,
      category: interaction.options.getString('new_category') || existing.category,
    };

    db.prepare(`
      UPDATE videos
      SET description = ?, video_url = ?, thumbnail = ?, duration = ?, category = ?
      WHERE title = ?
    `).run(updated.description, updated.video_url, updated.thumbnail, updated.duration, updated.category, title);

    await interaction.reply({ content: `✅ تم تعديل الفيديو **${title}** بنجاح.`, ephemeral: true });
  }

  else if (commandName === 'deletevideo') {
    const title = interaction.options.getString('title');
    const result = db.prepare('DELETE FROM videos WHERE title = ?').run(title);

    if (result.changes === 0) {
      return interaction.reply({ content: `❌ لا يوجد فيديو بالاسم **${title}**.`, ephemeral: true });
    }
    await interaction.reply({ content: `🗑️ تم حذف الفيديو **${title}**.`, ephemeral: true });
  }

  else if (commandName === 'listvideos') {
    const videos = db.prepare('SELECT title, category FROM videos ORDER BY created_at DESC').all();

    if (videos.length === 0) {
      return interaction.reply({ content: `📭 لا توجد فيديوهات مضافة حالياً.`, ephemeral: true });
    }

    const embed = buildListEmbed(videos);
    await interaction.reply({ embeds: [embed] });
  }

  else if (commandName === 'video') {
    const title = interaction.options.getString('title');
    const video = db.prepare('SELECT * FROM videos WHERE title = ?').get(title);

    if (!video) {
      return interaction.reply({ content: `❌ لا يوجد فيديو بهذا الاسم. جرّب /listvideos لعرض القائمة.`, ephemeral: true });
    }

    const embed = buildVideoEmbed(video);
    const buttons = buildVideoButtons(video);
    await interaction.reply({ embeds: [embed], components: [buttons] });
  }
}

module.exports = { commandsData, handleCommand };
