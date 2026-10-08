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
