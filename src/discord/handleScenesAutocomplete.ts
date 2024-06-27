import { AutocompleteInteraction } from "discord.js";
import { DatabaseClient } from "../db/redis";
import { LIFXAPIClient } from "../api/APIClient";
import { discordAPIAutocompleteResponse, lightOwner } from "../types/internal";
import { light, scene } from "../types/lifx";

export async function handleSceneAutocomplete(AInteraction: AutocompleteInteraction, redis: DatabaseClient, lifx: LIFXAPIClient) {
    const owner = await redis.ownerManager.loadOwner(AInteraction.user.id);
    if (owner === `not_registered`) {
        // AInteraction.respond({ content });
        return;
    }
    console.log({owner})
    const s = await lifx.listScenes(owner);
    if (!s || s == 'error') return;
    const scenes:discordAPIAutocompleteResponse[] = []

    console.log({scenes: s})
    s.map((scn) => {
        scenes.push( {
            name: scn.name,
            value: scn.uuid,
        });
        }
    )

    console.log(s)
    const focused = AInteraction.options.getFocused().toLowerCase();
    const filtered = scenes.filter((s) => s.name.toLowerCase().startsWith(focused));

    console.log({filtered})
    AInteraction.respond(filtered)

}
