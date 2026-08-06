const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const ideas=read('data/ideas.json'), sources=read('data/sources.json'), ranks=read('data/rankings.json'), prompts=read('data/prompts.json'), rels=read('data/relationships.json');
const errors=[],warnings=[]; const ids=new Set(),slugs=new Set(),sourceIds=new Set(sources.map(x=>x.id));
const required=['id','slug','name','atAGlance','customer','product','futureAiBuild','profitability','market','validation','goToMarket','operations','risks','actionPlan','scores','compositeScores','sourceReferences'];
for(const x of ideas){for(const k of required)if(!(k in x))errors.push(`${x.id||'?'} missing ${k}`);if(ids.has(x.id))errors.push(`duplicate id ${x.id}`);ids.add(x.id);if(slugs.has(x.slug))errors.push(`duplicate slug ${x.slug}`);slugs.add(x.slug);if(!/^idea-\d{3}$/.test(x.id))errors.push(`bad id ${x.id}`);if(Object.keys(x.scores||{}).length!==25)errors.push(`${x.id} score count`);for(const s of x.sourceReferences||[])if(!sourceIds.has(s))errors.push(`${x.id} missing source ${s}`);const md=path.join(root,'ideas',x.slug+'.md');if(!fs.existsSync(md))errors.push(`missing dossier ${x.slug}`);const pack=path.join(root,'prompts','idea-specific',x.id);if(!fs.existsSync(pack))errors.push(`missing prompt pack ${x.id}`);else{const n=fs.readdirSync(pack).filter(f=>f.endsWith('.md')&&f!=='README.md').length;if(n!==25)errors.push(`${x.id} has ${n} prompts`)}}
for(const r of ranks)for(const it of r.items)if(!ids.has(it.ideaId))errors.push(`ranking ${r.id} unknown ${it.ideaId}`);
for(const e of rels)if(!ids.has(e.source)||!ids.has(e.target))errors.push(`bad relationship ${e.source} ${e.target}`);
const ideaPrompts=prompts.filter(p=>p.ideaId);
if(ideaPrompts.length!==ideas.length*25)errors.push(`idea prompt index ${ideaPrompts.length} expected ${ideas.length*25}`);
if(prompts.length<ideaPrompts.length)errors.push('total prompt index cannot be smaller than idea prompt count');
console.log(JSON.stringify({ideas:ideas.length,sources:sources.length,rankings:ranks.length,prompts:prompts.length,errors,warnings},null,2));if(errors.length)process.exit(1);
