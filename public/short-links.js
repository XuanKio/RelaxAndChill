import { PRESETS } from './assets.js';
import { validateScene, packScene, unpackScene, sceneURL } from './share.js';
import { uploadScene, downloadScene } from './cloud-share.js';

const presets = { mochi: PRESETS.mochi, muop: PRESETS.tabby, shy: PRESETS.shy };
const fields = { n:'name', m:'mode', t:'tool', b:'bg', s:'size', f:'soft', x:'flip', z:'subjectScale' };
const styles = { r:'rotation', h:'hue', a:'saturation', l:'brightness' };
function normalize(input) {
  const scene=validateScene(input);
  return {...scene,subjectScale:scene.subjectScale??1,toolStyle:scene.toolStyle??{rotation:scene.tool==='tool.brush'?105:0,hue:0,saturation:100,brightness:100}};
}
export function compactHash(input) {
  const scene=normalize(input);
  if(scene.background||!['tool.hand','tool.brush'].includes(scene.tool))return null;
  const key=Object.keys(presets).find(key=>presets[key].cat===scene.cat);
  if(!key)return null;
  const base=normalize(presets[key]),params=new URLSearchParams();
  for(const [short,field] of Object.entries(fields))if(scene[field]!==base[field])params.set(short,field==='flip'?(scene.flip?'1':'0'):String(scene[field]));
  for(const [short,field] of Object.entries(styles))if(scene.toolStyle[field]!==base.toolStyle[field])params.set(short,String(scene.toolStyle[field]));
  return '#'+key+(params.size?'?'+params:'');
}
export const isCompactHash=hash=>/^#(?:mochi|muop|shy)(?:\?|$)/.test(hash);
export async function readSceneHash(hash) {
  if(hash.startsWith('#s='))return downloadScene(hash.slice(3));
  if(hash.startsWith('#play='))return unpackScene(hash.slice(6));
  if(!isCompactHash(hash))return PRESETS[hash.slice(8)]||PRESETS.mochi;
  if(hash.length>1500)throw new Error('Link quá dài.');
  const [key,query='']=hash.slice(1).split('?'),scene=normalize(presets[key]),params=new URLSearchParams(query),seen=new Set();
  for(const [short,value] of params){
    if(seen.has(short)||!(Object.hasOwn(fields,short)||Object.hasOwn(styles,short)))throw new Error('Thiết lập link không hợp lệ.');
    seen.add(short);
    if(Object.hasOwn(styles,short))scene.toolStyle[styles[short]]=Number(value);
    else{
      const field=fields[short];
      if(field==='flip'&&!['0','1'].includes(value))throw new Error('Hướng dụng cụ không hợp lệ.');
      scene[field]=field==='flip'?value==='1':['size','soft','subjectScale'].includes(field)?Number(value):value;
    }
  }
  return validateScene(scene);
}
export function siteRoot(href) {
  const url=new URL(href);url.search='';url.hash='';
  url.pathname=url.pathname.replace(/\/(?:create(?:\.html)?|p)(?:\/)?$/, '/');
  return url;
}
export async function shareURL(scene,href=location.href){
  const hash=compactHash(scene);
  const url=new URL('p/',siteRoot(href));
  url.hash=hash||'s='+await uploadScene(scene);return url.href;
}
