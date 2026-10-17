import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { signalSVG } from '../lib/uncertainty.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export const profile = JSON.parse(readFileSync(path.join(root, 'data/profile.json'), 'utf8'));
export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e = escape;
const arrow = '<span aria-hidden="true">↗</span>';
const link = (url, text, cls='text-link') => `<a class="${cls}" href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(text)} ${arrow}</a>`;

export function art(kind) {
  const pieces = {
    signal: '<path d="M20 133 Q50 88 80 113 T140 103 T200 108 T260 75 T320 100 T380 66 T480 87 L480 151 Q430 137 380 140 T320 158 T260 137 T200 160 T140 153 T80 163 T20 173Z" fill="currentColor" opacity=".16"/><path d="M20 153 Q50 108 80 133 T140 123 T200 128 T260 95 T320 120 T380 86 T480 107" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="323" cy="55" r="5" fill="currentColor"/><path d="M323 64V164" stroke="currentColor" stroke-dasharray="3 5"/>',
    device: '<g transform="translate(195 40) rotate(-15 50 80)"><rect x="0" y="0" width="102" height="170" rx="27" fill="currentColor"/><rect x="7" y="7" width="88" height="156" rx="22" fill="none" stroke="var(--paper)" opacity=".4"/><circle cx="51" cy="108" r="19" fill="none" stroke="var(--paper)"/><circle cx="51" cy="108" r="6" fill="var(--paper)"/><path d="M35 34H67M35 40H67M35 46H67" stroke="var(--paper)"/></g><path d="M120 80Q78 120 120 160M100 60Q38 120 100 180M380 80Q422 120 380 160M400 60Q462 120 400 180" fill="none" stroke="currentColor" opacity=".35"/>',
    dashboard: '<g fill="none" stroke="currentColor"><rect x="65" y="32" width="370" height="177" rx="4"/><path d="M65 61H435M147 61V209M162 140H418"/><rect x="163" y="78" width="73" height="42"/><rect x="252" y="78" width="73" height="42"/><rect x="341" y="78" width="73" height="42"/><path d="M170 187L210 173L246 181L280 156L316 164L352 145L399 155" stroke-width="3"/><path d="M80 84H130M80 101H115M80 118H120"/></g>',
    network: '<g fill="none" stroke="currentColor"><path d="M250 120L110 60M250 120L390 60M250 120L100 185M250 120L400 185M110 60L100 185M390 60L400 185"/><circle cx="250" cy="120" r="35" stroke-width="2"/><circle cx="110" cy="60" r="19"/><circle cx="390" cy="60" r="19"/><circle cx="100" cy="185" r="19"/><circle cx="400" cy="185" r="19"/></g><path d="M237 120L247 130L265 109" stroke="currentColor" stroke-width="3" fill="none"/>',
    molecule: '<g stroke="currentColor" stroke-width="2"><path d="M250 121L155 65M250 121L347 64M250 121L249 207"/></g><g fill="var(--card)" stroke="currentColor" stroke-width="2"><circle cx="250" cy="121" r="37"/><circle cx="155" cy="65" r="22"/><circle cx="347" cy="64" r="22"/><circle cx="249" cy="207" r="18"/></g><g fill="currentColor" text-anchor="middle" font-family="monospace" font-size="17"><text x="250" y="127">C</text><text x="155" y="71">H</text><text x="347" y="70">H</text><text x="249" y="213">H</text></g>',
    flow: '<g fill="none" stroke="currentColor"><path d="M75 120H160V62H290M160 120V183H290M290 62H370V120H430M290 183H370V120"/><rect x="44" y="100" width="60" height="40" rx="6"/><rect x="245" y="42" width="65" height="40" rx="6"/><rect x="245" y="163" width="65" height="40" rx="6"/><circle cx="430" cy="120" r="19" stroke-width="2"/></g>',
    cloud: '<path d="M144 155C79 155 78 78 139 77C151 17 241 13 263 68C320 37 365 65 361 105C426 102 430 165 369 165H144Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M205 105L183 128L205 151M287 105L309 128L287 151M258 99L234 157" fill="none" stroke="currentColor" stroke-width="2"/>',
    solar: '<g fill="none" stroke="currentColor"><circle cx="250" cy="103" r="44" stroke-width="2"/><path d="M250 28V45M250 161V178M175 103H192M308 103H325M197 50L209 62M291 144L303 156M197 156L209 144M291 62L303 50M70 194H430"/><path d="M103 194L134 148H192L218 194M120 170H205M154 148L142 194M176 148L187 194M290 194V150H322V194"/><path d="M280 150H332L306 123Z"/></g>'
  };
  return `<svg class="project-art" viewBox="0 0 500 240" aria-hidden="true"><defs><pattern id="grid-${kind}" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="currentColor" opacity=".14"/></pattern></defs><rect width="500" height="240" fill="url(#grid-${kind})"/>${pieces[kind] || pieces.network}</svg>`;
}

export function renderProjects() {
  return profile.projects.map((p,i)=>`<article class="project-card" id="project-${e(p.id)}" data-project-category="${e(p.category)}" data-search="${e([p.title,p.category,...p.tags,p.summary].join(' '))}">
    <div class="project-visual art-${e(p.visual)}"><span class="project-index mono">${String(i+1).padStart(2,'0')} / ${e(p.year)}</span>${art(p.visual)}<span class="project-status mono">${e(p.status)}</span></div>
    <div class="project-body"><p class="eyebrow">${e(p.category)}</p><h3>${e(p.title)}</h3><p>${e(p.summary)}</p><ul class="tags">${p.tags.map(t=>`<li>${e(t)}</li>`).join('')}</ul>
    <details class="project-detail"><summary>Inside the project <span aria-hidden="true">+</span></summary><div class="detail-content"><h4>The question</h4><p>${e(p.problem)}</p><h4>The approach</h4><p>${e(p.approach)}</p><h4>What it demonstrates</h4><p>${e(p.outcome)}</p><p class="project-note">${e(p.note)}</p></div></details>
    <div class="project-links">${p.repo?link(p.repo,'Source code'):''}${p.link&&p.link!==p.repo?link(p.link,p.linkLabel):''}</div></div></article>`).join('\n');
}
const record = ([title,org,date,category,id], type) => `<li class="record" data-record-category="${e(category)}" data-search="${e([title,org,date,category,id,type==='volunteering'&&org==='Project Management Institute'?profile.pmiRoles.join(' '):''].filter(Boolean).join(' '))}"><div><span class="record-category mono">${e(category)}</span><h4>${e(title)}</h4><p>${e(org)}</p>${id?`<p class="credential-id mono">Credential ID ${e(id)}</p>`:''}</div><span class="record-date mono">${e(date)}</span></li>`;
export function render() {
  let html=readFileSync(path.join(root,'src/template.html'),'utf8');
  const replacements = {
    LAB_SVG:signalSVG(),
    PROJECTS:renderProjects(),
    EXPERIENCE:profile.experience.map((x,i)=>`<article class="experience-row"><div class="experience-date mono">${e(x.date)}</div><div><span class="eyebrow">${e(x.type)}</span><h3>${e(x.role)}</h3><p class="org">${e(x.org)}</p><p>${e(x.description)}</p></div><span class="row-number mono" aria-hidden="true">${String(i+1).padStart(2,'0')}</span></article>`).join(''),
    EDUCATION:profile.education.map(x=>`<article class="education-row"><span class="mini-cross" aria-hidden="true">+</span><div><h4>${e(x.title)}</h4><p>${e(x.org)}</p><span class="mono">${e(x.detail)}</span></div></article>`).join(''),
    AWARDS:profile.awards.map(x=>record(x,'award')).join(''),
    CERTIFICATIONS:profile.certifications.map(x=>record(x,'certification')).join(''),
    VOLUNTEERING:profile.volunteering.map(x=>record(x,'volunteering')).join(''),
    PMI_ROLES:profile.pmiRoles.map(x=>`<li>${e(x)}</li>`).join(''),
    AWARD_COUNT:profile.awards.length,
    CERT_COUNT:profile.certifications.length,
    VOLUNTEER_COUNT:profile.volunteering.length,
    PROJECT_COUNT:profile.projects.length,
  };
  for(const [key,value] of Object.entries(replacements)) html=html.replaceAll(`{{${key}}}`,value);
  if(/\{\{\w+\}\}/.test(html)) throw Error('Unresolved template token');
  return html;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const html=render();
  if(process.argv.includes('--check')) {
    if(readFileSync(path.join(root,'index.html'),'utf8')!==html) throw Error('index.html is stale. Run npm run build.');
    console.log('Generated HTML is current.');
  } else {
    writeFileSync(path.join(root,'index.html'),html);
    console.log('Built index.html from the profile and template.');
  }
}
