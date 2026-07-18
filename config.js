require('dotenv').config();

module.exports = {
  TOKEN: process.env.DISCORD_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID || null, // اختياري: لو تبي الأوامر تظهر بسرعة في سيرفر معيّن وقت التطوير
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
};
