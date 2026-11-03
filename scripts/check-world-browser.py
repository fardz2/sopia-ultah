from playwright.sync_api import sync_playwright
from pathlib import Path
import argparse,subprocess,time,urllib.request,json,os
parser=argparse.ArgumentParser();parser.add_argument('--case',default='engine');parser.add_argument('--screenshots',action='store_true');args=parser.parse_args()
production=args.case=='production';port=4187 if production else 5191
cmd=['node','node_modules/vite/bin/vite.js']+(['preview'] if production else [])+['--host','127.0.0.1','--port',str(port),'--strictPort']
server=subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
try:
 for _ in range(100):
  if server.poll() is not None:raise RuntimeError(server.stdout.read().decode())
  try:urllib.request.urlopen(f'http://127.0.0.1:{port}',timeout=1);break
  except Exception:time.sleep(.1)
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True);page=browser.new_page(viewport={'width':1440,'height':900});errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.add_init_script("window.__worldDraws=0;for(const key of ['drawElements','drawArrays']){const old=WebGL2RenderingContext.prototype[key];WebGL2RenderingContext.prototype[key]=function(...args){if(this.canvas.id==='birthdayWorldCanvas')window.__worldDraws++;return old.apply(this,args)}}")
  page.set_default_timeout(7000)
  page.goto(f'http://127.0.0.1:{port}/tests/fixtures/world-harness.html',wait_until='networkidle');page.wait_for_selector('[data-world-status="ready"]')
  assert page.locator('canvas').count()==1
  if args.case=='photos':
   page.evaluate("()=>window.__worldSet({unlocked:false,story:{chapter:'gallery',progress:.5}})")
   page.wait_for_function("document.querySelector('canvas').dataset.chapter==='teaser'")
   for chapter in ['frame','iris','gallery','wishes','closing']:
    for progress in [0,.5,1,.2]:
     page.evaluate("([chapter,progress])=>window.__worldSet({unlocked:true,story:{chapter,progress}})",[chapter,progress])
     page.wait_for_function("(chapter)=>document.querySelector('canvas').dataset.chapter===chapter",arg=chapter)
   page.set_viewport_size({'width':768,'height':1024});page.wait_for_load_state('networkidle');page.wait_for_timeout(200)
  page.wait_for_timeout(200);draws=page.evaluate('window.__worldDraws');assert draws>0
  page.wait_for_timeout(200);assert draws==page.evaluate('window.__worldDraws')
  page.locator('#fixtureHide').click();page.wait_for_timeout(150);draws=page.evaluate('window.__worldDraws');page.wait_for_timeout(150);assert draws==page.evaluate('window.__worldDraws')
  page.locator('#fixtureHide').click();page.wait_for_timeout(100)
  page.evaluate("()=>document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()")
  page.wait_for_selector('[data-world-status="failed"]')
  assert not errors,errors
  browser.close();print(json.dumps({'case':args.case,'result':'PASS one context, render/idle/hidden/context-loss lifecycle','errors':errors}))
finally:
 server.terminate()
 try:server.wait(timeout=5)
 except subprocess.TimeoutExpired:server.kill()
