# NQ Code 1.0.0-alpha.1 — release procedure

This is a **pre-release candidate**. A successful debug build alone is not a tested, signed release.

## Build verification

- Run **NQ Code Android CI** on the candidate branch.
- Confirm JS contract checks, Android SDK setup, `assembleDebug` and `lintDebug` all pass.
- Download the debug APK from its artifact and perform the device QA in `docs/QA.md`.

## Signed alpha APK

Create a keystore with Android Studio (keep a secure backup and do not commit it). In GitHub repository Settings → Secrets and variables → Actions, add:

| Secret | Description |
| --- | --- |
| `NQ_KEYSTORE_BASE64` | Base64 of the binary keystore (single-line output) |
| `NQ_SIGNING_STORE_PASSWORD` | Password for keystore |
| `NQ_SIGNING_KEY_ALIAS` | Signing key alias |
| `NQ_SIGNING_KEY_PASSWORD` | Signing key password |

Run **NQ Code Signed Alpha** manually, after CI/device QA. It verifies presence of secrets and uploads the signed release APK as an Actions artifact. Never share passwords or `.jks` files. Keep the same signing key for updates to the application ID `dev.nolqu.nqcode`.

Only tag `v1.0.0-alpha.1` after functionality/device tests and successful signing; pushing a `v*` tag also triggers the signing workflow. Do not publish to a store without checking current store and developer verification requirements. See https://developer.android.com/studio/publish/preparing

## Limitations to disclose

No integrated terminal, compiler, Git engine, LSP, debugger or extension marketplace. UTF-8 text only (2 MiB limit); editing a file does not execute it. Auto-save to user documents is intentionally disabled; explicit Save is required. Browser demo is a limited preview, not Android filesystem access.
