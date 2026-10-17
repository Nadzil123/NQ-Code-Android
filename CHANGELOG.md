# Changelog

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
