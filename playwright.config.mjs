import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser',fullyParallel:false,workers:2,retries:0,timeout:30000,
 reporter:[['list'],['json',{outputFile:'qa/results.json'}]],
 use:{baseURL:'http://127.0.0.1:4173',browserName:'chromium',trace:'retain-on-failure'},
 projects:[
  {name:'desktop',use:{viewport:{width:1440,height:1000}}},
  {name:'mobile',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1}},
  {name:'narrow',use:{viewport:{width:320,height:800},isMobile:true,hasTouch:true,deviceScaleFactor:1}},
  {name:'tablet',use:{viewport:{width:768,height:1024}}}
 ],
 webServer:{command:'python3 -m http.server 4173 --bind 127.0.0.1 --directory dist',url:'http://127.0.0.1:4173',reuseExistingServer:false}
});
