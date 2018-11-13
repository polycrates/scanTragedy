#!/usr/bin/env python3
'''
the point of this script is to take a Perseus xml file as input, clean it up, and output something
that can be easily understood for hand-editing (to add structure, and tag lines with meter).

After hand-editing that file can then be processed with tragedy2html.py to produce an html file
which you can open (using a web server) in a browser, where the syllables will be tagged
with lengths by javascript, and you'll be able to hand correct those in the browser.

Tested with python 3.6.5

Warning: structure of Perseus files isn't always the same. 
This script doesn't attempt to deal with that.

you may need to do "pip install bs4" first
'''

from bs4 import BeautifulSoup
import sys

filename = sys.argv[-1]
soup = BeautifulSoup(open(filename), "lxml")
out = BeautifulSoup(features='xml')

def findParent(self, name=None, attrs={}, **kwargs):
	r = None
	l = self.findParents(name, attrs, 1)
	if l:
		r = l[0]
	return r

lines = soup.find_all("l") # in some files it's "line"

#Note that we don't attempt to import the episode structure from Perseus 
#(because their hierarchy isn't well balanced, "texparts" all over the place)
#makes more sense for us to do that by hand after running this script
#see example file or tragedy2html.py for the expected hierarchy

for line in lines:

	#TODO: fix for xml input without all lines numbered (e.g. 5th lines numbered)
	#this isn't as easy as it might seem: such files will need to be hand edited first,
	#since if Perseus hasn't numbered them, it's not always clear where lines begin 
	#and end (esp. with multiple speaker lines)
	
	num=line["n"] #beware, only works if all lines are numbered
	
	spdiv = findParent(line, "sp")
	try:
		type = findParent(line, "div")['subtype']
	except:
		type = ""
	if type == "episode":
		type = "ia6"
	try:
		speaker = spdiv.find("speaker").text
	except:
		speaker = ""
	content = line.text
	fullcontent = line.decode_contents()
	linetag = out.new_tag("line")
	out.append(linetag)
	linetag["num"] = num
	linetag["speaker"] = speaker
	linetag["type"] = type
	linetag.string = fullcontent

for milestone in out.find_all("milestone"): #we're ignoring milestones
	milestone.decompose()
	
print(out.prettify()) # or just print(out). Call this script with "> myfile.xml" to get an output file.


	
