const { Client, GatewayIntentBits } = require('discord.js');
const { TOKEN } = require('./config');
const { registerEvents } = require('./events');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

registerEvents(client);

client.login(TOKEN);
