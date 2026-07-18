const { Client, GatewayIntentBits } = require('discord.js');
const { TOKEN } = require('./config');
const { registerEvents } = require('./events');
const { startHealthServer } = require('./health');
const { deployCommands } = require('./deploy-commands');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

registerEvents(client);
startHealthServer();

(async () => {
  await deployCommands();
  await client.login(TOKEN);
})();
