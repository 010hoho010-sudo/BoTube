const { REST, Routes } = require('discord.js');
const { TOKEN, CLIENT_ID, GUILD_ID } = require('./config');
const { commandsData } = require('./commands');

const rest = new REST({ version: '10' }).setToken(TOKEN);

// يقارن أمر محلي بأمر مسجل عند ديسكورد (الاسم + الوصف + الخيارات)
function isSameCommand(local, remote) {
  if (local.name !== remote.name) return false;
  if (local.description !== remote.description) return false;

  const localOptions = JSON.stringify(local.options || []);
  const remoteOptions = JSON.stringify(remote.options || []);
  return localOptions === remoteOptions;
}

// يتحقق هل الأوامر المحلية مطابقة تماماً (نفس العدد ونفس المحتوى) للمسجلة حالياً
function commandsMatch(localCommands, remoteCommands) {
  if (localCommands.length !== remoteCommands.length) return false;

  return localCommands.every((local) => {
    const remote = remoteCommands.find((r) => r.name === local.name);
    return remote && isSameCommand(local, remote);
  });
}

async function deployCommands() {
  try {
    const route = GUILD_ID
      ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
      : Routes.applicationCommands(CLIENT_ID);

    console.log('🔍 التحقق من الأوامر المسجلة حالياً...');
    const existingCommands = await rest.get(route);

    if (commandsMatch(commandsData, existingCommands)) {
      console.log(`✅ الأوامر مسجلة ومطابقة بالفعل (${existingCommands.length} أمر) — لا حاجة لإعادة التسجيل.`);
      return;
    }

    console.log(`⏳ الأوامر غير مطابقة أو غير مكتملة، جاري تسجيل ${commandsData.length} أمر...`);
    await rest.put(route, { body: commandsData });

    console.log(
      GUILD_ID
        ? '✅ تم تسجيل الأوامر في السيرفر المحدد بنجاح.'
        : '✅ تم تسجيل الأوامر عالمياً بنجاح.'
    );
  } catch (error) {
    console.error('❌ حدث خطأ أثناء تسجيل الأوامر:', error);
  }
}

// يسمح بتشغيل الملف مباشرة (node deploy-commands.js) بنفس الطريقة القديمة
if (require.main === module) {
  deployCommands();
}

module.exports = { deployCommands };
