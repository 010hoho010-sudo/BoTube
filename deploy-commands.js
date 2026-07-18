const { REST, Routes } = require('discord.js');
const { TOKEN, CLIENT_ID, GUILD_ID } = require('./config');
const { commandsData } = require('./commands');

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log(`⏳ بدء تسجيل ${commandsData.length} أمر...`);

    if (GUILD_ID) {
      // تسجيل سريع في سيرفر واحد فقط (مفيد وقت التطوير)
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commandsData }
      );
      console.log('✅ تم تسجيل الأوامر في السيرفر المحدد بنجاح.');
    } else {
      // تسجيل عام (يظهر في كل السيرفرات، قد يأخذ حتى ساعة للظهور)
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commandsData }
      );
      console.log('✅ تم تسجيل الأوامر عالمياً بنجاح.');
    }
  } catch (error) {
    console.error('❌ حدث خطأ أثناء تسجيل الأوامر:', error);
  }
})();
