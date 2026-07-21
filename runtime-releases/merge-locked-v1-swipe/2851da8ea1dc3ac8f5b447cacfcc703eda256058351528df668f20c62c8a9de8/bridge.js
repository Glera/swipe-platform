(()=>{
'use strict';
const E={"artPackHash":"f16fc92e2b966810dd3b3c3f17fda062218e80dcf817fc0f45492dbc66ab571f","sourceHtmlSha256":"sha256:7946cf43a38bed94ea7d3caf43f4569d32a4a17dcc0f2beed7af87f366252281","runtimeContractDigest":"b38af9aa5a66f1599b1fcb7d11facd9ed32be6bd39d1eaaff2487bc6e4a81707","runtimeArtifactDigest":"sha256:2851da8ea1dc3ac8f5b447cacfcc703eda256058351528df668f20c62c8a9de8","specHash":"d3062e3406a6e12b7bf0a733f3bc4a9760008ade39b23f3c518f1c379e8cf8b9"};
const qs=new URL(location.href).searchParams;
const parentOrigin=(()=>{try{const value=new URL(document.referrer).origin;return value&&value!=='null'?value:null}catch{return null}})();
const failure=document.getElementById('failure');
const fail=(reason)=>{try{if(parentOrigin)parent.postMessage({type:'configure_failed',reason},parentOrigin)}catch{}failure.style.display='grid'};
if(!parentOrigin){fail('origin');return}
if(qs.get('level_config')!=='catalog_required'||!(/^[0-9a-f]{64}$/).test(qs.get('expected_spec_hash')||'')){fail('digest');return}
const exact=(o,k)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join('\0')===k.slice().sort().join('\0');
const canon=(v)=>{if(v===null)return'null';if(typeof v==='string')return JSON.stringify(v);if(typeof v==='number'){if(!Number.isFinite(v))throw new Error('number');return JSON.stringify(v)}if(typeof v==='boolean')return v?'true':'false';if(Array.isArray(v))return'['+v.map(canon).join(',')+']';if(typeof v==='object')return'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canon(v[k])).join(',')+'}';throw new Error('type')};
const hex=async(v)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canon(v))))).map(x=>x.toString(16).padStart(2,'0')).join('');
const nonce=Array.from(crypto.getRandomValues(new Uint8Array(16))).map(x=>x.toString(16).padStart(2,'0')).join('');
let terminal=false,child=null,configured=false,innerReady=false,bridgeReady=false;
const forward=(data)=>{try{parent.postMessage(data,parentOrigin)}catch{}};
const ready=()=>{if(configured||!innerReady||!bridgeReady)return;configured=true;terminal=true;clearTimeout(timer);child.dataset.ready='true';forward({type:'configured',appliedSpecHash:E.specHash,runtimeContractDigest:E.runtimeContractDigest,runtimeArtifactDigest:E.runtimeArtifactDigest})};
const timer=setTimeout(()=>{if(!terminal){terminal=true;fail('timeout')}},15000);
addEventListener('message',async(ev)=>{
  if(child&&ev.source===child.contentWindow){
    const data=ev.data;
    if(data&&typeof data==='object'&&data.source==='playable'){
      if(data.type==='catalog_bridge_ready'){bridgeReady=true;ready();return}
      if(data.type==='static_ready'||data.type==='interactive_ready'||data.type==='ready'){innerReady=true;ready()}
      if(configured)forward(data);
    }
    return;
  }
  if(ev.source!==parent||ev.origin!==parentOrigin)return;
  const data=ev.data;
  if(data&&typeof data==='object'&&data.target==='playable-swipe'&&child&&configured){child.contentWindow.postMessage(data,'*');return}
  if(terminal||data?.type!=='configure_level')return;
  try{
    if(!exact(data,['type','nonce','spec'])||data.nonce!==nonce)throw new Error('wire');
    const specValue=data.spec;
    if(!exact(specValue,['schema','specHash','runtimeContractDigest','seed','params'])||specValue.schema!=='merge.raster-level-spec.v1'||specValue.runtimeContractDigest!==E.runtimeContractDigest||specValue.seed!==0||!exact(specValue.params,['artifactClass','artPackHash','sourceRuntimeArtifactDigest','sourceHtmlSha256','templateContractDigest','compilerDigest','providerPolicyDigest','qaReportDigest','sourceQaEvidenceHash','gameplayFingerprint','presentationFingerprint'])||specValue.params.artifactClass!=='merge-raster-art-v1'||specValue.params.artPackHash!==E.artPackHash||specValue.params.sourceHtmlSha256!==E.sourceHtmlSha256||await hex({schema:specValue.schema,runtimeContractDigest:specValue.runtimeContractDigest,seed:specValue.seed,params:specValue.params})!==specValue.specHash||specValue.specHash!==E.specHash||specValue.specHash!==qs.get('expected_spec_hash'))throw new Error('spec');
    child=document.createElement('iframe');child.setAttribute('sandbox','allow-scripts');child.src='inner.html';document.getElementById('mount').appendChild(child);
  }catch{terminal=true;clearTimeout(timer);fail('contract')}
});
forward({type:'configure_ready',nonce,runtimeContractDigest:E.runtimeContractDigest,runtimeArtifactDigest:E.runtimeArtifactDigest});
})()