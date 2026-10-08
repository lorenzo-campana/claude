# Player workspace

The player creator, character sheets, level advancement and interactive card controls are embedded in `sablewood-tracker.html`, which remains a standalone Claude artifact.

- `player.js`: account saves, characters, campaigns, creator, sheets and advancement.
- `player.css`: printed-sheet layout, creator and card overlays.
- `rules.json`: Core + Hope & Fear character rules and equipment.
- `card-controls.json`: reviewed card resource and dice profiles.
- `card-resources.js`: counters, shared dice pools, progressive dice and reset handling.
- `card-review.md`: review provenance and persistent resource inventory.

After editing a source file, regenerate the HTML from the repository root:

```sh
python3 scripts/build-players.py
```

Checks:

```sh
node tests/players.test.cjs
node tests/player-sync.test.cjs
```

The sync check uses a mock of the Claude db/user contract; actual account permissions are supplied by the artifact host. Character saves are private to each user. Campaign roster entries omit background, connections, notes and history.

### Official sheet artwork

The sheet uses Eveleth Clean Regular, Eveleth Clean Thin, and Overpass font subsets from the supplied Daggerheart PDF. `assets/` also contains the original vector paths for traits, Evasion, Armor, Level, Armor Slots, and section ribbons. The sheet keeps live HTML fields and buttons over those outlines. `build-players.py` embeds the font and SVG files as data URLs so the standalone Claude artifact does not need additional requests for them. The reference is the Bard character sheet on physical PDF page 368 (the user's page 367 reference); other classes retain their own features and domain names.

### Equipment

`equipment.json` holds the Core and Hope & Fear equipment/loot catalogs (including campaign equipment and the four printed tier variants). Cards retain English rules text and a white illustration area. `equipment.js` supplies the gallery, filters, card picker, owned quantities, equipment slots, sales and transfers. The creator uses the same picker for starting equipment. Existing weapons, armor and starting potions migrate once into the inventory; handwritten inventory remains editable.

Equipped items derive trait, Evasion, Armor Score, threshold, Proficiency and relic bonuses without changing base statistics. Weapon rolls apply damage features, critical damage, secondary bonuses, costs and reloading/Ammo. Incoming damage handles armor type restrictions and reduction/negation features. Consumables handle healing, trait potions and temporary stat effects; rest/scene/Fear triggers expire the relevant effects. Keywords that depend on fictional circumstances or an adversary/ally retain their full rules text and have activation/cost controls where appropriate; target effects are recorded for the table to resolve rather than editing another player's character automatically.

Sales use the GM-agreed price entered in handfuls of gold. Transfers between the user's own characters are direct. Transfers to another player export a trade packet and remove the offered quantity; the recipient imports that packet. Packet IDs prevent repeated imports within the same account, and exported packets can be downloaded again from the sender's inventory. This is a table-managed exchange, not a server-authoritative marketplace.

To re-import the provided manuals (requires `pdfplumber`):

```sh
python3 scripts/extract-equipment.py --core /path/to/Daggerheart.pdf --hope-fear '/path/to/Daggerheart Hope Fear.pdf'
python3 scripts/build-players.py
```

The character equipment area uses three adjacent full cards (Primary, Secondary and Armor), with derived damage and controls on the card. Inventory contains two selectable weapon slots; additional stored weapons remain accessible in a disclosure. Items, consumables and stored armor use compact rectangular cards that open the complete equipment card. Starting supplies migrate from matching inventory lines into cards, while unmatched notes and legacy custom-weapon fields remain editable. Slot assignments and item quantities are included in character backups.
