# NQ Code 1.0.0-alpha.2

Android code editor — **experimental pre-release**. This release is for device testing, not production-critical files.

## Improvements
- Offline language-aware syntax coloring for 21 language modes, with manual per-tab override.
- Go to Line (Ctrl+G), custom undo/redo (Ctrl+Z, Ctrl+Y/Ctrl+Shift+Z), and optional bracket/quote auto-pairing.
- Coalesced repaint work with animation frames and plain-text fallback for very large documents.
- Smaller tab backups by excluding transient undo history.
- CI lexical regression checks and draft GitHub Release workflow for APK signed with existing key.

## Supported editing and limitations
- JavaScript, TypeScript, Python, Kotlin, Java, C, C++, Rust, Go, HTML, XML, CSS, JSON, Markdown, Shell, YAML, SQL, TOML, Dart, and PHP are lexer modes, **not full language parsers**.
- Syntax highlighting falls back to plain text above 180,000 characters. Files are restricted to valid UTF-8, up to 2 MiB.
- No integrated terminal, compiler, language server, Git engine, or extension marketplace.
- Use the system file picker for Android documents and explicitly save changes.
- Android IME and real-device QA must be completed before publishing this draft.

See `CHANGELOG.md` and `docs/QA.md` for testing requirements.
