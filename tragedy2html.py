#!/usr/bin/env python3

'''
This script processes an xml file which has lines of verse tagged with meter and produces html output.
I use fixTragedy.py to process a Perseus xml file, the result of which I then hand-edit to
add meter tags (e.g. type="ia6") etc. For the format of the file, see the example, prometheusDC.xml
and see comments below.

This script relies on the cltk modules, which can be installed with "pip install cltk"
and beautifulsoup ("pip install bs4"). If you're not used to Python, bear in mind that
you need the modules to be installed for the version of python you use to call this script.

The script expects to find the template file "header.txt" in the same directory

To get an output file, call the script like so:
python3 tragedy2html.py myxmlfile.xml > myhtmlfile.html

You can then open that html file in a browser, where the syllables will be tagged with lengths,
and you can use some simple editing functions (in the browser) to make corrections. The reason
I don't do this in python is 1) the browser offers a readymade GUI for editing, 2) my final 
product is html, and the pages I publish use a lot of the scansion code from the editing page.

Note that you'll need to use a web server of some kind to access that page, otherwise edits
won't be saved. The server needs a working php installation (the saving is done by
saver.php). For most the simplest solution is to use something like MAMP/LAMP (www.ampps.com)

In a pinch you can open the file from the filesystem and use the browser's dev tools to copy and paste
the edited source. Not recommended.

If the file is served properly, the browser will save your work to something like myhtmlfile_save.html.
Check that this is happening before you put in any significant work.

If you don't load the save file when the page asks you to, you will overwrite previous work.
By all means make copies of the save file between work sessions!

If you choose to load the editing page from a public web server, please be sure you know what
you're doing: I make no guarantees as to the security of the js functions.

The save file just has the contents of the Greek div. You can produce a usable html file, if
that's your purpose, by inserting it into finalTemplate.html, which will call metre.js 
to manage displaying the metrical patterns.
Otherwise you can use a parser like beautifulsoup on the save file to access and manipulate 
the data you've produced in this process, perhaps to convert it to sql or csv format. 
If you're not familiar with bs, this script should give you a good idea of how to use 
it to access the data.
'''

import re
from cltk.corpus.utils.formatter import cltk_normalize
from greek_accentuation import *
from greek_accentuation.characters import *
from greek_accentuation.syllabify import syllabify, display_word
#import shelve		#these two are used by checkword, which we're not using right now
#from cltk.stem.lemma import LemmaReplacer
from bs4 import BeautifulSoup
import sys

#db = shelve.open("macronGk.db", "r") # this is for checking long sylls in checkword(): not working well atm
infile=sys.argv[1]
#lemmatizer = LemmaReplacer('greek')

soup = BeautifulSoup(open(infile), "lxml")
template = BeautifulSoup(open("header.txt"),"lxml") # edit the header file if you want to change css etc.
out = template.find("body").find("div") # we assume there is a single div in the template
#longs = open(infile+"_longs.txt","w") # used by checkword. just for manually checking stuff afterwards, not really needed

def normalit(line): #cltk stuff doesn't do well with diaereses
	line = cltk_normalize(line)
	line = re.sub(r"ἠύ","ἠ-ύ",line)
	line = re.sub(r"ἠὺ","ἠ-ὺ",line)
	line = re.sub(r"ἠυ","ἠ-υ",line)
	line = re.sub(r"ῆυ","ῆ-υ",line)
	line = re.sub(r"Ἀί","Ἀ-ί",line)
	line = re.sub(r"έι","έ-ι",line)
	line = re.sub(r"άι","ά-ι",line)
	line = re.sub(r"ἐυ","ἐ-υ",line)
	line = re.sub(r"ἐύ","ἐ-ύ",line)
	line = re.sub(r"Ἀι","Ἀ-ι",line)
	line = re.sub(r"ἄι","ἄ-ι",line)
	line = re.sub(r"ἀί","ἀ-ί",line)
	line = re.sub(r"ὀί","ὀ-ί",line)
	line = re.sub(r"ἀυ","ἀ-υ",line)
	line = re.sub(r"ὀι","ὀ-ι",line)
	line = re.sub(r"ἄυ","ἄ-υ",line)
	line = re.sub(r" ̓", "᾽", line)
	return(line)
def checksylls(arr): # the cltk/tauber magic is not perfect :-)
	
	line="@".join(arr)
	line=line.replace("-","+") # need to preserve hyphens
	line=line.replace("@","-")
	
	newline = re.sub(r"- ", " ", line)
	newline = re.sub(r" -", " ", newline)
	newline = re.sub(r"-_", "_-", newline) # long marks come after vowel
	newline = re.sub(r'"-', r'"', newline) # syllabifier sometimes treats " as a syll
	newline = re.sub(r"'-", r"'", newline)
	newline = re.sub(r'\(-', r'(', newline) #same prob with parentheses
	newline = re.sub(r'-\)', r')', newline)
	
	newline = re.sub(r"\b([Ττ])-λ", r"\1λ", newline) #don't separate cons. clusters at start of word
	newline = re.sub(r"\b([χΧ])-θ", r"\1θ", newline)
	newline = re.sub(r"\b([δΔ])-ν", r"\1ν", newline)
	newline = re.sub(r"\b([χΧ])-ν", r"\1ν", newline)
	newline = re.sub(r"\b([χΧ])-θ", r"\1θ", newline)
	newline = re.sub(r"\b([δΔ])-μ", r"\1μ", newline)
	newline = re.sub(r"\b([πΠ])-τ", r"\1τ", newline)
	newline = re.sub(r"\b([κΚ])-τ", r"\1τ", newline)
	newline = re.sub(r"\b([τΤ])-μ", r"\1μ", newline)

	newline = re.sub(r" ([κγμσχτῥδθ])᾽([,·]*) ", r" \1᾽\2", newline)
	newline = re.sub(r" ([κγμσχτῥδθ])ʼ([,·]*) ", r" \1᾽\2", newline)

	newline = re.sub(r"--", "-", newline)
	newline = re.sub(r"}-", "}", newline)
	newline = re.sub(r"-}", "}", newline)
	newline = re.sub(r"\[-", "[", newline)
	newline = re.sub(r"\b(.ʼ)-", r"\1", newline)
	newline = re.sub(r"\b(.)-ʼ", r"\1ʼ", newline)
	
	newline = re.sub(r"ἠύ","ἠ-ύ",newline)
	newline = re.sub(r"ἠὺ","ἠ-ὺ",newline)
	newline = re.sub(r"ἠυ","ἠ-υ",newline)
	newline = re.sub(r"ῆυ","ῆ-υ",newline)
	newline = re.sub(r"Ἀί","Ἀ-ί",newline)
	newline = re.sub(r"έι","έ-ι",newline)
	newline = re.sub(r"άι","ά-ι",newline)
	newline = re.sub(r"ἐυ","ἐ-υ",newline)
	newline = re.sub(r"ἐύ","ἐ-ύ",newline)
	newline = re.sub(r"Ἀι","Ἀ-ι",newline)
	newline = re.sub(r"ἄι","ἄ-ι",newline)
	newline = re.sub(r"ἀί","ἀ-ί",newline)
	newline = re.sub(r"ὀί","ὀ-ί",newline)
	newline = re.sub(r"ἀυ","ἀ-υ",newline)
	newline = re.sub(r"ὀι","ὀ-ι",newline)
	newline = re.sub(r"ἄυ","ἄ-υ",newline)
	newline = re.sub(r" ̓", "᾽", newline)

	newline=newline.rstrip()
	newarr=newline.split("-")
	return(newarr)
def checkword(word): #this should check a word against the db of macronized words, but seems to be not working
	matches=[]
	try:
		lemma=lemmatizer.lemmatize(word)[0]
	except:
		lemma=""
	try:
		macroned=db[lemma]
		longs.write(macroned+" : "+ word + str(num)+"\n") # in case we want to check what we found
		macsylls=syllabify(macroned)
		regsylls=syllabify(word)
		for syll in macsylls:
			thisnum=macsylls.index(syll)
			for letter in set(macronized):
				match=syll.count(letter)
				if match > 0:
					matches.append(thisnum)
					mybase=base(letter)
					regsylls[thisnum]=regsylls[thisnum].replace(mybase, mybase+"_")
					word=''.join(regsylls)
	except:
		macroned=""
	return word
	
#the following code relies on a predictable structure in the xml: section > subsection > line > speaker
#each section must have a form attribute, speakers must have names, etc.
#each line must be part of a subsection, and must contain at least one speaker element.
#if you want to use a different hierarchy, you'll need to edit the structure here too.
#Note that fixtragedy.py doesn't attempt to import the episodes etc from Perseus 
#(because their hierarchy isn't well balanced, "texparts" all over the place)

sections = soup.find_all("section")
for section in sections:
	sectype=section["type"]
	secform=section["form"]
	new_sec = template.new_tag("div")
	out.append(new_sec)
	new_sec['class'] = "section"
	new_sec['data-type']=sectype
	new_sec['data-form']=secform
	
	subs=section.find_all("subsection")
	for sub in subs:
		subtype=sub["type"]
		new_sub = template.new_tag("div")
		new_sec.append(new_sub)
		new_sub['class']="subsection"
		new_sub['data-type']=subtype

		lines = sub.find_all("line")
		for line in lines:
			try:
				meter=line["type"]
			except:
				meter=""
			try:
				number=line["num"]
			except:
				number=""
				
			new_line = template.new_tag("div")
			new_sub.append(new_line)
			new_line["class"]="line"
			new_line["data-metre"]=meter
			new_line["data-number"]=number

			#add line notes here; copy this for any other element that has notes
			try:
				new_line["data-note"]=line["note"] 
			except:
				pass
	

			speakers = line.find_all("speaker")
			#if you've correctly edited the input file, lines with multiple speakers will be handled here
			for speaker in speakers:
				name=speaker["name"]
				
				#below we deal with <add> and <del>. Other tags in the greek text are ignored for now.
				adds = speaker.find_all("add")
				for add in adds:
					addtxt=add.text
					add.string="<"+addtxt+">"


				dels = speaker.find_all("del") #we won't usually leave these in, since they mess up the meter
				for delete in dels:
					deltxt=delete.text
					delete.string="["+deltxt+"]"
					
				text=speaker.text 
				
				text=re.sub(r"\b(.ʼ) ", r" \1", text)
				text=re.sub(r"\b(.ʼ,) ", r" \1", text)
				new_spk = template.new_tag("span")
				new_line.append(new_spk)
				new_spk["class"]="speech"
				new_spk["data-speaker"]=name		

				#text = normalit(text)
				newsylls=""
				for word in text.split():
				
					#check for long vowels here (not working????)
					#the js scanner underlines short anceps vowels, so it's pretty easy to check manually
					#and in lyric these are recognized when the meter is determined
					#commenting out because it requires importing shelve and having the right gdbm installed
					#word=checkword(word)
		
					#make a span for the word:
					new_word = template.new_tag("span")
					new_spk.append(new_word)
					new_word["class"]="word"
					wordarr=syllabify(word) 	# cltk/tauber magic
					wordarr=checksylls(wordarr)	# cltk/tauber magic
					
					#read sylls into spans inside the word:
					nexth=0 
					nextlt=0
					for syll in wordarr:
						syll=syll.replace("+","-") #add hyphens back in
						
						if nexth == 1: #prev syll was only a hyphen, add it here
							syll="-"+syll
							nexth=0 
						
						if syll == "-": # add hyphen to next syll
							nexth=1
							continue
							
						if nextlt == 1: #as above, but for adds
							syll="<"+syll 
							nextlt=0
						
						if syll == "<": # change <add> to angle brackets; catches tags outside a speaker
							nextlt=1
							continue
						
						#add back a space after elision:
						syll=re.sub(r"\b(.ʼ)", r"\1 ", syll)
						syll=re.sub(r"\b(.ʼ) ,", r"\1, ", syll)

						new_syll = template.new_tag("span")
						new_word.append(new_syll)
						new_syll["class"]="syll"
						new_syll.string=syll
						
#now run the loop *on the template* to check for adds and dels
adding=0
deleting=0
newsylls=template.find_all("span", {"class": ["syll"]})

for syll in newsylls:
	text=syll.text
	if text[0]=="<":
		adding=1
	if adding==1:
		syll["class"]="syll added"
	if text[-1]==">":
		adding=0
		
	if text[0]=="[":
		deleting=1
	if deleting==1:
		syll["class"]="syll deleted"
	if text[-1]=="]":
		deleting=0
	
	if text[0]=="-":
		syll["class"]="syll split2"
	if text[-1]=="-":
		syll["class"]="syll split1"

#print(template.prettify()) #this produces one line per syllable, which isn't really ideal
print(template)	 # if you call this script with " > myfile.html", you'll get an output file	

				
		
	