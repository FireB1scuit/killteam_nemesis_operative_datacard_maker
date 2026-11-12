export type BehaviourId = "brawler" | "battler" | "guardian" | "marksman";

/** One priority step: `action` is printed bold, `rest` follows it verbatim (may start with "."). */
export type PriorityStep = { action: string; rest: string };

export type BehaviourDef = {
  id: BehaviourId;
  name: string;
  /** Description + order rule, Dossier step 3 (Behaviour), verbatim. */
  text: string;
  priorities: PriorityStep[];
};

const POSITION =
  "If possible, to a location where there’s a valid target that isn’t obscured, if not, to a location that’s appropriate for the NPOs to better win the mission";

export const BEHAVIOURS: BehaviourDef[] = [
  {
    id: "brawler", name: "Brawler",
    text: "This NPO will move towards the enemy to fight them, but will seek cover on its way. When activated, if it’s a NEMESIS NPO or will perform the Fight or Charge action during that activation, give it an Engage order. Otherwise, give it a Conceal order.",
    priorities: [
      { action: "Fight", rest: "." },
      { action: "Charge", rest: " the closest player operative via the shortest possible route." },
      { action: "Reposition", rest: " towards the closest player operative, to cover if possible (a subsequent Dash action can fulfil this)." },
      { action: "Dash", rest: " towards the closest player operative, to cover if possible." },
    ],
  },
  {
    id: "battler", name: "Battler",
    text: "This NPO will move towards the enemy to fight them, but will seek cover on its way, and will shoot if the need arises. When activated, if it’s a NEMESIS NPO or will perform the Fight, Charge or Shoot action during that activation, give it an Engage order. Otherwise, give it a Conceal order.",
    priorities: [
      { action: "Fight", rest: "." },
      { action: "Charge", rest: " the closest player operative via the shortest possible route." },
      { action: "Reposition", rest: " towards the closest player operative, to cover if possible (a subsequent Dash action can fulfil this)." },
      { action: "Shoot", rest: "." },
      { action: "Dash", rest: " towards the closest player operative, to cover if possible." },
    ],
  },
  {
    id: "guardian", name: "Guardian",
    text: "This NPO will shoot the enemy as a priority, but will fight if the need arises. When activated, if it’s a NEMESIS NPO or will perform the Fight, Charge or Shoot action during that activation, give it an Engage order. Otherwise, give it a Conceal order.",
    priorities: [
      { action: "Fight", rest: "." },
      { action: "Shoot", rest: "." },
      { action: "Charge", rest: " the closest player operative that’s within 4\" of it via the shortest possible route." },
      { action: "Reposition", rest: `. ${POSITION} (a subsequent Dash action can fulfil these).` },
      { action: "Dash", rest: `. ${POSITION}.` },
    ],
  },
  {
    id: "marksman", name: "Marksman",
    text: "This NPO will move to an ideal position to shoot the enemy. When activated, if it’s a NEMESIS NPO or will perform the Shoot action during that activation, give it an Engage order. Otherwise, give it a Conceal order.",
    priorities: [
      { action: "Fall Back", rest: `. ${POSITION}.` },
      { action: "Shoot", rest: "." },
      { action: "Reposition", rest: `. ${POSITION} (a subsequent Dash action can fulfil these).` },
      { action: "Dash", rest: `. ${POSITION}.` },
    ],
  },
];

export const BEHAVIOUR_BY_ID = Object.fromEntries(BEHAVIOURS.map((b) => [b.id, b])) as Record<BehaviourId, BehaviourDef>;
export const BEHAVIOUR_IDS = BEHAVIOURS.map((b) => b.id) as [BehaviourId, ...BehaviourId[]];

/** App reminder printed as the action-bar restriction (app wording, not Dossier text). */
export const BEHAVIOUR_RESTRICTION = "Performs the first action it can from this list. If it can do none, it’s expended.";
