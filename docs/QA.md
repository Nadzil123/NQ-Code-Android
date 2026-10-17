# NQ Code alpha device QA checklist

Mark each item after testing on a physical Android device, not just in a browser.

- [ ] Install debug APK and launch offline.
- [ ] Open a user-selected project folder (SAF), browse subfolders, reopen after app restart.
- [ ] Open UTF-8 files (Kotlin/JS/JSON/Python), edit and save, verify bytes using another app.
- [ ] Test CRLF and UTF-8 BOM round-trip; ensure original line ending and BOM survive editing.
- [ ] Try invalid UTF-8 and binary files: editor refuses to open without corrupting them.
- [ ] Save As creates a new file; cancelling does not modify the original.
- [ ] Type while an asynchronous Save is in progress: tab remains dirty if newer edits were not saved.
- [ ] Rename a saved text file and verify the tab and explorer update.
- [ ] Delete a saved text file with confirmation; verify file removed and tab closed.
- [ ] Attempt to delete a modified open file: operation is blocked.
- [ ] Create files and folders, refresh explorer, and reopen nested documents.
- [ ] Test find, replace-all, command palette, toolbar, keyboard Ctrl+S/O/F/P.
- [ ] Rotate the device, background/restore the app, verify unsaved buffers.
- [ ] Test small phone and large screen/tablet, dark and light theme.
- [ ] Run Android lint and build release with signing secrets; verify signed APK installs.

Known limitations: large unsaved buffers may exceed WebView local storage quota; always explicitly save edits. SAF permissions and rename/delete support vary by document provider. Do not select storage root or Download root where Android disallows folder grants.


## Alpha 2 acceptance checks

- [ ] Syntax highlight JS/TS, Kotlin/Java, Python, Rust, C/C++, HTML/CSS/JSON, Markdown and Shell sample files on device.
- [ ] Select language override on one tab; switch tabs and confirm each retains its own override.
- [ ] Verify script tags pasted in the editor render as harmless text rather than executing.
- [ ] Test Ctrl+G with a physical keyboard and command palette for Go to Line.
- [ ] Test Undo/Redo for typing, paste, replacement, auto-pairing and tab switching.
- [ ] Test auto-pair with Gboard and at least one other keyboard; disable in Settings if IME misbehaves.
- [ ] Open UTF-8 with BOM and CRLF; edit/save/reopen and compare bytes; verify error handling for non-UTF-8.
- [ ] Open near-limit files (>=180000 characters): no freeze; plain-text highlight fallback, saved file intact.
- [ ] Compare scroll and input responsiveness on Android with alpha.1 and alpha.2 (device measurements).
- [ ] Signed APK installs and edits files with user-granted SAF access; updates from alpha.1 preserve app data and signature.
