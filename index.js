const { Client, GatewayIntentBits } = require('discord.js');
const { TOKEN } = require('./config');
const { registerEvents } = require('./events');
const { startHealthServer } = require('./health');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

registerEvents(client);

startHealthServer();
client.login(TOKEN);
