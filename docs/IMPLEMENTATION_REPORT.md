# Implementation report — NQ Code 1.0.0-alpha.2

## Baseline
Based on the 1.0.0-alpha.1 source ZIP provided in the conversation and inspected against the public `main` branch. The current `main` included an Android Lint suppression for SAF URI grants; that fix is included here.

## Technology decision
Kept the existing textarea + overlay architecture and introduced `language.js`, a dependency-free lexical scanner with individual language keyword/comment rules. A CodeMirror 6 migration was evaluated conceptually but deferred: it would require adding a bundling toolchain and language packages, as well as refactoring input and tab persistence. Without Android device benchmarks, it is not justified to claim that migration would be faster. The lexer is not a full parser, and does not promise semantic highlighting.

## Completed
- Version name/code: 1.0.0-alpha.2 / 3
- 21 language modes with manual override, safe HTML-escaped output
- Coalesced highlighting and plain-text fallback beyond 180,000 characters
- Go to Line, undo/redo session history, optional bracket/quote pairing
- Excluded undo/redo history from localStorage snapshots to limit storage use
- Android CI lexical tests and signed-tag draft GitHub Release automation
- Updated README, changelog, release notes, and QA checklist

## Verified locally
- Node syntax check and JS/native/UI/version contract validator: passed
- Offline language lexer tests: passed (21 modes)
- `bash -n push-alpha2-main.sh`: passed
- GitHub workflow YAML parser: passed
- ZIP archive integrity: passed
- Node lexical processing benchmark: ~35–55 ms for ~100k characters in the working container; not an Android speed measurement

## Not verified
- Android `assembleDebug`, Android Lint and signed release for alpha.2 (no SDK/Gradle runner here)
- Android input-method/editor interaction and filesystem operations on a device
- Browser UI smoke screenshot (headless Chromium did not initialize successfully in this environment)
- Push to GitHub or publication of an alpha.2 Release (connected GitHub write operations previously returned 403)

## Follow-up
Build in Actions from `main`, test the debug APK on an actual Android device, check the QA cases, then tag `v1.0.0-alpha.2`. The signing workflow creates a draft pre-release; publish it only after confirming a valid signed asset and device tests.
