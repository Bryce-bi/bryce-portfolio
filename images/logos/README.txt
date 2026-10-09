"Built with" logos for the hero. The page expects exactly these files:

  lovable.png
  base44.png
  claude-code.svg
  supabase.svg
  openai.png

They are the full brand-colour versions on transparent backgrounds, shown at full
opacity (hover = slight scale-up). OpenAI's mark is monochrome by design (white).
To replace one, overwrite the file with the same name. If you switch a logo
between PNG and SVG, update its src in index.html (search for "BUILT WITH").
If a file is missing, a dashed placeholder with the tool's name shows instead.

Notes on the current SVGs: supabase.svg (#3FCF8E) and claude-code.svg (#D97757)
keep their own brand fill. claude-code.svg's viewBox is trimmed to the mark
(0 4.5 24 15) so it displays at the same height as the other logos; the
artwork and colour are unchanged.
