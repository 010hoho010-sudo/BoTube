const { SlashCommandBuilder } = require('discord.js');
const db = require('./database');
const { buildVideoEmbed, buildListEmbed } = require('./embeds');
const { buildVideoButtons } = require('./buttons');
const { getVideoType } = require('./utils');
const { searchYouTube } = require('./youtube');

// ==================== تعريف الأوامر (للتسجيل عند ديسكورد) ====================
const commandsData = [
  new SlashCommandBuilder()
    .setName('addvideo')
    .setDescription('إضافة فيديو جديد (يدوياً أو بالبحث التلقائي من يوتيوب)')
    .addStringOption(opt => opt.setName('title').setDescription('اسم الفيديو (يُستخدم أيضاً كنص بحث لو ما حطيت رابط)').setRequired(true))
    .addStringOption(opt => opt.setName('video_url').setDescription('رابط الفيديو (اتركه فاضي عشان يبحث تلقائياً في يوتيوب)').setRequired(false))
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
    let video_url = interaction.options.getString('video_url');
    let description = interaction.options.getString('description');
    let thumbnail = interaction.options.getString('thumbnail');
    let duration = interaction.options.getString('duration');
    const category = interaction.options.getString('category') || 'عام';

    // لو ما انحط رابط، نبحث تلقائياً في يوتيوب باستخدام العنوان
    if (!video_url) {
      await interaction.deferReply({ ephemeral: true }); // البحث ياخذ وقت، فنأجل الرد عشان ما ينتهي التفاعل

      let searchResult;
      try {
        searchResult = await searchYouTube(title);
      } catch (err) {
        return interaction.editReply({ content: `❌ ${err.message}` });
      }

      if (!searchResult) {
        return interaction.editReply({ content: `❌ ما لقيت نتائج في يوتيوب للعنوان "${title}". جرّب تحط الرابط يدوياً.` });
      }

      video_url = searchResult.video_url;
      description = description || searchResult.description;
      thumbnail = thumbnail || searchResult.thumbnail;
      duration = duration || searchResult.duration;
    }

    description = description || 'لا يوجد وصف';
    thumbnail = thumbnail || null;
    duration = duration || 'غير محدد';

    try {
      const stmt = db.prepare(`
        INSERT INTO videos (title, description, video_url, thumbnail, duration, category)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(title, description, video_url, thumbnail, duration, category);

      const successMsg = `✅ تم إضافة الفيديو **${title}** بنجاح.\n🔗 ${video_url}`;

      if (interaction.deferred) {
        await interaction.editReply({ content: successMsg });
      } else {
        await interaction.reply({ content: successMsg, ephemeral: true });
      }
    } catch (err) {
      const errorMsg = err.message.includes('UNIQUE')
        ? `⚠️ يوجد فيديو بنفس الاسم مسبقاً.`
        : `❌ حدث خطأ أثناء الإضافة.`;

      if (!err.message.includes('UNIQUE')) console.error(err);

      if (interaction.deferred) {
        await interaction.editReply({ content: errorMsg });
      } else {
        await interaction.reply({ content: errorMsg, ephemeral: true });
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

    // الرسالة الأولى: الـ Embed المعلوماتي + الأزرار
    await interaction.reply({ embeds: [embed], components: [buttons] });

    // الرسالة الثانية: الرابط الخام بمفرده — هذا اللي يخلي ديسكورد يشغّل معاينة الفيديو
    // (مشغل يوتيوب المدمج أو مشغل mp4) مباشرة تحت الرسالة، لأن الـ Embed العادي ما يقدر يشغّل فيديو داخله
    const videoType = getVideoType(video.video_url);
    if (videoType === 'youtube' || videoType === 'direct_file') {
      await interaction.followUp({ content: video.video_url });
    }
  }
}

module.exports = { commandsData, handleCommand };
