import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentType, DiscordAPIError, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { updateLanguageServiceSourceFile } from "typescript";

async function register(commandI: ChatInputCommandInteraction) {
    const loginEmbed = new EmbedBuilder()
        .setTitle("Log in with LIFX")
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
        time: 60000,
        filter: (interaction) => interaction.customId === "login" && interaction.user.id === commandI.user.id,
        onError: (error) => {
            if (error instanceof DiscordAPIError) {
                console.error(error);
            }
        },
        onTimeout: () => {
            commandI.editReply({
                content: "You took too long to click the button. Please try again.",
                components: []
            });
        },
        onCollect: async (interaction) => {
            await interaction.deferUpdate();
            await interaction.followUp("Please paste your token here.");
        }
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
        .setTitle("Login into lifx")
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
        updateToken(token, interaction.user.id); //TODO with db
        interaction.editReply({
            content: "Registered into LIFX bot successfully",
            components: []});
        })
        .catch((error) => {
            console.error(error);
            interaction.editReply({
                content: "You took too long to paste the token. Please try again.",
                components: []
            });
        }
        )


    })
    



}