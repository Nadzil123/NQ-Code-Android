#!/usr/bin/env bash
set -euo pipefail

REPO="https://github.com/Nadzil123/NQ-Code-Android.git"
BRANCH="release/1.0.0-alpha.1"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

if command -v gh >/dev/null 2>&1; then
  gh auth setup-git
fi

git clone --depth 1 --branch "$BRANCH" "$REPO" "$WORK"
cd "$WORK"

python3 - <<'PY'
from pathlib import Path
p = Path('app/src/main/java/dev/nolqu/nqcode/MainActivity.java')
s = p.read_text(encoding='utf-8')
needle = '    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {'
annotated = '    @android.annotation.SuppressLint("WrongConstant")\n' + needle
if annotated in s:
    print('Perbaikan Android Lint sudah ada; tidak mengubah file.')
elif s.count(needle) == 1 and s.count('takePersistableUriPermission(uri, flags)') == 2:
    p.write_text(s.replace(needle, annotated, 1), encoding='utf-8')
    print('Perbaikan Android Lint diterapkan.')
else:
    raise SystemExit('Struktur MainActivity.java berubah; hentikan agar tidak menimpa kode yang salah.')
PY

if git diff --quiet -- app/src/main/java/dev/nolqu/nqcode/MainActivity.java; then
  echo 'Tidak ada perubahan untuk di-push.'
  exit 0
fi

git add app/src/main/java/dev/nolqu/nqcode/MainActivity.java
git commit -m "fix(android): suppress SAF URI grant false-positive lint"
git push origin "HEAD:$BRANCH"
echo "Berhasil push. Periksa https://github.com/Nadzil123/NQ-Code-Android/actions"
