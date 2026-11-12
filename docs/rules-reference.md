# Nemesis Operative Rules Reference

Everything needed to build the app, in one place. **You should not need to open the PDFs in `reference/`.**

- **This file**: every rule written out, how to calculate the card, the card format, and the test cases.
- **[`rules-data.json`](rules-data.json)**: the same rules data in machine-readable form. Copy it into `src/data/` (or import it directly). The tables below are generated from it, so the two always agree.
- **[`../plan.md`](../plan.md)**: app scope, architecture and milestones. **[`mockups/`](mockups/)**: target visuals.

Sources: *Kill Team – Nemesis Operatives Dossier* pp.14–20 (builder) and pp.24–31 (examples). The official allegiance, nemesis-trait and behaviour cards (scans in `reference/Nemesis cards1-4`). *Kill Team 2024 Core Rules* p.48 (datacard format). *Kill Team Lite Rules [2025-07]* (weapon rules).

---

## 1. The builder, step by step (Dossier p.14)

"Each NEMESIS operative needs two blank datacards to record its rules." The steps, in order:

1. **Allegiance**: select one allegiance keyword and add it to the datacard: AELDARI, CHAOS, IMPERIUM, LEAGUES OF VOTANN, NECRON, ORK, T'AU EMPIRE, TYRANID. "Other operatives that don't share that keyword cannot be used in the same kill team as it." Each allegiance gives one **allegiance trait** (§4).
2. **Size**: Small / Medium / Large. Sets the starting stats and how many weapons it can have (§2). "The bigger the operative's size, the more powerful it is, so less operatives will be used alongside it."
3. **Behaviour (NPO only)**: one of Brawler, Battler, Guardian, Marksman (§6). Player operatives have no behaviour.
4. **Weapons**: up to the size's number of selections (§7). "Weapons with the Selection x weapon rule count as x selections instead. Any selections you don't use grant you an extra nemesis trait selection in the Traits step." "You cannot select weapons that aren't representative of weapons the operative has … The operative cannot use weapons that aren't selected for its datacard (e.g. it cannot use grenades from universal equipment)." If a weapon isn't listed, "simply use the one that feels most appropriate". The *Alternatives* column lists the weapons each entry can stand in for.
5. **Traits**: the allegiance trait (automatic) + **1 nemesis trait**, + 1 extra for each unused weapon selection. "You cannot select a nemesis trait the operative already has." "These rules are written from the perspective of the NEMESIS operative being friendly. If it's being created as an enemy operative (e.g. an NPO), the rule should be used from the perspective of the NPOs."
6. **Name**: "the name of the miniature it is or represents. You can also designate it a suitable moniker, tag or call sign, to evoke its background or (in)famous deeds." Example: name *Armoured Sentinel*, moniker *‘Armourbane’*.
7. **Core rules**: every NEMESIS operative has Extra Defence, Bulky and Towering Size (§5).

## 2. Sizes

| Size | Control | Move | Save | Wounds | Weapon selections | Typical base (from the examples) |
|---|---|---|---|---|---|---|
| Small (S) | 4 | 6" | 4+ | 35 | 2 | 50mm |
| Medium (M) | 5 | 6" | 4+ | 50 | 2 | 80mm |
| Large (L) | 6 | 6" | 4+ | 75 | 3 | 90mm |

**Control** (*verbatim*): Control is a new stat for NEMESIS operatives that's used for the APL stat in all instances except spending action points. For example, use it for determining control of markers, and for rules that compare a dice result to the operative's APL stat.

**Activation** (*verbatim*): NEMESIS operatives can activate twice per turning point, but activation restrictions and action point limits vary depending on if it's an NPO or player operative. This is detailed in the mission pack you are playing.

Bases: Unless the killzone map is designed for them, larger bases (in particular 100mm or more) can be awkward as there may be locations where the operative cannot be placed. Close quarters killzones (e.g. Killzone: Tomb World) aren't recommended for large NEMESIS operatives.
Presets for the picker: round 25, 28.5, 32, 40, 50, 60, 80, 90, 100, 130, 160 mm; oval 60x35, 75x42, 90x52, 105x70, 120x92, 150x95, 170x105 mm.

### Kill team size alongside the nemesis (info only, not printed)
| Normal kill team size | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
|---|---|---|---|---|---|---|---|---|---|---|
| with Small | 4 | 4 | 5 | 5 | 6 | 7 | 7 | 8 | 9 | 9 |
| with Medium | 3 | 3 | 4 | 4 | 5 | 5 | 6 | 6 | 7 | 7 |
| with Large | 2 | 2 | 2 | 3 | 3 | 3 | 4 | 4 | 4 | 5 |

## 3. Player operative vs NPO

| | Player operative | NPO (non-player operative) |
|---|---|---|
| Card header tag | `NEMESIS` | `NEMESIS · NPO` |
| Behaviour | none, the player chooses orders and actions | required; dictates order + actions |
| Mission actions | only **Operate Hatch** and **Breach**; no unique actions from equipment | Operate Hatch and Breach where needed to fulfil its behaviour |
| Activation limits (mission pack) | Activate your friendly NEMESIS operative twice per turning point, but not a second time until all other friendly operatives are expended. It cannot move more than 12" per turning point and you cannot spend more than 5AP for it in total per turning point. (Joint Ops / Nemesis Ops mission packs.) | A NEMESIS NPO is activated by NPO activation cards, which set its APL (2 or 3) for that activation. It cannot activate more than twice per turning point, and it cannot move more than 12" per turning point. (Joint Ops mission pack.) |
| Faction keyword | does not gain one; can't be picked for kill team faction rules | – |

Player text (*Dossier p.15, condensed*): If the operative is a player operative, you can choose its order and actions (other than Operate Hatch and Breach, it cannot perform mission actions or unique actions from equipment). When a NEMESIS is a player operative, it doesn't gain a faction keyword. NEMESIS operatives can perform the Operate Hatch and Breach mission actions, and NEMESIS NPOs will do so where necessary to fulfil their behaviour.
Behaviour general rule: Whenever an NPO would perform an action, perform the first action it can do from its behaviour. If it cannot do any, it's expended.

## 4. Allegiance traits

**Print `cardText`** (the wording of the official allegiance card, which covers both NPO and friendly use). `bookText` is the Dossier p.19 table wording (friendly perspective), kept for reference.
The allegiance keyword is printed **first and in orange** in the card's keyword footer (where a normal datacard has its faction keyword).

### AELDARI: Arrogant Superiority
*No matter which strand of their ancient species the Aeldari hail from, all possess the ingrained belief in their own superiority over the galaxy's other peoples, founded on their athletic poise and effortless skill.*

**Card text:** Whenever an AELDARI NPO or friendly AELDARI NEMESIS operative is shooting against or fighting against a ready enemy operative, if two or more fails are rolled for it, one of them can be discarded to re-roll another.

**Book text:** Whenever this operative is shooting against or fighting against a ready enemy operative, if two or more fails are rolled for it, one of them can be discarded to re-roll another.

### CHAOS: Let the Galaxy Burn
*The conquest and destruction of all that their enemies value is a hallmark of those who worship the Dark Gods of Chaos, their festering bitterness and hatred leading them to acts of utter despoilation.*

**Card text:** Whenever a CHAOS NPO or friendly CHAOS NEMESIS operative is wholly within enemy territory, its weapons have the Balanced weapon rule.

**Book text:** Whenever this operative is wholly within enemy territory, its weapons have the Balanced weapon rule.

### IMPERIUM: Defenders of the Imperium
*Those who fight for Humanity are its shield: warriors who will not hesitate to lay down their lives in sacrifice if it means staving off Mankind's extinction for another day.*

**Card text:** Whenever an operative is shooting an IMPERIUM NPO or friendly IMPERIUM NEMESIS operative, if that IMPERIUM operative is wholly within its territory, one of its defence dice can be retained as a normal success without rolling it (in addition to a cover save, if any).

**Book text:** Whenever an operative is shooting this operative, if this operative is wholly within your territory, one of its defence dice can be retained as a normal success without rolling it (in addition to a cover save, if any).

### LEAGUES OF VOTANN: Acquisition at All Costs
*When a valuable prize claimed by their kindred is at stake, the Kin will leverage its seizure with all the efficient – and deadly – means at their disposal.*

**Card text:** Whenever a LEAGUES OF VOTANN NPO or friendly LEAGUES OF VOTANN NEMESIS operative is shooting against or fighting against an enemy operative that contests an objective marker, or an area of the killzone that determines victory (e.g. a flanks on pg 50), that LEAGUES OF VOTANN operative's weapons have the Balanced weapon rule.

**Book text:** Whenever this operative is shooting against or fighting against an enemy operative that contests an objective marker, or an area of the killzone that determines victor (e.g. flanks on pg 50), this operative's weapons have the Balanced weapon rule.

> Note: Card prints 'e.g. a flanks on pg 50' (pg 50 = Dossier Flanking Strike). Book table prints 'or and area'. Verbatim card text kept.

### NECRON: Living Metal
*The living metal of Necrons' bodies is capable of reknitting in a semi-sentient fashion. Wounds close and limbs reattach until the injured Necron shambles upright once more to take its revenge.*

**Card text:** In the Ready step of each Strategy phase, each NECRON NPO and friendly NECRON NEMESIS operative regains up to D3+1 lost wounds (roll separately for each).

**Book text:** In the Ready step of each Strategy phase, this operative regains up to D3+1 lost wounds.

### ORK: Waaagh!
*The infamous war cry of the Orks is known and feared throughout the galaxy. When these violent aliens are riled up with enthusiastic brutality, even the most stalwart warriors fear the onslaught to come.*

**Card text:** Whenever an ORK NPO is fighting, its weapons have the Balanced weapon rule. Worsen the Hit stat of ORK NEMESIS operatives' ranged weapons by 1, but their melee weapons have the Severe weapon rule.

**Book text:** Whenever this operative is fighting, its weapons have the Balanced weapon rule. Worsen the Hit stat of this operative's ranged weapons by 1, but its melee weapons have the Severe weapon rule.

> Note: Card wording gives Balanced to ORK NPOs only; transcribed verbatim.

> Applied to profiles: `{"ranged": {"hitWorsen": 1}, "melee": {"addRule": "Severe"}}`

### T'AU EMPIRE: Supporting Fire
*The burning commitment of the T'au to their creed of the Greater Good allows for effective coordination of incredibly accurate firepower.*

**Card text:** Whenever a T'AU EMPIRE NPO operative is within 3" of another, its ranged weapons have the Accurate 1 weapon rule.

Whenever a friendly T'AU EMPIRE NEMESIS operative is within 3" of another friendly T'AU EMPIRE operative, that NEMESIS operative's ranged weapons have the Accurate 1 weapon rule.

**Book text:** Whenever this operative is within 3" of another friendly T'AU EMPIRE operative, this operative's ranged weapons have the Accurate 1 weapon rule.

### TYRANID: Will of the Hive Mind
*The gestalt consciousness of the Hive Mind links the Tyranids, overriding their instincts and driving them onwards to fulfil its alien imperatives.*

**Card text:** Ignore the changes to TYRANID NPO and friendly TYRANID NEMESIS operatives' stats from being injured (including their weapons' stats).

**Book text:** Ignore changes to this operative's stats from being injured (including its weapons' stats).

## 5. Core Nemesis rules (every nemesis operative)

### Extra Defence
Whenever an operative is shooting this operative, collect and roll one additional defence dice, unless this operative is injured.

### Bulky
- This operative cannot be placed on Vantage terrain higher than 2" from the killzone floor.
- Whenever this operative would perform the Fight action, the distance requirements of its control range can be changed to 1" horizontally and 4" vertically until the end of that action.
- This operative can move through other operatives (excluding NEMESIS operatives).
- Ignore all changes to this operative's APL and if it's a player operative, APL changes don't affect the 5AP you can spend per turning point.

### Towering Size
- In the Firefight phase, whenever you determine this operative's order, you cannot select Conceal.
- This operative cannot be in cover or obscured by Light terrain, terrain parts less than 3" tall or terrain that's not wholly intervening.
- Whenever another operative is performing the Shoot action, being within control range of other operatives doesn't prevent this operative from being selected as a valid target. In other words, this operative can be shot while within control range of friendly operatives.
- This operative can move through terrain parts less than 2" tall. It cannot move through Accessible terrain (excluding hatchways) unless that terrain is also less than 2" tall.
- Whenever this operative would finish a move in a terrain feature less than 2" tall, temporarily remove that terrain feature from the killzone, then return it when this operative leaves that location; if it's an equipment terrain feature, remove it from the battle instead.

## 6. Behaviours (NPO only)

Printed on card 2 as an orange action bar (`BEHAVIOUR: <NAME>`, right-hand label `NPO`), followed by the description and the numbered priority list.

### Brawler
*Eager for close-quarters brutality at all costs, these inveterate fighters pile towards their enemies in surges of bloodlust.*

This NPO will move towards the enemy to fight them, but will seek cover on its way. When activated, if it's a NEMESIS NPO or will perform the Fight or Charge action during that activation, give it an Engage order. Otherwise, give it a Conceal order.

1. **Fight.**
2. **Charge** the closest player operative via the shortest possible route.
3. **Reposition** towards the closest player operative, to cover if possible (a subsequent **Dash** action can fulfil this).
4. **Dash** towards the closest player operative, to cover if possible.

### Battler
*Tactically flexible and as capable of firing on the move as piling in with blades drawn, these all-round warriors are as deadly at range as they are face to face.*

This NPO will move towards the enemy to fight them, but will seek cover on its way, and will shoot if the need arises. When activated, if it's a NEMESIS NPO or will perform the Fight, Charge or Shoot action during that activation, give it an Engage order. Otherwise, give it a Conceal order.

1. **Fight.**
2. **Charge** the closest player operative via the shortest possible route.
3. **Reposition** towards the closest player operative, to cover if possible (a subsequent **Dash** action can fulfil this).
4. **Shoot.**
5. **Dash** towards the closest player operative, to cover if possible.

### Guardian
*Stoic and dependable sentinels are relied upon to hold vital routes against all comers.*

This NPO will shoot the enemy as a priority, but will fight if the need arises. When activated, if it's a NEMESIS NPO or will perform the Fight, Charge or Shoot action during that activation, give it an Engage order. Otherwise, give it a Conceal order.

1. **Fight.**
2. **Shoot.**
3. **Charge** the closest player operative that's within 4" of it via the shortest possible route.
4. **Reposition.** If possible, to a location where there's a valid target that isn't obscured, if not, to a location that's appropriate for the NPOs to better win the mission (a subsequent **Dash** action can fulfil these).
5. **Dash.** If possible, to a location where there's a valid target that isn't obscured, if not, to a location that's appropriate for the NPOs to better win the mission.

### Marksman
*These warriors prefer the patient, long-distance kill.*

This NPO will move to an ideal position to shoot the enemy. When activated, if it's a NEMESIS NPO or will perform the Shoot action during that activation, give it an Engage order. Otherwise, give it a Conceal order.

1. **Fall Back.** If possible, to a location where there's a valid target that isn't obscured, if not, to a location that's appropriate for the NPOs to better win the mission.
2. **Shoot.**
3. **Reposition.** If possible, to a location where there's a valid target that isn't obscured, if not, to a location that's appropriate for the NPOs to better win the mission (a subsequent **Dash** action can fulfil these).
4. **Dash.** If possible, to a location where there's a valid target that isn't obscured, if not, to a location that's appropriate for the NPOs to better win the mission.

## 7. Weapons

Hit is shown as `N+`. Dmg is `normal/critical` (e.g. Meltagun `6/3` is correct: low crit damage plus Devastating 4).
A weapon with two profiles (standard/supercharge, frag/krak) is **one** selection and prints **two rows** labelled `<name> (<profile>)`.

### Ranged
| Name | Atk | Hit | Dmg | WR | Sel | Alternatives |
|---|---|---|---|---|---|---|
| Autocannon | 5 | 3+ | 5/6 | - | 1 | Deathspitter, Missile pod |
| Burst cannon | 5 | 3+ | 3/4 | Ceaseless, Torrent 1" | 1 | Scatter laser, Devourer |
| Cyclic ion raker | 5 | 3+ | 4/5 | Heavy (Reposition only), Piercing 1, Selection 2, Torrent 2" | 2 | - |
| Flamestorm cannon | 6 | 2+ | 3/3 | Range 8", Heavy (Reposition only), Selection 2, Torrent 2" | 2 | Flamespurt |
| Havoc launcher | 4 | 3+ | 4/6 | Blast 2" | 1 | Grotzooka, Spore mine launcher |
| Heavy bolter | 5 | 3+ | 4/5 | Piercing Crits 1, Torrent 1" | 1 | - |
| Heavy flamer | 5 | 2+ | 3/3 | Range 8", Saturate, Torrent 2" | 1 | Incendine combustor, Liquifier gun, Skorcha |
| Heavy onslaught gatling cannon | 6 | 3+ | 4/5 | Heavy (Reposition only), Selection 2, Torrent 2" | 2 | Avenger chaincannon, Enmitic exterminator |
| Heavy phosphor blaster | 5 | 3+ | 4/5 | Saturate, Severe | 1 | - |
| Heavy rail rifle | 5 | 3+ | 6/7 | Heavy (Reposition only), Piercing 2, Selection 2 | 2 | Doomsday blaster, Gauss destructor |
| Heavy stubber | 5 | 3+ | 4/5 | Torrent 1" | 1 | Big shoota |
| Lascannon | 4 | 3+ | 6/7 | Heavy (Reposition only), Piercing 2 | 1 | Bright lance, Dark lance |
| Macro plasma incinerator (standard) | 5 | 3+ | 4/6 | Blast 2", Heavy (Reposition only), Piercing 1, Selection 2 | 2 | - |
| Macro plasma incinerator (supercharge) | 5 | 3+ | 5/6 | Blast 2", Heavy (Reposition only), Lethal 5+, Piercing 1, Selection 2 | 2 | - |
| Meltagun | 4 | 3+ | 6/3 | Range 6", Devastating 4, Piercing 2 | 1 | Fusion blaster, Heat lance |
| Missile launcher (frag) | 4 | 3+ | 3/5 | Blast 2" | 1 | - |
| Missile launcher (krak) | 4 | 3+ | 5/7 | Piercing 1 | 1 | - |
| Multi-melta | 4 | 3+ | 6/3 | Devastating 4, Heavy (Reposition only), Piercing 2 | 1 | - |
| Plasma cannon (standard) | 4 | 3+ | 4/6 | Blast 2", Heavy (Reposition only), Piercing 1 | 1 | - |
| Plasma cannon (supercharge) | 4 | 3+ | 5/6 | Blast 2", Heavy (Reposition only), Hot, Lethal 5+, Piercing 1 | 1 | - |
| Plasma gun (standard) | 4 | 3+ | 4/6 | Piercing 1 | 1 | - |
| Plasma gun (supercharge) | 4 | 3+ | 5/6 | Hot, Lethal 5+, Piercing 1 | 1 | - |
| Rokkit launcha | 6 | 4+ | 4/5 | Blast 1" | 1 | - |
| Shuriken cannon | 5 | 3+ | 4/5 | Rending, Torrent 1" | 1 | - |
| Splinter cannon | 5 | 3+ | 3/5 | Lethal 5+, Torrent 1" | 1 | - |
| Starcannon | 4 | 3+ | 5/6 | Lethal 5+, Piercing 1 | 1 | Heavy venom cannon, Kustom mega-blasta |
| Stranglethorn cannon | 5 | 3+ | 3/5 | Blast 2", Lethal 5+ | 1 | - |
| Thermal spear | 5 | 3+ | 6/3 | Devastating 4, Heavy (Reposition only), Piercing 2, Selection 2 | 2 | Fusion collider |

### Melee
| Name | Atk | Hit | Dmg | WR | Sel | Alternatives |
|---|---|---|---|---|---|---|
| Chain weapon | 4 | 3+ | 5/6 | Brutal, Rending | 1 | - |
| Close combat weapon | 3 | 4+ | 4/5 | Selection 0 | 0 | - |
| Dread saw | 5 | 3+ | 4/5 | Rending | 1 | - |
| Fleshmower | 5 | 2+ | 4/5 | Brutal | 1 | - |
| Power fist | 4 | 3+ | 6/8 | Brutal, Shock | 1 | Crushing claw |
| Power scourge | 6 | 3+ | 3/5 | Lethal 5+ | 1 | Lasher tendrils |
| Power talon | 4 | 3+ | 5/6 | Lethal 5+, Rending | 1 | - |
| Power weapon | 4 | 3+ | 5/7 | Lethal 5+ | 1 | Ghostglaive |
| Scything talons | 5 | 3+ | 4/6 | Ceaseless | 1 | Macro-scalpels |
| Thunder hammer | 4 | 3+ | 6/8 | Shock, Stun | 1 | - |

### Modifiers (count as a selection, not printed as rows)
- **Twinned weapon** (selection 1): Twinned: Select one other ranged weapon this operative has to have the Ceaseless weapon rule; if it's a burst cannon, add 1 to its Atk stat instead.
- **Paired weapon** (selection 1): Paired: Select one other melee weapon this operative has and add 1 to its Atk stat.

**Notes:**
- Macro plasma incinerator: Supercharge profile has no Hot in the book (unlike the plasma cannon). Transcribed as printed.
- Multi-melta: Book misprints the name as 'Muti-melta'.

## 8. Nemesis traits

### Armoured
*With a tough hide of dense carapace or artificial plating, this operative can stride through hailstorms of the enemy's increasingly desperate small arms fire.*

Whenever an operative is shooting this operative with a weapon that has a Normal Dmg stat of 3 or less, improve this operative's Save stat by 1.

### Blitz
*(flavour text not available)*

Whenever this operative performs the Charge action during its activation, its melee weapons have the Severe and Shock weapon rules until the end of that activation.

### Duellist
*(flavour text not available)*

Whenever this operative is fighting or retaliating, you can resolve one of its successes before the normal order. If you do, that success must be used to block.

### Focused Targeting
*A single-minded purpose suffuses this operative, with those it settles its attention upon suffering the full wrath of its destructive power.*

Whenever this operative is shooting during its activation, if it hasn't performed any other actions during that activation, its ranged weapons have the Punishing weapon rule.

### Close-range Lethality
*(flavour text not available)*

Whenever this operative is shooting the closest valid target within 8" of it, its ranged weapons have the Lethal 5+ weapon rule; if the weapon already has that weapon rule, it also has the Severe weapon rule.

### Fury
*Unbridled wrath consumes some powerful operatives: a blinkered anger that can only be briefly sated in destruction at close quarters.*

This operative's melee weapons have the Ceaseless weapon rule; if the weapon already has that weapon rule, it has the Relentless weapon rule. Worsen the Hit stat of this operative's ranged weapons by 1.

> Applied to profiles: `{"ranged": {"hitWorsen": 1}, "melee": {"addRule": "Ceaseless", "ifHasRuleReplaceWith": "Relentless"}}`

### Implacable
*Unyielding and without mercy while there are enemies yet to kill, this operative pours its remaining strength into the foe's elimination, even when gravely impaired.*

Ignore any changes to this operative's weapon stats from being injured.

### Crushing Impact
*Thundering headlong into the fray, this combatant uses both the impetus of their charge and their armoured bulk to bring swift death to their foes.*

When this operative finishes moving during the Charge action, inflict D3+3 damage on one enemy operative within its control range.

### Shielded
*With an ablative outer skin, redundancy mechanisms or the ability to call upon esoteric protection, this operative can shrug off what should be a devastating blow.*

Once per battle, when an attack dice inflicts damage on this operative, you can ignore that inflicted damage.

### Shrouded
*Whether a creature capable of disguise or concealment, or a vehicle that carries disruptive technology, this operative is able to evade the enemy's attention despite its size.*

Whenever an operative is shooting this operative from more than 8" away, attack dice cannot be re-rolled.

### Tenacious
*There are those creatures and mechanisms that simply will not stop. Some draw upon spiritual strength or wells of hatred, while others are driven by a fearsome will.*

Ignore any changes to this operative's Move stat from being injured.

### Tough
*Some operatives are exceptionally hardy, capable of enduring even in the face of horrific wounds. Such a trait may be due to thickened endoskeletons, reinforced subsystems or even supernatural warding.*

Whenever an attack dice inflicts damage of 4 or more on this operative, roll one D6: on a 5+, subtract 1 from that inflicted damage.

### Violent Demise
*From detonating ammunition stores to corrosive innards and frenzied death throes, some large targets are dangerous even in defeat.*

If this operative is incapacitated, before it's removed from the killzone, inflict D6+1 damage on each other operative within 3" of it (excluding operatives with Heavy terrain wholly intervening between them and this operative).

## 9. Calculating the card (exact algorithm)

The official example cards print **final** weapon values with permanent modifiers already applied. Implement `deriveCard(build)` as a pure function:

1. **Stats** from the size table: `CONTROL`, `MOVE` as `6"`, `SAVE` as `4+`, `WOUNDS`.
2. **Budget**: `used = Σ selection` over all picks (Twinned/Paired = 1, Close combat weapon = 0, Selection 2 weapons = 2). Valid if `used ≤ size.weaponSelections`. `traitsAllowed = 1 + (size.weaponSelections − used)`.
3. **Rows**: each weapon pick expands to one row per profile. Label = `alias` if given, otherwise the weapon name. Add ` (<profile suffix>)` for multi-profile weapons. Copy atk, hit, dmg and the rules list.
4. **Twinned** (pick has `targetIndex` → a *ranged* weapon pick): target gains `Ceaseless`. If the target is the burst cannon (which already has Ceaseless), add +1 Atk instead. Apply to **all** of the target's profiles. Label becomes `Twinned <name lower-cased>` unless the target has an alias; then the alias is used as-is (the Crisis example uses alias "Twinned meltaguns").
5. **Paired** (target → a *melee* pick): +1 Atk on the target. Label becomes `Paired <name lower-cased>` unless aliased.
6. **Fury** (trait): melee rows gain `Ceaseless`. If the row already has Ceaseless, **replace** it with `Relentless` (the Screamer-Killer card shows only `Relentless`). Ranged rows: Hit worsens by 1.
7. **ORK / Waaagh!** (allegiance): ranged rows Hit worsens by 1; melee rows gain `Severe`. "Balanced when fighting" is conditional, so it stays as text only.
8. **Clamp** Hit to max 6+. Remove duplicate rules. **Sort rules**: any `Range x"` first, then alphabetical (matches the official cards, e.g. `Range 6", Ceaseless, Devastating 4, Piercing 2`).
9. If no rules remain, print `-` in WR (official cards print a dash).
10. Mark every value changed by steps 4–8 (`modified: true`) so the preview can highlight it. Exports don't highlight by default.

**Not applied to stats** (conditional, text only): Armoured, Blitz, Close-range Lethality, Focused Targeting, Supporting Fire, Arrogant Superiority, Let the Galaxy Burn, Acquisition at All Costs, Defenders of the Imperium, Crushing Impact, Shielded, Shrouded, Tough, Violent Demise, Living Metal. Injury-related (Implacable, Tenacious, Will of the Hive Mind) are text only too: the card shows uninjured stats.

**Interpretation defaults** (not stated in the rules; make them configurable):
- Fury + Waaagh! on one operative → both Hit penalties apply (−2). Show a warning in the editor.
- At most one Twinned/Paired per target weapon; the target must be a different pick of the right type.
- Twinned/Paired with no valid target → validation error.

**Validation** (editor status; export still allowed after confirmation): selections over budget; trait count ≠ allowed; duplicate traits; NPO without behaviour; empty name; no weapons (warning).

## 10. Golden test cases (Dossier examples, must match exactly)

### Armoured Sentinel ‘Armourbane’ (Dossier pp.24-25)
Build: NPO · IMPERIUM · size M · base 80 · behaviour MARKSMAN · weapons: Plasma cannon; Close combat weapon · traits: ARMOURED, FOCUSED_TARGETING

Weapon rules reference (PDF add-on): Blast x, Heavy, Hot, Lethal x+, Piercing x, Punishing, Selection x

Expected: CONTROL 5 · MOVE 6" · SAVE 4+ · WOUNDS 50 · selections used 1 · traits allowed 2 · keywords `IMPERIUM, NEMESIS, ARMOURED SENTINEL`

| Name | Atk | Hit | Dmg | WR |
|---|---|---|---|---|
| Plasma cannon (standard) | 4 | 3+ | 4/6 | Blast 2", Heavy (Reposition only), Piercing 1 |
| Plasma cannon (supercharge) | 4 | 3+ | 5/6 | Blast 2", Heavy (Reposition only), Hot, Lethal 5+, Piercing 1 |
| Close combat weapon | 3 | 4+ | 4/5 | Selection 0 |

### XV8 Crisis Battlesuit ‘Shas'ui Nomura’ (Dossier pp.26-27)
Build: NPO · TAU_EMPIRE · size S · base 50 · behaviour MARKSMAN · weapons: Meltagun (alias "Twinned meltaguns"); Twinned weapon → Meltagun; Close combat weapon · traits: SHIELDED

Weapon rules reference (PDF add-on): Accurate x, Ceaseless, Devastating x, Piercing x, Range x, Selection x

Expected: CONTROL 4 · MOVE 6" · SAVE 4+ · WOUNDS 35 · selections used 2 · traits allowed 1 · keywords `T'AU EMPIRE, NEMESIS, XV8 CRISIS BATTLESUIT`

| Name | Atk | Hit | Dmg | WR |
|---|---|---|---|---|
| Twinned meltaguns | 4 | 3+ | 6/3 | Range 6", Ceaseless, Devastating 4, Piercing 2 |
| Close combat weapon | 3 | 4+ | 4/5 | Selection 0 |

### Screamer-Killer ‘The Deathdirge of Varl’ (Dossier pp.28-29)
Build: NPO · TYRANID · size L · base 90 · behaviour BATTLER · weapons: Plasma cannon (alias "Bio-plasmic scream"); Scything talons; Paired weapon → Scything talons · traits: FURY

Weapon rules reference (PDF add-on): Blast x, Ceaseless, Heavy, Hot, Lethal x+, Piercing x, Relentless

Expected: CONTROL 6 · MOVE 6" · SAVE 4+ · WOUNDS 75 · selections used 3 · traits allowed 1 · keywords `TYRANID, NEMESIS, SCREAMER-KILLER`

| Name | Atk | Hit | Dmg | WR |
|---|---|---|---|---|
| Bio-plasmic scream (standard) | 4 | 4+ | 4/6 | Blast 2", Heavy (Reposition only), Piercing 1 |
| Bio-plasmic scream (supercharge) | 4 | 4+ | 5/6 | Blast 2", Heavy (Reposition only), Hot, Lethal 5+, Piercing 1 |
| Paired scything talons | 6 | 3+ | 4/6 | Relentless |

### Redemptor Dreadnought ‘Venerable Carrius’ (Dossier pp.30-31)
Build: NPO · IMPERIUM · size L · base 90 · behaviour GUARDIAN · weapons: Heavy onslaught gatling cannon; Power fist · traits: IMPLACABLE

Weapon rules reference (PDF add-on): Brutal, Heavy, Selection x, Shock, Torrent x

Expected: CONTROL 6 · MOVE 6" · SAVE 4+ · WOUNDS 75 · selections used 3 · traits allowed 1 · keywords `IMPERIUM, NEMESIS, REDEMPTOR DREADNOUGHT`

| Name | Atk | Hit | Dmg | WR |
|---|---|---|---|---|
| Heavy onslaught gatling cannon | 6 | 3+ | 4/5 | Heavy (Reposition only), Selection 2, Torrent 2" |
| Power fist | 4 | 3+ | 6/8 | Brutal, Shock |

## 11. Datacard format (Kill Team 2024, Core Rules p.48)

Target look: `docs/mockups/datacard.html`. Anatomy, numbered as in the Core Rules:

1. **Name**: top left on a dark, finely striped header (#121212–#262626). White condensed caps (Oswald 500, ~44px at 1200px card width) with a 4px **orange underline**. The nemesis **moniker** goes below in small light-grey caps, in ‘single quotes’.
2. **Stats**: 4 separate dark tiles (#202020) at the top right, each with the label on top (`CONTROL`, `MOVE`, `SAVE`, `WOUNDS`) and an orange icon + big white value (`6`, `6"`, `4+` with a smaller `+`, `75`). Icons are original SVGs: down-triangle (Control/APL), arrow (Move), shield (Save), drop (Wounds).
   - **Model picture**: in the header between the name and the tiles (official cards show the miniature there). Uploaded photo, cover-fit with user pan/zoom; CSS mask fades it into the header on its left edge.
3. **Weapon table**: header `NAME ATK HIT DMG WR` in dark Oswald caps, 3px orange rule under it and another after the last row. Rows alternate transparent / light grey (#d3d2ce). Orange row icon: three bullets = ranged, blade = melee. Name column has no subtitle.
4. **WR**: weapon rules, comma separated.
5. **Abilities**: below the table on the grey textured body (#e6e5e1). Two layouts:
   - rule: `**Name:** text` paragraphs;
   - action box: full-width orange bar (`NAME` left, `1AP`/label right), then ▶ green-triangle effect text and ◆ red-diamond restriction text.
6. **Keyword footer**: dark bar. Keywords in white Oswald caps, the first (allegiance) keyword in **orange**. Format: `TYRANID, NEMESIS, SCREAMER-KILLER`. On the right, `NPO · SIZE: LARGE` (or `SIZE: LARGE` for a player), the card number `1/2`, then
7. **Base circle**: white outline circle with the base size in mm (`90`); a pill shape for ovals (`105x70`).

Card: 120 × 70 mm landscape, rounded corners (~3.4mm radius), designed at **1200 × 700 px**. Accent orange ≈ `#e8641c`.
Fonts: **Oswald** (headings, stats, keywords) + **Roboto Condensed** (body). Both OFL, self-hosted.

**Card contents**
- **Card 1 (front)**: header + stats + picture; weapon table; abilities = allegiance trait (`**<Trait name>:** cardText`) + each nemesis trait (`**<Name>:** text`) + reminders: `**Nemesis:** Extra Defence, Bulky, Towering Size (see other card).` / `**Control:** Use this operative's CONTROL stat instead of APL in all instances except spending action points.` / NPO: `**Behaviour:** <Name> (see other card).`
- **Weapon rules reference**: optional block printed below the cards on the PDF (§12).
- **Card 2 (back/second)**: same header + footer. NPO: behaviour action bar + ▶ description + ◆ "Performs the first action it can from this list. If it can do none, it's expended." + numbered priority list. Player: an action-style bar `PLAYER NEMESIS` with ◆ the player restrictions + activation limits. Then Extra Defence, Bulky and Towering Size written out (bullets allowed).
- **Overflow**: ability blocks flow from card 1 to card 2 (before the core rules) when card 1 is full; then shrink text (min ~13px at 1x). Worst case: Large NPO with a Close combat weapon and 3 extra traits (4 nemesis traits), or 3 two-profile weapons (6 rows).
- Flavour text (`flavour` fields) is **not** printed on the datacards (official datacards have none). Use it for editor tooltips/descriptions.

### The official rule cards (for reference; the app doesn't reproduce them)
The Nemesis card pack also has portrait rule cards. **Allegiance trait** cards have an orange header with a gear icon, the trait name in an orange bar, flavour, the rule, and the allegiance name + emblem in the footer. **Nemesis trait** cards are the same with teal (#1f8a9a). **Behaviour** cards are the same with dark red. This app puts the same information onto card 1 and card 2 instead.

## 12. Weapon rules reference (optional PDF add-on, printed below the card)

A **toggle button** ("Weapon rules on PDF", next to Export PDF; **on by default**, user can switch it off; saved as `options.weaponRulesOnPdf` in the build) prints, **below the card(s) on the PDF page**, every weapon rule used on the datacards, **in alphabetical order**, explained **exactly as in the "Weapon Rules" list on the last page of the Kill Team Lite Rules**. Only weapon rules are listed, no other game terms.

**Which entries are printed**: an entry is included when any of its `match` regexes (in `rules-data.json → weaponRuleGlossary.entries`) matches the final printed text of card 1 or card 2. That means the WR column plus the ability text, because traits can name weapon rules (Fury → Ceaseless/Relentless, Focused Targeting → Punishing, Supporting Fire → Accurate). Parameterised rules are listed once by their generic name (`Blast 2"` and `Blast 1"` both → **Blast x**; `Piercing Crits 1` → **Piercing x**, whose text covers Crits). `Heavy (Reposition only)` → **Heavy** (the pattern `\bHeavy \(` avoids "Heavy terrain").

**Format** (see `docs/mockups/pdf-page.png`): heading `WEAPON RULES` with an orange rule, then entries as **Term:** text in 2 columns, Roboto Condensed ~8pt, under a dashed cut line below the cards. If it doesn't fit, it continues on the next page. The same entries are also used as editor tooltips.

**Selection x** is not in the Lite Rules. It's printed with the Dossier's wording and a small "(Nemesis Operatives Dossier)" source label.

| Term | Text (verbatim) | Detected by |
|---|---|---|
| **Accurate x** | You can retain up to x attack dice as normal successes without rolling them. If a weapon has more than one instance of Accurate x, you can treat it as one instance of Accurate 2 instead (this takes precedence over x rules above). | `\bAccurate \d` |
| **Balanced** | You can re-roll one of your attack dice. | `\bBalanced\b` |
| **Blast x** | The target you select is the primary target. After shooting the primary target, shoot with this weapon against each secondary target in an order of your choice (roll each sequence separately). Secondary targets are other operatives visible to and within x of the primary target, e.g. Blast 2" (they are all valid targets, regardless of a Conceal order). Secondary targets are in cover and obscured if the primary target was. | `\bBlast \d` |
| **Brutal** | Your opponent can only block with critical successes. | `\bBrutal\b` |
| **Ceaseless** | You can re-roll any of your attack dice results of one result (e.g. results of 2). | `\bCeaseless\b` |
| **Devastating x** | Each retained critical success immediately inflicts x damage on the operative this weapon is being used against, e.g. Devastating 3. If the rule starts with a distance (e.g. 1" Devastating x), inflict x damage on that operative and each other operative visible to and within that distance of it. Note that success isn't discarded after doing so - it can still be resolved later in the sequence. | `\bDevastating \d` |
| **Heavy** | An operative cannot use this weapon in an activation or counteraction in which it moved, and it cannot move in an activation or counteraction in which it used this weapon. If the rule is Heavy (x only), where x is a move action, only that move is allowed, e.g. Heavy (Dash only). This weapon rule has no effect on preventing the Guard action. | `\bHeavy \(` |
| **Hot** | After an operative uses this weapon, roll one D6: if the result is less than the weapon's Hit stat, inflict damage on that operative equal to the result multiplied by two. If it's used multiple times in one action (e.g. Blast), still only roll one D6. | `\bHot\b` |
| **Lethal x+** | Your successes equal to or greater than x are critical successes, e.g. Lethal 5+. | `\bLethal \d\+` |
| **Limited x** | After an operative uses this weapon a number of times in the battle equal to x, they no longer have it. If it's used multiple times in one action (e.g. Blast), treat this as one use. | `\bLimited \d` |
| **Piercing x** | The defender collects x less defence dice, e.g. Piercing 1. If the rule is Piercing Crits x, this only comes into effect if you retain any critical successes. | `\bPiercing (Crits )?\d` |
| **Punishing** | If you retain any critical successes, you can retain one of your fails as a normal success instead of discarding it. | `\bPunishing\b` |
| **Range x** | Only operatives within x of the active operative can be valid targets, e.g. Range 9". | `\bRange \d+\"` |
| **Relentless** | You can re-roll any of your attack dice. | `\bRelentless\b` |
| **Rending** | If you retain any critical successes, you can retain one of your normal successes as a critical success instead. | `\bRending\b` |
| **Saturate** | The defender cannot retain cover saves. | `\bSaturate\b` |
| **Seek** | When selecting a valid target, operatives with a Conceal order cannot use terrain for cover. If the rule is Seek Light, they cannot use Light terrain for cover. While this can allow operatives to be targeted (assuming they're visible), it doesn't remove their cover save (if any). | `\bSeek\b` |
| **Selection x** <br>*(Nemesis Operatives Dossier p.16 (not in the Lite Rules))* | Weapons with the Selection x weapon rule count as x selections instead (e.g. a weapon with Selection 2 counts as two of your permitted selections). Any selections you don't use grant you an extra nemesis trait selection. | `\bSelection \d` |
| **Severe** | If you don't retain any critical successes, you can change one of your normal successes to a critical success. The Devastating and Piercing Crits weapon rules still take effect, but Punishing and Rending don't. | `\bSevere\b` |
| **Shock** | The first time you strike with a critical success in each sequence, also discard one of your opponent's unresolved normal successes (or one of their critical successes if there are none). | `\bShock\b` |
| **Silent** | An operative can perform the Shoot action with this weapon while it has a Conceal order. | `\bSilent\b` |
| **Stun** | If you retain any critical successes, subtract 1 from the APL stat of the operative this weapon is being used against until the end of its next activation. | `\bStun\b` |
| **Torrent x** | Select a valid target as normal as the primary target, then select any number of other valid targets within x of the first valid target, but not within control range of friendly operatives, as secondary targets, e.g. Torrent 2". Shoot with this weapon against all of them in an order of your choice (roll each sequence separately). | `\bTorrent \d` |

## 13. Known source quirks
- "Muti-melta" in the book → **Multi-melta**.
- Macro plasma incinerator (supercharge) has **no Hot** in the book (unlike the plasma cannon). Transcribed as printed.
- The book's allegiance table says "or and area"; the Votann card says "(e.g. a flanks on pg 50)". The card wording is used; the page number refers to the Dossier.
- The Ork allegiance card grants Balanced to "ORK NPO" only; transcribed verbatim.
- Flavour text is missing for **Blitz, Duellist, Close-range Lethality** (their cards weren't in the scans). The rules text for them is complete.
- Ambull and Archivist (Dossier pp.60–77) are fixed NPOs, not built with the builder. They are out of scope for v1.
