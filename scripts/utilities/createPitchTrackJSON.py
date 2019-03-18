# -*- coding: utf-8 -*-
"""
Created on Sat Mar 16 16:10:46 2019

@author: Rafael.Ctt
"""

import numpy as np
import os

mbid = 'ead85d20-ce7d-4ed0-a00d-0ae199b94d12'

trackDuration = 22000

with open(os.path.join(mbid, mbid+'-bangu.csv'), 'r') as f:
    banguData = f.readlines()

with open(os.path.join(mbid, mbid+'-banshi.csv'), 'r', encoding='utf-8') as f:
    banshiData = f.readlines()

pitchTrack = {}

for i in range(trackDuration):
    pitchTrack[i] = {'bpm': '""', 'bg': ''}
    
scattered = []

for i in range(len(banshiData)):
    start = int(round(float(banshiData[i].split(',')[2]), 2) * 100)
    end = int(round(float(banshiData[i].rstrip().split(',')[3]), 2) * 100)
    for j in range(start, end+1):
        if j < trackDuration:
            if i in scattered:
                pitchTrack[j]['bpm'] = '"s"'
            else:
                pitchTrack[j]['bpm'] = '_'
                
bg0 = 0
bg1 = 0

for i in range(len(banguData)-1):    
    start = int(round(float(banguData[i].split(',')[0]), 2) * 100)
    end = int(round(float(banguData[i+1].split(',')[0]), 2) * 100)
    bpm = int(round(float(banguData[i].split(',')[1])))
    bangu = str(round(float(banguData[i].rstrip().split(',')[2]), 1))
    if bangu[-1] == '0' or bangu[-1] == '1':
        bg = '1'
        bg0 += 1
    else:
        bg = '2'
        bg1 += 1
    for j in range(start, end):
        if pitchTrack[j]['bpm'] == '_':
            pitchTrack[j]['bpm'] = bpm
    for j in range(start, start + 30):
        pitchTrack[j]['bg'] = bg

start = int(round(float(banguData[-1].split(',')[0]), 2) * 100)
bpm = int(round(float(banguData[-1].split(',')[1])))
bangu = str(round(float(banguData[-1].rstrip().split(',')[2]), 1))
if bangu[-1] == '0' or bangu[-1] == '1':
    bg = '1'
    bg0 += 1
else:
    bg = '2'
    bg1 += 1
for j in range(start, start + 30):
    if pitchTrack[j]['bpm'] == '_':
        pitchTrack[j]['bpm'] = bpm
    pitchTrack[j]['bg'] = bg

for i in pitchTrack:
    if pitchTrack[i]['bpm'] == '_':
        pitchTrack[i]['bpm'] = '""'
            
json = '{'
for n in range(trackDuration):
    json += '"{0:.2f}":'.format(n/100)
    json += '{"bpm":' + str(pitchTrack[n]['bpm'])
    bg = str(pitchTrack[n]['bg'])
    if bg == '':
        json += ',"bg":""},'
    else:
        json += ',"bg":' + bg + '},'
json = json.rstrip(',') + '}'
    
with open(os.path.join(mbid, mbid+'-pitchTrack.json'), 'w') as f:
    f.write(json)