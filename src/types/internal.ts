import { light } from "./lifx";

export interface lightOwner {
   //todo lights: light[]
    id: string
    token: string
}
export interface discordAPIAutocompleteResponse {
    name: string
    value: string
}
type effect = 'breathe' | 'move' | 'morph' | 'flame' | 'pulse' | 'off'