import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { run } from '../src/index.js'
const bin = resolve('bin/doctor.js')
function fixture(t, mode = 'findings') {
  const dir = mkdtempSync(join(tmpdir(), 'dep-doctor-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  mkdirSync(join(dir, 'src')); mkdirSync(join(dir, 'tools'))
  writeFileSync(join(dir, 'package.json'), JSON.stringify({name:'fixture-app',version:'1.0.0',dependencies:{used:'^1.0.0',unused:'^1.0.0'}}))
  writeFileSync(join(dir, 'src/main.js'), "import 'used'\n")
  writeFileSync(join(dir, 'tools/npm'), `#!${process.execPath}
const fs = require('node:fs');
fs.appendFileSync(${JSON.stringify(join(dir,'calls'))}, process.argv.slice(2).join(' ')+'\\n');
if (${JSON.stringify(mode)} === 'broken') { console.log('network failure'); process.exit(2) }
if (${JSON.stringify(mode)} === 'invalid-json') { console.log('not JSON'); process.exit(1) }
if (${JSON.stringify(mode)} === 'error-report') { console.log(JSON.stringify({error:{code:'EAI_AGAIN'}})); process.exit(1) }
if (process.argv[2] === 'outdated') console.log(JSON.stringify({used:{current:'1.0.0',wanted:'1.1.0',latest:'1.1.0'}}));
else if(process.argv[2] === 'audit') console.log(JSON.stringify({vulnerabilities:{used:{severity:'high',via:[]}}}));
else { console.error('Mutation not expected'); process.exit(9) }
process.exit(1);
`, {mode:0o755})
  const env={PATH:join(dir,'tools'),HOME:dir,NO_COLOR:'1'}
  return {dir,env,call:(...args)=>spawnSync(process.execPath,[bin,...args],{cwd:dir,env,encoding:'utf8'})}
}
test('CLI help loads real dependency graph and does not invoke npm',t=>{
 const f=fixture(t);const r=f.call('--help');assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/fix/)
})
test('default report wires npm findings and local unused analysis without mutation',t=>{
 const f=fixture(t);const r=f.call();assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/fixture-app/);assert.match(r.stdout,/unused/);assert.match(r.stdout,/high/i)
 const calls=readFileSync(join(f.dir,'calls'),'utf8');assert.match(calls,/outdated --json/);assert.match(calls,/audit --json/);assert.doesNotMatch(calls,/update|uninstall/)
})
test('scan omits audit, and report is an explicit alias',t=>{
 const f=fixture(t);let r=f.call('scan');assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/Scan Complete/);assert.doesNotMatch(readFileSync(join(f.dir,'calls'),'utf8'),/audit/)
 r=f.call('report');assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/Health Score/)
})
test('transport failure cannot become a clean dependency report',t=>{
 const f=fixture(t,'broken');const r=f.call('report');assert.equal(r.status,1);assert.match(r.stderr,/npm outdated failed/);assert.doesNotMatch(r.stdout,/excellent health|No vulnerabilities/)
})
test('missing manifest and unknown command fail clearly',t=>{
 const f=fixture(t);rmSync(join(f.dir,'package.json'));let r=f.call('scan');assert.equal(r.status,1);assert.match(r.stderr,/No package.json/)
 r=f.call('surprise');assert.equal(r.status,1);assert.match(r.stderr,/too many arguments|unknown command/)
})
test('fix requires explicit authorization before scanning',async()=>{
 let calls=0;const status=await run(['node','dep-doctor','fix'],{scanProject:()=>{calls++;throw Error('must not scan')}})
 assert.equal(status,1);assert.equal(calls,0)
})
test('fix --yes never removes heuristically unused packages without separate option',async()=>{
 const calls=[];const services={scanProject:async()=>({outdatedRaw:{},unused:['unused']}),parseOutdated:()=>({}),fixSafeUpdates:async()=>{calls.push('update');return {failed:[]}},removeUnusedDeps:async()=>{calls.push('remove');return {failed:[]}}}
 assert.equal(await run(['node','dep-doctor','fix','--yes'],services),0);assert.deepEqual(calls,['update'])
 assert.equal(await run(['node','dep-doctor','fix','--yes','--remove-unused'],services),0);assert.deepEqual(calls,['update','update','remove'])
})
test('fix failure returns nonzero',async()=>{
 const status=await run(['node','dep-doctor','fix','--yes'],{scanProject:async()=>({outdatedRaw:{}}),parseOutdated:()=>({}),fixSafeUpdates:async()=>({failed:[{name:'used'}]})})
 assert.equal(status,1)
})

test('invalid JSON and npm error objects fail closed',t=>{
 for(const mode of ['invalid-json','error-report']) {
  const f=fixture(t,mode);const r=f.call('report');assert.equal(r.status,1);assert.match(r.stderr,/invalid JSON|usable report/);assert.doesNotMatch(r.stdout,/excellent health|No vulnerabilities/)
 }
})
