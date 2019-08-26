#!/usr/bin/env python3
import csv
import os
import json
import shutil
print ('start')
csvfile=open('data/csv/corrected.csv','r')
filename= 'data/json/0.json'
dir = os.path.dirname(filename)
if os.path.exists(dir):
	shutil.rmtree(dir)
os.makedirs(dir)
print ('made directory')
jsonfile=open(filename,'w+')
jsonStr="*json*"
jsonSep="."
jsonStrLen=len(jsonStr)
reader=csv.DictReader(csvfile)
rownum=0
print ('start read')
for row in reader:
	newRow={}
	if(rownum==0):
		i=0
	else:
		for cell in row:
			key=cell
			if cell[:jsonStrLen]==jsonStr:
				#print "!!!!"
				subString=cell[jsonStrLen:]
				dotIndex=subString.index(jsonSep)
				key=subString[:dotIndex]
				nestKey=subString[dotIndex+1:]
				if key not in newRow:
					newRow[key]={}				
				newRow[key][nestKey]=row[cell]
			else:
				newRow[key]=row[cell]
                #print newRow
		json.dump(newRow,jsonfile)
		jsonfile.write('\r\n')
	rownum=rownum+1
