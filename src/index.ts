import Discord from "discord.js";
import { config } from "dotenv";
import { createClient } from "redis";
import { light } from "./types";

config();

const { DISCORD_TOKEN } = process.env;
const LIGHTS_DATA: Map<String, {refreshedAt:number,data:light[]}> = new Map();

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
  if (interaction.isChatInputCommand()) {
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
      const owner =
        interaction.options.get("owner")?.user?.id ?? interaction.user.id;
      const raw = !!interaction.options.get("raw") ?? false;
      if (!hasUserAccess(interaction.user.id, owner)) {
        interaction.reply({
          content: "You don't have access to this user lights!",
          ephemeral: true,
        });
        return;
      }
      const lightsList = await listLights(owner, raw);
      if (!lightsList) {
        interaction.reply({
          content:
            "The owner has not logged in yet! </login:1125341801193156708>",
          ephemeral: true,
        });
        return;
      }
      interaction.reply({
        content: lightsList,
      });
    }
    if (interaction.commandName === "access") {
      let action: "add" | "revoke" = "add";
      switch (interaction.options.getSubcommand()) {
        case "give":
          action = "add";
          break;
        case "revoke":
          action = "revoke";
          break;
      }
      const target = interaction.options.get("target")?.user?.id || "";
      const hasTargetAccess = await hasUserAccess(target, interaction.user.id);
      if (target === interaction.user.id) {
        interaction.reply({
          content: "You can't manage your own access!",
          ephemeral: true,
        });
      } else if (!hasTargetAccess && action === "revoke") {
        interaction.reply({
          content: "This user doesn't have access to your lights!",
        });
      } else if (hasTargetAccess && action === "add") {
        interaction.reply({
          content: "This user already has access to your lights!",
        });
      } else {
        manageAccess(interaction.user.id, target, action);
        interaction.reply({
          content: `You have ${
            action === "add" ? "added" : "revoked"
          } access to ${target}!`,
        });
      }
    }
    if (interaction.commandName === "toogle") {
        const lightId = interaction.options.get("name")?.value;
        const selector = `id:${lightId}`;
        //TODO: manage other people lights
        const token = await loadToken(interaction.user.id);
        if (!token) {
            interaction.reply({
                content: "You have not logged in yet! </login:1125341801193156708>",
                ephemeral: true,
            });
            return;
        }
        const state = await toogleLight(token, selector);
        if (state === 'invalid_token') {
            interaction.reply({
                content: "Your token is invalid! </login:1125341801193156708>",
                ephemeral: true,
            });
            return;
        }
        if (state === 'off') {
            interaction.reply({
                content: `The light ${lightId} is now off!`,
            });
            return;
        }
        if (state === 'on') {
            interaction.reply({
                content: `The light ${lightId} is now on!`,
            });
            return;
        }
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
  if (interaction.isAutocomplete()){
    const lights = await getLights(interaction.user.id);
    if (lights && lights !== 'invalid_token') {
    const options = lights.map((light) => {
        return {
            name: light.label,
            value: light.id,
        };
        }
    );
    const focused = interaction.options.getFocused().toLowerCase();
    const filtered = options.filter((option) => option.name.toLowerCase().startsWith(focused));

    interaction.respond(filtered)


    }

  }
});

async function updateToken(userId: String, token: String) {
  await redisClient.set(`${userId}.token`, `${token}`);
}
async function loadToken(userId: String) {
  const token = await redisClient.get(`${userId}.token`);
  if (!token) return false;
  return token;
}
async function hasUserAccess(
  userId: string,
  ownerId: String
): Promise<boolean> {
  if (userId === ownerId) {
    return true;
  }
  const managers = await redisClient.sMembers(`${ownerId}.managers`);
  console.log(managers);
  if (managers.includes(userId)) {
    return true;
  }

  return false;
}
async function manageAccess(
  userId: String,
  targetId: String,
  action: "add" | "revoke"
) {
  if (action === "add") {
    await redisClient.sAdd(`${userId}.managers`, `${targetId}`);
  }
  if (action === "revoke") {
    await redisClient.sRem(`${userId}.managers`, `${targetId}`);
  }
}

async function listLights(ownerId: String, isRaw: boolean = false) {
  const res = await getLights(ownerId);
  console.log(res);

  if (!res) return `Owner is not logged in! </login:1125341801193156708>`;
  if (res === "invalid_token")
    return `Invalid token! </login:1125341801193156708>`;
  if (isRaw) {
    const rawJSON = "```json\n" + JSON.stringify(res) + "```";
    if (rawJSON.length > 2000) {
      return "The raw JSON is too long to be sent!";
    }
    return rawJSON;
  }
  const lightsList =
    "- " +
    res
      .map((light: any) => {
        return light.label;
      })
      .join("\n - ");
  return lightsList;
}

async function refreshCache(owner: String) {
  const token = await loadToken(owner);
  if (!token) return false;
  const req = await fetch("https://api.lifx.com/v1/lights/all", {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
    },
  });
  if (req.status === 401) {
    return "invalid_token";
  }
  LIGHTS_DATA.set(owner, {
    refreshedAt: Date.now(),
    data: await req.json(),
  });
}
async function getLights(owner: String) {
  const token = await loadToken(owner);
  if (!token) return false;
  let lights = LIGHTS_DATA.get(owner);

  if (!lights || lights.refreshedAt + 300000 < Date.now()) {
    const req = await fetch("https://api.lifx.com/v1/lights/all", {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
      },
    });

    if (req.status === 401) {
      return "invalid_token";
    }

    const JSON_req = await req.json();
    LIGHTS_DATA.set(owner, {
      refreshedAt: Date.now(),
      data: JSON_req,
    });
    lights = LIGHTS_DATA.get(owner);
  }
  return lights?.data;
}
//@TODO
async function toogleLight(token: String, selector: String): Promise<'on' | 'off' | 'invalid_token'> {
    const req = await fetch(`https://api.lifx.com/v1/lights/${selector}/toggle`, {
        method: 'POST',
        headers: {
            accept: 'application/json',
            authorization: `Bearer ${token}`,
        },
    });
    if (req.status === 401) {
        return 'invalid_token';
    }
    return (await req.json()).results[0].power;

}
client.login(DISCORD_TOKEN);
await redisClient.connect();
