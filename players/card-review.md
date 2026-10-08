# Card controls review

All 333 cards in the current gallery were reviewed against the uploaded Daggerheart Core Rulebook, its Domain Card Reference and heritage/subclass pages, and the Hope & Fear card PDF. The images remain the original HD assets rendered by the shared gallery engine.

`card-controls.json` is the curated control registry. Cards without a persistent resource do not receive a token counter. Instant dice rolls use a separate on-card menu. Traits, Proficiency and conditional Hope/Fear pools are evaluated for the current character. Variable quantities are chosen before rolling; ordinary rolls leave Hope/Stress costs to the player. Resource preparation buttons explicitly charge their displayed cost.

## Persistent resources

| Card ID | Card | Resource | Lifecycle |
| --- | --- | --- | --- |
| 3 | Unleash Chaos | tokens · Chaos | max: spell / refresh: session / clear: session |
| 48 | Flight | tokens · Flight | Manual, according to card text |
| 138 | Confusing Aura | tokens · Layers | Manual, according to card text |
| 34 | Strategic Approach | tokens · Strategy | refresh: long |
| 104 | Sigil of Retribution | pool · Retribution | max: level |
| 16 | Inspirational Words | tokens · Inspiration | refresh: long |
| 54 | Invisibility | tokens · Invisibility | Manual, according to card text |
| 107 | Never Upstaged | tokens · Upstaged | Manual, according to card text |
| 17 | Uncanny Disguise | tokens · Disguise | Manual, according to card text |
| 150 | Spellcharge | tokens · Spellcharge | max: spell |
| 168 | Twilight Toll | tokens · Twilight | clear: rest |
| 91 | Thorn Skin | tokens · Thorns | clear: rest |
| 94 | Wild Fortress | tokens · Fortress HP | max: 3 |
| 130 | Wild Surge | face · Wild Surge | clear: rest |
| 163 | Fane of the Wilds | tokens · Fane | refresh: long |
| 115 | Restoration | tokens · Restoration | refresh: long |
| 110 | Zone of Protection | face · Protection | Manual, according to card text |
| 200 | Call of the Slayer | pool · Slayer | max: proficiency / clear: session |
| 218 | Call of the Slayer | pool · Slayer | Shared with card 200 |
| 247 | Seaborne | tokens · Tide | max: level / clear: session |
| 273 | Poisoners Guild | tokens · Poison | clear: long |
| 274 | Poisoners Guild | tokens · Poison | Shared with card 273 |
| 288 | Hedge | tokens · Talisman | clear: rest |
| 289 | Hedge | tokens · Spirits | clear: scene |
| 290 | Hedge | tokens · Circle | Manual, according to card text |
| 293 | Moon | face · Lunar Phase | refresh: session |
| 310 | Vampire | tokens · Blood | max: 6 / loseLong: 1 |
| 313 | Umbral Veil | tokens · Veil | clear: scene |
| 327 | Dark Army | tokens · Fiends | max: 8 / clear: rest |

Pool dice are rolled when spent. Sigil of Retribution spends its entire pool; Slayer Specialization shares the Foundation pool. Wild Surge and Zone of Protection track a die face instead of rolling it as damage. Lunar Phases is rolled at session start and can advance once per rest for 1 Hope. Vampire loses one blood token on a long rest rather than clearing its entire reserve. Confusing Aura tracks layers and uses the current layer count for its d6 roll.

The registry covers individual cards. It does not attempt to automate every narrative prerequisite, choice of target, conditional feature, GM decision or class feature.
