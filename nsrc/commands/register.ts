import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentType, DiscordAPIError, EmbedBuilder } from "discord.js";

async function register(commandI: ChatInputCommandInteraction) {
    const loginEmbed = new EmbedBuilder()
        .setTitle( "Log in with LIFX")
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
        filter: (interaction) => interaction.customId === "login"  && interaction.user.id === commandI.user.id,
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
    })
    Bcollector.on("end",collected=> {
        if (collected.size === 0) return commandI.editReply({
                                    embeds: [timeoutEmbed],
                                    components : []
                                    })
    });
    

}