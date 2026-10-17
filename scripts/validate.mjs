// Lightweight offline smoke contract checks; compilation and device QA remain separate.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read = p => readFileSync(p, 'utf8');
const js=read('app/src/main/assets/app.js');
const html=read('app/src/main/assets/index.html');
const java=read('app/src/main/java/dev/nolqu/nqcode/MainActivity.java');
const language=read('app/src/main/assets/language.js');
const gradle=read('app/build.gradle.kts');
new vm.Script(js,{filename:'app.js'});
new vm.Script(language,{filename:'language.js'});
assert.ok(read('app/src/main/assets/index.html').includes('<script src="language.js"></script>'), 'Lexer bundled offline');
const refs=[...js.matchAll(/\$\('([A-Za-z][\w-]+)'\)/g)].map(x=>x[1]);
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]));
for(const id of new Set(refs)) assert.ok(ids.has(id), `JS references absent DOM id: ${id}`);
for(const method of ['openDocument','openFolder','openUri','listFolder','save','saveAs','create','renameFile','deleteFile']) {
  assert.ok(java.includes(`@JavascriptInterface public void ${method}(`),`Missing native bridge ${method}`);
}
for(const event of ['ready','folderSelected','directory','fileOpened','saved','created','renamed','deleted','saveCancelled','error']) {
  assert.match(js,new RegExp(`\\b${event}\\(`.replace('\\\\','\\')),`Missing frontend native event ${event}`);
}
assert.ok(gradle.includes('versionName = "1.0.0-alpha.2"'));
assert.ok(gradle.includes('compileSdk = 36'));
assert.ok(java.includes('CodingErrorAction.REPORT'));
console.log(`PASS: JS syntax, offline lexer syntax, ${new Set(refs).size} UI IDs, native bridge, version contract`);
