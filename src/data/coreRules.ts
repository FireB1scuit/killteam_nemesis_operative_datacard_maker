/** A rule printed as "**Name:** text" and/or followed by bullet points. */
export type RuleBlock = { name: string; text?: string; bullets?: string[]; note?: string };

/** Core Nemesis rules, Dossier step 7 (Core rules), verbatim. */
export const CORE_RULES: RuleBlock[] = [
  {
    name: "Extra Defence",
    text: "Whenever an operative is shooting this operative, collect and roll one additional defence dice, unless this operative is injured.",
  },
  {
    name: "Bulky",
    bullets: [
      "This operative cannot be placed on Vantage terrain higher than 2\" from the killzone floor.",
      "Whenever this operative would perform the Fight action, the distance requirements of its control range can be changed to 1\" horizontally and 4\" vertically until the end of that action.",
      "This operative can move through other operatives (excluding NEMESIS operatives).",
      "Ignore all changes to this operative’s APL and if it’s a player operative, APL changes don’t affect the 5AP you can spend per turning point.",
    ],
  },
  {
    name: "Towering Size",
    bullets: [
      "In the Firefight phase, whenever you determine this operative’s order, you cannot select Conceal.",
      "This operative cannot be in cover or obscured by Light terrain, terrain parts less than 3\" tall or terrain that’s not wholly intervening.",
      "Whenever another operative is performing the Shoot action, being within control range of other operatives doesn’t prevent this operative from being selected as a valid target. In other words, this operative can be shot while within control range of friendly operatives.",
      "This operative can move through terrain parts less than 2\" tall. It cannot move through Accessible terrain (excluding hatchways) unless that terrain is also less than 2\" tall.",
      "Whenever this operative would finish a move in a terrain feature less than 2\" tall, temporarily remove that terrain feature from the killzone, then return it when this operative leaves that location; if it’s an equipment terrain feature, remove it from the battle instead.",
    ],
  },
];

/** Card 1 reminders (app wording, summarising Dossier rules). */
export const REMINDER_NEMESIS = "Extra Defence, Bulky, Towering Size";
export const REMINDER_CONTROL = "Use this operative’s CONTROL stat instead of APL in all instances except spending action points.";

/** Card 2 block for a player operative (replaces the behaviour bar). Dossier steps 3 and 7. */
export const PLAYER_RESTRICTIONS: { title: string; effect: string; restrictions: string[] } = {
  title: "Player Nemesis Operative",
  effect: "You choose this operative’s order and actions. It can activate twice per turning point; activation restrictions and action point limits are detailed in the mission pack you are playing.",
  restrictions: [
    "It cannot perform mission actions or unique actions from equipment, except the Operate Hatch and Breach mission actions.",
    "It doesn’t gain a faction keyword, so it cannot be selected for your kill team’s faction rules that specify an operative with that faction keyword.",
  ],
};
