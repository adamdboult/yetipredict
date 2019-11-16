#!/usr/bin/env python3

####################
# Import libraries #
####################
import csv
import os
import codecs
import shutil
import sys
import json

#############
# Variables #
#############
dir = os.path.dirname(__file__)

jsonStr = "*json*"
jsonSep = "."
jsonStrLen = len(jsonStr)

#############
# Functions #
#############

####
# Can a variable be converted to float?
####
def isFloat(value):
	try:
		float(value)
		return True
	except ValueError:
		return False

####
# Decode
####
def _decode_list(input_list):
    rv = []
    for item in input_list:
        if isinstance(item, unicode):
            item = item.encode('utf-8')
        elif isinstance(item, list):
            item = _decode_list(item)
        elif isinstance(item, dict):
            item = _decode_dict(item)
        rv.append(item)
    return rv

def _decode_dict(input_dict):
    rv = {}
    for key, value in input_dict.iteritems():
        if isinstance(key, unicode):
            key = key.encode('utf-8')
        if isinstance(value, unicode):
            value = value.encode('utf-8')
        elif isinstance(value, list):
            value = _decode_list(value)
        elif isinstance(value, dict):
            value = _decode_dict(value)
        rv[key] = value
    return rv

######################
# Load config object #
######################
configPath = os.path.join(dir, "private/config.json")

with open(configPath) as data_file:
    configObj = json.load(data_file)

folder = configObj["data"]["folder"]

########################
# Load settings object #
########################
data = open(folder + 'settings.json')
jsonstring=data.read()

json_data = json.loads(jsonstring)
#json_data=json.loads(jsonstring, object_hook=_decode_dict)

csvdelimiter	= json_data["delimiter"]
encoding	= json_data["encoding"]
cutOff		= json_data["cutOff"]
scaleObject	= json_data["scale"]
noteArray	= json_data["noteArray"]
filterArray	= json_data["filterArray"]
subjectArray	= json_data["subjectArray"]
favArray	= json_data["favArray"]
headerAppend	= json_data["headerAppend"]
scaleRow	= json_data["scaleRow"]
rowAppend	= json_data["rowAppend"]

####
# Interpret CSV delimiter settings
####
if csvdelimiter == 'tab':
	useDelimiter='	'
else:
	useDelimiter =','

######################
# Set up destination #
######################
filename = 'data/csv/corrected.csv'
dir = os.path.dirname(filename)
if os.path.exists(dir):
	shutil.rmtree(dir)
os.makedirs(dir)
b = open(filename, 'w')
a = csv.writer(b, delimiter = ',')

############
# Load CSV #
############
csvFileName = configObj["data"]["name"]

with open(folder + csvFileName,'r', encoding=encoding) as csvfile:

	reader = csv.reader(csvfile, delimiter = useDelimiter)


	origin = []
	target = []

	for entry in subjectArray:
		origin.append(entry[0])
		target.append(entry[1])

	rownum = 0
	#print (reader)
	for row in reader:
		#print (row)
		writeBin = 1
		cellnum = 0
		#for cell in row:
		#	row[cellnum] = cell.encode('utf-8')
		#	#row[cellnum]=cell.decode(encoding).encode('utf-8')
		#	cellnum = cellnum + 1
		if rownum == 0:
			cellnum = 0
			for cell in row:
				#print (cell)
				if cell.isdigit():
					row[cellnum] = "*json*data." + row[cellnum]
				if cell in noteArray:
					row[cellnum] = "*json*note." + row[cellnum]
				if cell in filterArray:
					row[cellnum] = "*json*filter." + row[cellnum]
				cellnum = cellnum + 1
			for header in headerAppend:
				row.append(header)
			headers = row
		elif rownum < cutOff:
			for cell in rowAppend:
                                val = ""
                                for part in cell:
                                        #print type(part)
                                        if type(part) is str:
                                                val += part
                                        else:
                                                val += row[part]
                                row.append(val)
			row.append(target[origin.index(row[4])])
			for index, cell in enumerate(row):
				if  headers[index][:jsonStrLen]==jsonStr:
					subString=headers[index][jsonStrLen:]
					dotIndex=subString.index(jsonSep)
					key=subString[:dotIndex]
					if key == "data":
						rowScale = row[scaleRow]
						if isFloat(cell.replace(',',''))==1:
							row[index]=float(cell.replace(',',''))*scaleObject[rowScale]
			if rownum in favArray:
				row.append(1)
			elif rownum<cutOff:
				row.append(0) 
		else:
			writeBin = 0
		#print (row)
		if writeBin == 1:
			a.writerow(row)
		rownum = rownum+1
	b.close()

exec(open('csvtojson.py').read())

