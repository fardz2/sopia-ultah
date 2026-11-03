"""Regenerate editable SolidCraft models and their separate animated web parts."""
from pathlib import Path
import json, math, subprocess, sys

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public/landing-pages/birthday-media/world'
CAD = ROOT / 'docs/reference/solidcraft'
LOG = ROOT / '.superpowers/sdd/2026-11-03-full-3d-birthday-world'
for folder in (OUT, CAD, LOG): folder.mkdir(parents=True, exist_ok=True)

def command(command_id, **params): return {'command': command_id, 'params': params}
def box(name, length, width, height, center):
    return command('solid.box', length=length, width=width, height=height, center=center, operation='new', body_name=name, name=name)
def polygon(name, points, offset, thickness):
    return [command('sketch.create', plane='XY', name=name+'Profile', offset=offset),
            command('sketch.line', points=points, closed=True), command('sketch.finish'),
            command('solid.extrude', distance=thickness, operation='new', name=name)]

def build(name, cmds, exports):
    for file, bodies in exports.items():
        cmds.append(command('file.export', path=str(OUT/(file+'.stl')), bodies=bodies, quality='standard'))
    cmds.append(command('inspect.measure', summary=True))
    source=ROOT/'scripts'/('solidcraft-'+name+'.json')
    source.write_text(json.dumps({'commands':cmds},indent=2)+'\n',encoding='utf-8')
    result=LOG/(name+'-measure.json')
    run=subprocess.run(['solidcraft-cli','run',str(source),'--save',str(CAD/(name+'.sc')),'--results','--json-out',str(result)],capture_output=True,text=True,encoding='utf-8')
    if run.returncode:
        print(run.stderr or run.stdout);sys.exit(run.returncode)
    records=json.loads(result.read_text(encoding='utf-8'))
    summary=next(record for record in reversed(records) if isinstance(record,dict) and 'bodies' in record)
    assert all(body.get('closed') for body in summary['bodies']),summary
    print(json.dumps({'model':name,'parts':len(exports),'volume_mm3':summary['total']['volume_mm3']}),flush=True)

cmds=[command('parameters.add',name=n,expression=str(v)+' mm') for n,v in [('W',140),('D',110),('H',70),('wall',1.5),('lid',4)]]
cmds += [box('GiftBase','W','D','H',[0,0,'H/2']),command('solid.shell',body='GiftBase',faces=[[0,0,70]],thickness='wall'),
         box('GiftLid','W + 4','D + 4','lid',[0,0,'H + lid/2']),
         box('RibbonX','W + 4',12,.8,[0,0,'H + lid + .4']),box('RibbonY',12,'D + 4',.8,[0,0,'H + lid + 1.2'])]
for side,label in [(-1,'BowLeft'),(1,'BowRight')]:
    cmds.append(command('sketch.create',plane='XY',offset='H + lid + 1.6',name=label+'Profile'))
    for rx,ry in [(18,12),(14,8)]:
        points=[[f'W * {side*.14 + rx/140*math.cos(i*math.tau/32):.12f}',f'D * {ry/110*math.sin(i*math.tau/32):.12f}'] for i in range(32)]
        cmds.append(command('sketch.line',points=points,closed=True))
    cmds += [command('sketch.finish'),command('solid.extrude',distance=.8,operation='new',name=label)]
    # Name the extruded body deterministically, independent of auto Body counters.
    cmds.append(command('body.rename',body='Body1' if side==-1 else 'Body2',name=label))
build('gift-box',cmds,{'gift-base':['GiftBase'],'gift-lid':['GiftLid'],'gift-ribbon-x':['RibbonX'],'gift-ribbon-y':['RibbonY'],'gift-bow-left':['BowLeft'],'gift-bow-right':['BowRight']})

cmds=[command('parameters.add',name=n,expression=str(v)+' mm') for n,v in [('W',160),('H',112),('paper',.5)]]
cmds += [box('EnvelopeBack','W','H','paper',[0,0,'paper/2'])]
for label,points,z in [
    ('PocketLeft',[['-W/2','-H/2'],['-W/2','H/2'],[0,0]],.6),
    ('PocketRight',[['W/2','H/2'],['W/2','-H/2'],[0,0]],.6),
    ('PocketBottom',[['-W/2','-H/2'],['W/2','-H/2'],[0,'H*.08']],1.1),
    ('EnvelopeFlap',[['-W/2','H/2'],['W/2','H/2'],[0,'-H*.12']],1.7),
]:
    cmds += polygon(label,points,z,'paper')
    counter={'PocketLeft':1,'PocketRight':2,'PocketBottom':3,'EnvelopeFlap':4}[label]
    cmds.append(command('body.rename',body='Body'+str(counter),name=label))
cmds += [box('Letter','W - 16','H - 16',.45,[0,0,.725])]
build('envelope',cmds,{'envelope-back':['EnvelopeBack'],'envelope-pocket':['PocketLeft','PocketRight','PocketBottom'],'envelope-flap':['EnvelopeFlap'],'envelope-letter':['Letter']})

cmds=[command('parameters.add',name=n,expression=str(v)+' mm') for n,v in [('W',108),('H',228),('rim',6),('depth',3)]]
cmds += [box('PhotoFrame','W','H','depth',[0,0,'depth/2']),
         command('solid.box',length='W-2*rim',width='H-2*rim',height='depth+2',center=[0,0,'depth/2'],operation='cut',targets=['PhotoFrame'],name='Window'),
         box('PhotoStand',70,4,50,[0,'-H/2',-20])]
build('photo-frame',cmds,{'photo-frame':['PhotoFrame'],'photo-stand':['PhotoStand']})
