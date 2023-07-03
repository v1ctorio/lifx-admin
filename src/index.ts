import Discord from "discord.js";
import { config } from "dotenv";
import { createClient } from "redis";

config();

const { DISCORD_TOKEN } = process.env;

const client = new Discord.Client({
  intents: ["Guilds"],
});
const redisClient = createClient();

redisClient.on("error", (error) => {
    console.error(error);
});


client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on("messageCreate", (message) => {
    if (message.content === "!ping") {
        message.reply("pong");
    }
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        if (interaction.commandName === "login") {
            const embed = new Discord.EmbedBuilder()
            .setTitle("Login into lifix")
            .setDescription(
                `In order to login into lifix, you'll need to give your lifx cloud token.`
                )
                .setColor("#450098")
                .addFields([
                    {
                        name: "How to get your token?",
                        value:
                        'Go to [lifx cloud](https://cloud.lifx.com/settings), login and click on "Generate new token".',
                    },
                    {
                        name: "How to use the token?",
                        value:
                        'Click on the button "login" below and paste your token into the modal.',
          },
        ]);
        const actionrow = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
        .addComponents(
            new Discord.ButtonBuilder()
            .setCustomId("login")
            .setLabel("Login")
            .setStyle(Discord.ButtonStyle.Primary)
            )
            .addComponents(
          new Discord.ButtonBuilder()
          .setURL("https://cloud.lifx.com/settings")
            .setLabel("Lifx cloud settings")
            .setStyle(Discord.ButtonStyle.Link)
        );

        interaction.reply({
            embeds: [embed],
            components: [actionrow],
        });
    }
    if (interaction.commandName === "list") {
        const owner = interaction.options.get('owner')?.user?.id??interaction.user.id;
        const raw = !!interaction.options.get('raw')??false;
        if(!hasUserAccess(interaction.user.id, owner)) {
            interaction.reply({
                content: "You don't have access to this user lights!",
                ephemeral: true,
            });
            return;
        }
        const lightsList = await listLights(owner, raw);
        if (!lightsList) {
            interaction.reply({
                content: "The owner has not logged in yet! </login:1125341801193156708>",
                ephemeral: true,
            });
            return;
        }
        interaction.reply({
            content: lightsList,
        });
    }
  }
  if (interaction.isButton()) {
      if (interaction.customId === "login") {
          const modal = new Discord.ModalBuilder()
          .setTitle("Login into lifx")
          .setCustomId("lifxloginmodal");
          
          const TokenInput = new Discord.TextInputBuilder()
          .setLabel("Token")
          .setCustomId("tokenInput")
          .setPlaceholder("Paste your token here")
          .setStyle(Discord.TextInputStyle.Short);
          
          const actionRow =
          new Discord.ActionRowBuilder<Discord.TextInputBuilder>().addComponents(
              TokenInput
              );
              
              modal.addComponents(actionRow);
              interaction.showModal(modal);
            }
  }
  if (interaction.isModalSubmit()) {
      if (interaction.customId === "lifxloginmodal") {
          const token = interaction.fields.getTextInputValue("tokenInput");
          console.log(token);
          updateToken(interaction.user.id, token);
          interaction.reply({
              content: "You have successfully logged in/updated your token!",
              ephemeral: true,
            });
        }
    }
});


async function updateToken(userId: String, token: String) {
    await redisClient.set(`${userId}.token`,`${token}`);
}
async function loadToken(userId: String) {
    const token = await redisClient.get(`${userId}.token`);
    if (!token) return false;
    return token;
}
function hasUserAccess(userId: String, ownerId: String): boolean {
    if (userId === ownerId) {
        return true;
    }
    return false;
}
async function manageAccess(userId:String, targetId: String, action: 'add' | 'revoke') {

    if (action === 'add') {
        await redisClient.sAdd(`${userId}.managers`,`${targetId}`);
    }
    if (action === 'revoke') {
        await redisClient.sRem(`${userId}.access`,`${targetId}`);
    }

}

async function listLights(ownerId: String, isRaw: boolean = false) {
    const token = await loadToken(ownerId);
    if (!token) return false;
    console.log(token);

    const req = await fetch('https://api.lifx.com/v1/lights/all', {
        headers: {
            accept: 'application/json',
            authorization: `Bearer ${token}`,
        },
    })
    //if error 401, token is invalid
    if (req.status === 401) {
        return 'invalid lifx token';
    }
    const res = await req.json();
    if (isRaw) {
        const rawJSON = "```json\n"+(JSON.stringify(res))+"```"
        if (rawJSON.length > 2000) {
            return "The raw JSON is too long to be sent!";
        }
        return rawJSON;
    }
    const lightsList = "- "+res.map((light: any) => {
        return light.label;
    }
    ).join('\n - ');
    return lightsList;
}
//@TODO
async function toogleLight(token: String, selector: String) {

}
client.login(DISCORD_TOKEN);
await redisClient.connect();
