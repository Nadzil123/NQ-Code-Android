# Changelog

## 1.0.0-alpha.2 — 2026-10-17

### Added
- Offline language-aware lexical highlighting for JavaScript, TypeScript, Python, Java, Kotlin, C, C++, Rust, Go, HTML, XML, CSS, JSON, Markdown, Shell, YAML, SQL, TOML, Dart, and PHP.
- Language override for each tab (status bar), and Go to Line (Ctrl+G).
- Optional automatic bracket/quote pairing for compatible Android keyboard input.
- Editor-managed undo/redo (Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z).
- Offline lexical regression tests and browser smoke checks; package contains no CDN requirements.

### Optimized
- Use animation-frame scheduled highlighting to coalesce redundant renders.
- Skip rich markup above 180,000 characters, preserving editable text while avoiding excessive DOM updates.
- Exclude transient undo/redo history from tab backups and bound history memory by document length.
- Only update line-number gutter when line count changes.

### Known limitations
- Lexer is heuristic, not a full grammar parser/IntelliSense. No LSP, native compiler or terminal.
- Rich highlighting falls back to plain text above 180,000 characters. UTF-8 file limit remains 2 MiB.
- On Android, some IME keyboards may handle paired input differently; testing needed.
- Word wrap can misalign the line gutter, especially on narrow screens.

## 1.0.0-alpha.1 — 2026-10-17

First Android alpha candidate (not a full VS Code replacement).

### Added
- Rename/delete file actions in Explorer, including delete confirmation and unsaved-change guard.
- Optional signed-release GitHub Actions workflow (requires owner-provided signing secrets).
- Node.js UI/native-contract validation and Android lint on CI.
- Device QA checklist and alpha release procedure.

### Improved
- Save completion tracks the specific saved snapshot so later edits stay marked unsaved.
- UTF-8 validation rejects non-text/invalid source instead of silently replacing bytes.
- Preserve UTF-8 BOM and CRLF on edited file writes.
- Throttled local tab backups and demo storage writes.
- WebView navigation/resource restrictions and lifecycle cleanup.
- Version name, version code, SDK 36 CI configuration.

### Known limitations
- Android signing secrets, real-device QA, and CI checks for this candidate are still pending.
- No terminal, compiler, LSP, debugger, Git engine, extensions, or auto-save to files.
- Input limits: UTF-8 text files up to 2 MiB. Browser local backups have smaller limits.
