import type { Field, Template } from './model';

/** Built-in starter templates. They are only the initial content: once saved, they are editable data. */

const id = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const text = (label: string): Field => ({ id: id(label), label, type: 'text' });
const long = (label: string): Field => ({ id: id(label), label, type: 'longtext' });
const num = (label: string): Field => ({ id: id(label), label, type: 'number' });
const dots = (label: string, max = 5): Field => ({ id: id(label), label, type: 'dots', max });
const check = (label: string): Field => ({ id: id(label), label, type: 'check' });
const list = (label: string): Field => ({ id: id(label), label, type: 'list' });
const pick = (label: string, ...options: string[]): Field => ({
  id: id(label),
  label,
  type: 'dropdown',
  options,
});

export const dnd5e = (): Template => ({
  id: 'dnd5e',
  name: 'D&D 5e',
  sections: [
    {
      title: 'Basics',
      fields: [
        text('Class'),
        text('Race'),
        text('Background'),
        num('Level'),
        num('XP'),
        pick(
          'Alignment',
          'Lawful Good', 'Neutral Good', 'Chaotic Good',
          'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
          'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
        ),
      ],
    },
    {
      title: 'Combat',
      fields: [
        num('AC'), num('Max HP'), num('Current HP'), num('Temp HP'),
        num('Speed'), num('Initiative'), check('Inspiration'),
      ],
    },
    {
      title: 'Abilities',
      fields: [num('STR'), num('DEX'), num('CON'), num('INT'), num('WIS'), num('CHA')],
    },
    {
      title: 'Proficiencies',
      fields: [list('Saving throws'), list('Skills'), list('Languages and tools')],
    },
    {
      title: 'Attacks and spells',
      fields: [
        list('Attacks'), list('Cantrips'), list('Spells'),
        num('Spell save DC'), num('Spell attack bonus'),
      ],
    },
    {
      title: 'Gear',
      fields: [list('Inventory'), num('Gold'), list('Features and traits')],
    },
    { title: 'Story', fields: [long('Backstory'), long('Notes')] },
  ],
});

export const vampire = (): Template => ({
  id: 'vtm5',
  name: 'Vampire: The Masquerade',
  sections: [
    {
      title: 'Basics',
      fields: [
        pick(
          'Clan',
          'Brujah', 'Gangrel', 'Malkavian', 'Nosferatu', 'Toreador', 'Tremere', 'Ventrue',
          'Banu Haqim', 'Hecata', 'Lasombra', 'The Ministry', 'Ravnos', 'Salubri',
          'Caitiff', 'Thin-blood',
        ),
        text('Predator type'), text('Concept'), text('Sire'), num('Generation'),
      ],
    },
    {
      title: 'Trackers',
      fields: [
        num('Health'), num('Willpower'),
        dots('Hunger', 5), dots('Humanity', 10), dots('Blood Potency', 5),
      ],
    },
    {
      title: 'Attributes',
      fields: [
        'Strength', 'Dexterity', 'Stamina',
        'Charisma', 'Manipulation', 'Composure',
        'Intelligence', 'Wits', 'Resolve',
      ].map((l) => dots(l)),
    },
    {
      title: 'Physical skills',
      fields: [
        'Athletics', 'Brawl', 'Craft', 'Driving', 'Firearms', 'Larceny', 'Melee', 'Stealth', 'Survival',
      ].map((l) => dots(l)),
    },
    {
      title: 'Social skills',
      fields: [
        'Animal Ken', 'Etiquette', 'Insight', 'Intimidation', 'Leadership',
        'Performance', 'Persuasion', 'Streetwise', 'Subterfuge',
      ].map((l) => dots(l)),
    },
    {
      title: 'Mental skills',
      fields: [
        'Academics', 'Awareness', 'Finance', 'Investigation', 'Medicine',
        'Occult', 'Politics', 'Science', 'Technology',
      ].map((l) => dots(l)),
    },
    {
      title: 'Powers and traits',
      fields: [list('Disciplines'), list('Merits and flaws'), list('Advantages and backgrounds')],
    },
    {
      title: 'Story',
      fields: [long('Chronicle tenets and convictions'), long('Backstory'), long('Notes')],
    },
  ],
});

export const starterTemplates = (): Template[] => [dnd5e(), vampire()];
