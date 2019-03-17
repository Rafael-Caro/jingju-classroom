# -*- coding: utf-8 -*-
"""
Created on Wed Mar 13 14:52:36 2019

@author: Rafael.Ctt
"""

import essentia
import essentia.standard as es
import numpy as np
import os

mbid = '14b9c5d7-d2a2-415c-838c-a4e876e8d895'

data = np.genfromtxt(os.path.join(mbid, mbid+'-aria.csv'), delimiter=',')

loader = es.MonoLoader(filename='ban.mp3')
ban = loader()

loader = es.MonoLoader(filename='gu.mp3')
gu = loader()

loader = es.MonoLoader(filename=os.path.join(mbid, mbid+'-acc.mp3'))
acc = loader()

new = np.zeros(acc.size)

for i in range(len(data)):
    start = int(round(data[i, 0] * 44100))
    if str(data[i,2])[-1] == '0' or str(data[i,2])[-1] == '1':
        end = start + ban.size
        new[start:end] = ban
    else:
        end = start + gu.size
        new[start:end] = gu

newFile = os.path.join(mbid, mbid+'-bangu.wav')
es.MonoWriter(filename=newFile)(essentia.array(new))

newFile = os.path.join(mbid, mbid+'-bangu.mp3')
es.MonoWriter(filename=newFile, format='mp3')(essentia.array(new))