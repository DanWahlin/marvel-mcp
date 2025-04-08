import { get_characters } from './get_characters/index.js';
import { get_character_by_id } from './get_character_by_id/index.js';
import { get_comics_for_character } from './get_comics_for_character/index.js';
import { get_comics } from './get_comics/index.js';
import { get_comic_by_id } from './get_comic_by_id/index.js';
import { get_characters_for_comic } from './get_characters_for_comic/index.js';

export const marvelTools = {
    get_characters,
    get_character_by_id,
    get_comics_for_character,
    get_comics,
    get_comic_by_id,
    get_characters_for_comic
};

export type ToolName = keyof typeof marvelTools;