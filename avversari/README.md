# Daggerheart bestiary

152 unique English stat blocks extracted from the supplied Daggerheart Core Rulebook: 125 adversaries (including the four Colossi in the Colossus of the Drylands campaign), 8 social adversaries, and 19 environments. The Raging River example on printed page 240 is identical to the catalog entry and is included once.

`catalog.json` preserves the printed page and PDF page for every entry, plus all 19 Colossus segment stat blocks. Native PDF illustrations are extracted as lossless WebP with their original transparency. Paired environment illustrations are separated into left/right halves; Poy's two-page illustration is rejoined. Head Vampire / Dire Bat and Castle Siege / Pitched Battle share their source illustration and have explicit captions. The 69 core adversaries without a PDF illustration now use newly generated artwork in `generated/`; the five Sablewood campaign enemies also have original generated illustrations. Social adversaries and environments keep their existing artwork assignments. Generated art is distinguished by `artSource: "generated"` and a separate caption in the expanded view.

No game rules are translated or rewritten. PDF ligature spacing is normalized. The HTML embeds the catalog for portability and references these images using an immutable Git revision.

The 74 transparent PNG illustrations were created with the built-in image generation tool. `generated/generation-manifest.json` records each subject, its description, attack equipment, filename, and the shared prompt recipe. Original PDF artwork and all game statistics remain unchanged.
