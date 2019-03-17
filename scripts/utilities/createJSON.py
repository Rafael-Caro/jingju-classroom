# -*- coding: utf-8 -*-
"""
Created on Wed Mar 13 16:19:14 2019

@author: Rafael.Ctt
"""

import numpy as np
import os

mbid = '14b9c5d7-d2a2-415c-838c-a4e876e8d895'

with open(os.path.join(mbid, mbid+'-banshi.csv'), 'r', encoding='utf-8') as f:
    banshiData = f.readlines()
    
with open(os.path.join(mbid, mbid+'-lines.tsv'), 'r', encoding='utf-8') as f:
    linesData = f.readlines()

with open(os.path.join(mbid, mbid+'-bangu.csv'), 'r') as f:
    banguData = f.readlines()

banshi = {}

for b in banshiData:
    bs = b.split(',')[0]
    start = str(round(float(b.split(',')[1]), 2))
    end = str(round(float(b.rstrip().split(',')[2]), 2))
    banshi[bs] = {'lines':[], 'strokes':[]}
    banshi[bs]['start'] = start
    banshi[bs]['end'] = end
    
i = 0
for j in range(len(linesData)):
    l = linesData[j]
    start = float(l.split('\t')[1])
    end = float(l.split('\t')[2])
    b = banshiData[i]
    bName = b.split(',')[0]
    bStart = float(b.split(',')[1])
    bEnd = float(b.rstrip().split(',')[2])
    if start >= bStart and end <= bEnd:
        banshi[bName]['lines'].append(j)
    else:
        i += 1
        b = banshiData[i]
        bName = b.split(',')[0]
        banshi[bName]['lines'].append(j)

i = 0
for j in range(len(banguData)):
    bg = banguData[j]
    time = float(bg.split(',')[0])
    bpm = float(bg.split(',')[1])
    bangu = str(round(float(bg.rstrip().split(',')[2]), 1))
    if bangu[-1] == '1' or bangu[-1] == '0':
        bangu = 0
    else:
        bangu = 1
    b = banshiData[i]
    bName = b.split(',')[0]
    bStart = float(b.split(',')[1])
    bEnd = float(b.rstrip().split(',')[2])
    while time > bEnd:
        i += 1
        b = banshiData[i]
        bName = b.split(',')[0]
        bStart = float(b.split(',')[1])
        bEnd = float(b.rstrip().split(',')[2])
    banshi[bName]['strokes'].append([round(time, 2)])
    banshi[bName]['strokes'][-1].append(bpm)
    banshi[bName]['strokes'][-1].append(bangu)
    
for b in banshi.keys():
    if len(banshi[b]['strokes']) > 0:
        print(banshi[b]['start'], ':', banshi[b]['strokes'][0][0], '\t',
              banshi[b]['strokes'][-1][0], ':', banshi[b]['end'])
        
json = ''

for b in banshiData:
    toAdd = '{\n  "name": "",\n'
    bName = b.split(',')[0]
    bs = banshi[bName]
    toAdd += '  "nameChinese": "{}",\n'.format(bName)
    toAdd += '  "start": "{}",\n  "end": "{}",\n'.format(bs['start'],
                          bs['end'])
    toAdd += '  "lines": [{}, {}],\n'.format(bs['lines'][0], bs['lines'][-1])
    toAdd += '  "bangu": ['
    for bg in bs['strokes']:
        toAdd += '\n    {\n      '
        toAdd += '"t": {},\n      "bpm": {}\n'.format(bg[0], bg[1])
        toAdd += '    },'
#    print(bName, toAdd[-2:])
    if toAdd[-2:] == '},':
        toAdd = toAdd.rstrip(',') + '\n  ]\n},\n'
    else:
        toAdd += ']\n},\n'
    json += toAdd

#print(json.rstrip(',\n'))

with open(os.path.join(mbid, mbid+'-banshi.json'), 'w', encoding='utf-8') as f:
    f.write(json.rstrip(',\n'))

#
#finalTxt = ""
#
#for l in data:
#    finalTxt += '{\n'
#    finalTxt += '  "t": ' + l.split(',')[0] + ',\n'
#    finalTxt += '  "bpm": ' + l.split(',')[1] + ',\n'
#    bangu = str(float(l.rstrip().split(',')[2]))
#    print(bangu)
#    if bangu[-1] == 0 or bangu[-1] == 1:
#        finalTxt += '  "bg": 0\n'
#    else:
#        finalTxt += '  "bg": 1\n'
#    finalTxt += '},\n'
#
#with open(os.path.join(mbid, mbid+'-strokes.txt'), 'w') as f:
#    f.write(finalTxt.rstrip(',\n'))
    
#with open(os.path.join(mbid, mbid+'-lines.tsv'), 'r', encoding='utf-8') as f:
#    lines = f.readlines()
#
#finalTxt = ""
#
#for l in lines:
#    finalTxt += '{\n'
#    finalTxt += '  "lyrics": "' + l.rstrip().split('\t')[3] + '",\n'
#    finalTxt += '  "lyricsChinese": "' + l.split('\t')[0] + '",\n'
#    finalTxt += '  "start": ' + str(round(float(l.split('\t')[1]), 2)) + ',\n'
#    finalTxt += '  "end": ' + str(round(float(l.split('\t')[2]), 2)) + '\n'
#    finalTxt += '},\n'
#
#with open(os.path.join(mbid, mbid+'-lines.txt'), 'w', encoding='utf-8') as f:
#    f.write(finalTxt.rstrip(',\n'))