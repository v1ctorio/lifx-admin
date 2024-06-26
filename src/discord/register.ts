import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentType, DiscordAPIError, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { updateLanguageServiceSourceFile } from "typescript";
import { DatabaseClient } from "../db/redis.js";

export default async function register(commandI: ChatInputCommandInteraction, redis: DatabaseClient) {
    const loginEmbed = new EmbedBuilder()
        .setTitle("Log in with LIFX")
        .setDescription(
            `In order to login with LIFX, you'll need to give your lifx cloud token. This token has the capacity to control your lights and retrieve information about them. NO private information.`
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

    const loginEmbedActionsRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("login")
                .setLabel("Login")
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
        .setTitle("Login with lifx")
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
            content: "Registered into LIFX bot successfully",
            components: []});
        modal.reply({
            content: modal.user.username +" you have been registered into LIFX bot successfully",
            ephemeral: true
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