# NQ Code 1.0.0-alpha.2 — release procedure

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

Run **NQ Code Signed Alpha** manually, after CI/device QA. It verifies secrets, uploads the signed APK as an Actions artifact, and—when triggered by a version tag—creates/updates a **draft pre-release** with the signed APK asset. Publish the draft only after installation and file-I/O testing on an Android device. Never share passwords or `.jks` files. Keep the same signing key for updates to the application ID `dev.nolqu.nqcode`.

Only tag `v1.0.0-alpha.2` after functionality/device tests and successful signing; pushing a `v*` tag also triggers the signing workflow. Do not publish to a store without checking current store and developer verification requirements. See https://developer.android.com/studio/publish/preparing

## Limitations to disclose

No integrated terminal, compiler, Git engine, LSP, debugger or extension marketplace. UTF-8 text only (2 MiB limit); editing a file does not execute it. Auto-save to user documents is intentionally disabled; explicit Save is required. Browser demo is a limited preview, not Android filesystem access.


### Alpha 2 GitHub Release

1. Commit source to `main` and confirm **NQ Code Android CI** is green.
2. Test the debug APK on physical Android devices using `docs/QA.md`.
3. Confirm four GitHub signing secrets are configured. Never share the keystore in chat or commit it.
4. Run `git tag -a v1.0.0-alpha.2 -m 'NQ Code 1.0.0-alpha.2'` followed by `git push origin v1.0.0-alpha.2`.
5. The tag starts signed APK build and creates or updates a **draft GitHub Release** containing `NQ-Code-1.0.0-alpha.2.apk` if signing/build succeeds.
6. Test the signed APK on Android; after passing QA, publish the draft at the GitHub Releases page.

`workflow_dispatch` can build signed APK for verification but will **not** create a GitHub Release without a tag. A failure to sign must block release creation; do not upload a debug APK as a release replacement.
