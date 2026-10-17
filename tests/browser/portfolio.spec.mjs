import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync} from 'node:fs';
const out='qa/screenshots';mkdirSync(out,{recursive:true});
const routes=['/','/work/','/about/','/recognition/','/contact/','/work/confosense/','/work/apr-dashboard/','/work/hybrid-solar/','/work/roomlab/','/work/quipus/','/work/procurepilot/','/work/gotongflow/','/work/oci-tools/'];
async function imagesReady(page){for(const image of await page.locator('img').all()){await image.scrollIntoViewIfNeeded();await expect(image).toHaveJSProperty('complete',true);expect(await image.evaluate(i=>i.naturalWidth)).toBeGreaterThan(0);}await page.evaluate(()=>window.scrollTo(0,0));}
test('all public pages load images, wrap text and avoid horizontal overflow',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of routes){const response=await page.goto(route);expect(response.status()).toBe(200);await imagesReady(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route).toBe(true);await expect(page.locator('h1')).toBeVisible();if(['/','/work/','/about/','/recognition/','/work/confosense/'].includes(route)){const name=route==='/'?'home':route.split('/').filter(Boolean).join('-');await page.screenshot({path:`${out}/${info.project.name}-${name}.png`,fullPage:true});if(route==='/')await page.screenshot({path:`${out}/${info.project.name}-first-screen.png`});}}
 expect(errors).toEqual([]);
});
test('navigation, mobile menu, current location and browser back work',async({page},info)=>{
 await page.goto('/');const mobile=page.viewportSize().width<=760;
 if(mobile){const menu=page.getByRole('button',{name:'Menu'});await menu.click();await expect(menu).toHaveAttribute('aria-expanded','true');await page.screenshot({path:`${out}/${info.project.name}-menu.png`});await menu.press('Escape');await expect(menu).toBeFocused();await expect(menu).toHaveAttribute('aria-expanded','false');await menu.click();}
 await page.getByRole('navigation').getByRole('link',{name:'Work',exact:true}).click();await expect(page.getByRole('navigation').getByRole('link',{name:'Work',exact:true})).toHaveAttribute('aria-current','location');
 if(mobile)await expect(page.getByRole('button',{name:'Menu'})).toHaveAttribute('aria-expanded','false');
 await page.locator('.project-card-link').first().click();await expect(page).toHaveURL(/\/work\/confosense\/$/);await expect(page.getByRole('navigation').getByRole('link',{name:'Work',exact:true})).toHaveAttribute('aria-current','page');await page.goBack();await expect(page).toHaveURL(/\/#work$/);
 await page.goto('/');await page.getByRole('link',{name:'Get in touch',exact:true}).first().click();await expect(page.getByRole('navigation').getByRole('link',{name:'Contact',exact:true})).toHaveAttribute('aria-current','location');await expect(page.locator('.email-link')).toHaveAttribute('href','mailto:nigeltanjc@gmail.com');
});
test('keyboard access, focus treatment and reduced-motion interaction',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();await page.keyboard.press('Enter');await expect(page.locator('#main')).toBeFocused();
 const send=page.getByRole('button',{name:'Send a signal'});await send.focus();expect(await send.evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');await page.keyboard.press('Enter');await expect(page.locator('#signal-output')).toHaveText('Chips → dependable systems.');await page.keyboard.press('Enter');await expect(page.locator('#signal-output')).toHaveText('Research → better-informed decisions.');expect(await page.locator('.signal-flow').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});
test('accessibility checks include contrast on home and a project page',async({page})=>{
 for(const route of ['/','/work/confosense/','/recognition/']){await page.goto(route);const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(report.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)})),route).toEqual([]);}
});
test('native navigation and content remain usable without JavaScript',async({browser},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:info.project.use.viewport});const page=await context.newPage();await page.goto('http://127.0.0.1:4173/');for(const name of ['Work','About','Recognition','Contact'])await expect(page.getByRole('navigation').getByRole('link',{name,exact:true})).toBeVisible();await page.locator('.project-card-link').first().click();await expect(page).toHaveURL(/\/work\/confosense\/$/);await context.close();
});
test('capture real dashboard with wholly fabricated inputs',async({page},info)=>{
 test.skip(info.project.name!=='desktop','one capture is enough');await page.setViewportSize({width:1200,height:750});await page.goto('/assets/demos/apr-dashboard/dashboard.html');await expect(page.getByText('demo_logic',{exact:true}).first()).toBeVisible();await page.screenshot({path:`${out}/apr-dashboard.png`});
});
