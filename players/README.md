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
