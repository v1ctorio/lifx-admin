import { AutocompleteInteraction } from "discord.js";
import { DatabaseClient } from "../db/redis";
import { LIFXAPIClient } from "../api/APIClient";
import { lightOwner } from "../types/internal";
import { light } from "../types/lifx";

export async function handleAutocomplete(AInteraction: AutocompleteInteraction, redis: DatabaseClient, lifx: LIFXAPIClient) {
    const owner = await redis.ownerManager.loadOwner(AInteraction.user.id);
    if (owner === `not_registered`) {
        // AInteraction.respond({ content });
        return;
    }
    console.log({owner})
    const lights = await redis.retriveLights(owner,lifx);
    if (!lights) return;
    const selectors = [{name:'all',value:'all'}]

    console.log({lights})
    lights.map((light) => {
        selectors.push( {
            name: light.label,
            value: 'id:'+light.id,
        });
        }
    )

    console.log(selectors)
    const focused = AInteraction.options.getFocused().toLowerCase();
    const filtered = selectors.filter((s) => s.name.toLowerCase().startsWith(focused));

    console.log({filtered})
    AInteraction.respond(filtered)

}
