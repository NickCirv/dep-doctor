import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fixSafeUpdates } from '../src/fixer.js'
const entry = (name, updateType) => ({name,updateType,current:'1.0.0',wanted:'1.0.1',latest:'1.9.0'})

test('npm update targets only eligible names and never claims latest was installed',async()=>{
 const calls=[]
 const result=await fixSafeUpdates({patch:[entry('one','patch')],minor:[entry('@scope/two','minor')],major:[entry('three','major')],unknown:[]},'/fixture',(args,cwd)=>calls.push({args,cwd}))
 assert.deepEqual(calls,[{args:['update','--','one','@scope/two'],cwd:'/fixture'}])
 assert.equal(result.updated.length,2)
 for(const item of result.updated){assert.equal(item.status,'command-completed');assert.equal(item.installedVersion,null)}
 assert.deepEqual(result.manualReview.map(x=>x.name),['three'])
})
test('unknown-only candidates never trigger npm update',async()=>{
 const result=await fixSafeUpdates({patch:[],minor:[],major:[],unknown:[entry('unknown','unknown')]},'/fixture',()=>assert.fail('unexpected npm mutation'))
 assert.equal(result.updated.length,0);assert.equal(result.skipped.length,1)
})
test('scoped command failure marks requested packages failed rather than updated',async()=>{
 const result=await fixSafeUpdates({patch:[entry('one','patch')],minor:[],major:[],unknown:[]},'/fixture',()=>{throw new Error('fixture failure')})
 assert.equal(result.updated.length,0);assert.equal(result.failed[0].name,'one')
})
