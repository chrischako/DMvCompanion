export const newId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/** What kind of input a template field renders as. */
export type FieldType = 'text' | 'longtext' | 'number' | 'dots' | 'check' | 'dropdown' | 'list';

/**
 * One field in a template. `id` is the key under which a character's value is stored,
 * so keep it stable once characters exist. `options` is used by dropdown, `max` by dots.
 */
export interface Field {
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
  max?: number;
}

export interface Section {
  title: string;
  fields: Field[];
}

export interface Template {
  id: string;
  name: string;
  sections: Section[];
}

/** All values are strings: numbers "12", dots "3", checks "true", lists one item per line. */
export interface Character {
  id: string;
  name: string;
  templateId: string;
  values: Record<string, string>;
}

export type NoteKind = 'session' | 'npc' | 'location' | 'quest';

export interface Note {
  id: string;
  kind: NoteKind;
  title: string;
  body: string;
}

export interface Campaign {
  id: string;
  name: string;
  characters: Character[];
  notes: Note[];
}

export interface AppData {
  templates: Template[];
  campaigns: Campaign[];
}

export type Screen =
  | { name: 'home' }
  | { name: 'campaign'; campaignId: string }
  | { name: 'sheet'; campaignId: string; characterId: string }
  | { name: 'note'; campaignId: string; noteId: string };
