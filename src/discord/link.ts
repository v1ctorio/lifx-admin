import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentType, DiscordAPIError, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { updateLanguageServiceSourceFile } from "typescript";
import { DatabaseClient } from "../db/redis.js";
import { LIFXAPIClient } from "../api/APIClient.js";

export default async function link(commandI: ChatInputCommandInteraction, redis: DatabaseClient, LIFX: LIFXAPIClient) {
    const loginEmbed = new EmbedBuilder()
        .setTitle("Link LIFX account")
        .setDescription(
            `In order to link your LIFX account, you'll need to give your lifx cloud token. This token has the capacity to control your lights and retrieve information about them. NO private information.`
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
                    'Click on the button "link" below and paste your token into the modal.',
            },
        ]);

    const loginEmbedActionsRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("login")
                .setLabel("link")
                .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
            new ButtonBuilder()
                .setURL("https://cloud.lifx.com/settings")
                .setLabel("Lifx cloud settings")
                .setStyle(ButtonStyle.Link)
        );


    const timeoutEmbed = new EmbedBuilder()
        .setTitle("Timeout")
        .setDescription("You took too long to click the button. Please run the command again.")
        .setColor("#FF0000");

    const response = await commandI.reply({
        embeds: [loginEmbed],
        components: [loginEmbedActionsRow]
    });
    const Bcollector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 120000,
        filter: (interaction) => interaction.customId === "login" && interaction.user.id === commandI.user.id,
        
    });
    Bcollector.on("end", collected => {
        if (collected.size === 0) {
            commandI.editReply({
                embeds: [timeoutEmbed],
                components: []
            });
        }
    });
    Bcollector.on("collect", async (interaction: ButtonInteraction) => {
        const loginmodal = new ModalBuilder()
        .setTitle("Link lifx account")
        .setCustomId("lifxloginmodal");

      const TokenInput = new TextInputBuilder()
        .setLabel("Token")
        .setCustomId("tokenInput")
        .setPlaceholder("Paste your token here")
        .setStyle(TextInputStyle.Short);

      const actionRow =
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          TokenInput
        );

      loginmodal.addComponents(actionRow);
      interaction.showModal(loginmodal);
      
      interaction.awaitModalSubmit({time:60000})
      .then(async (modal) => {
        const token = modal.fields.getTextInputValue("tokenInput");
        redis.ownerManager.registerOwner(interaction.user.id,token); //TODO with db
        interaction.editReply({
            content: "Validating your token and creating a cache of your lights...",
            components: []});
        modal.deferReply({
            ephemeral: false
        });
        const valid = await LIFX.validateToken(token);
        if (!valid) {
            modal.editReply({
                content: "Invalid token. Please try again.",
                components: []
            });
            return;
        }
        //TODO CREATE A CACHE OF LIGHTS AVIABLE ATM
        modal.editReply({
            content: "Token validated!",
            components: []
        });
        })
        .catch((error) => {
            console.error(error);
            commandI.editReply({
                content: "You took too long to paste the token. Please try again.",
                components: []
            });
        }
        )


    })
    



}