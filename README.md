# scanTragedy
Tools for producing metrically tagged versions of Greek tragedy, starting with Perseus xml.

# Requirements:
1. A python3 installation with the following modules installed:
  - BeautifulSoup ("pip install bs4")
  - Cltk ("pip install cltk") <-- classical language toolkit (http://cltk.org/)
  - James Tauber's Greek Accentuation ("pip install greek-accentuation"). 
      
  
2. For the last stage of editing, you need a web server with php working. For most the simplest solution is to use something like MAMP/LAMP (e.g. www.ampps.com, www.mamp.info/en/, https://bitnami.com/stack/wamp/installer, etc.)

# Disclaimer:
These materials are shared as is. I am very much an amateur coder, and my purpose is to produce a database of scanned verse, not a set of tools. You will find much that is redundant, poorly organized, or even insecure here. Use at your own risk and don't run anything as root! If you want to offer advice and improvements to functionality, I'll be interested to see what you come up with; but bear in mind that these tools are intended to obsolete themselves: they aren't making any more Greek tragedy, so once it's scanned, we're done.

# Results:
See https://hypotactic.com for poetry scanned using various versions of these tools. Those files may at some point find their way to a git repository.

# Workflow:
Read comments and headers in the main script files for usage notes.

1. If you're starting with a Perseus xml file, you can use fixTragedy.py to turn it into something simpler, which you can then hand-edit in preparation for running through tragedy2html.py. For instance, "python3 fixTragedy.py unwieldyandopaqueperseusfilename0000.xml > oedipusfixed.xml". This has worked on the files I've tried so far, but I can't guarantee it will work for all Perseus files.

2. Edit the resulting xml by hand in a good text editor. This is the stage where you'll tag each line with a meter. You can do this quickly for iambic etc. if you know how to search and replace (watch out for catalectic anapaests). Tagging lyric takes time, research and effort. Once you've done this, you probably only have a few hours work left.
- tragedy2html.py expects this xml file to have a certain hierarchy, which you can glean from comments in that script, and from looking at the example file prometheusDC.xml. If you want to use a different hierarchy, you can of course edit the script accordingly.
- see the example file for tags to use (e.g. ia6 for iambic trimeter, an4 for a 4 anapaest line, etc.). If you use these tags, the javascript in the html page will do a pretty good job of recognizing the rhythm. Lyric tags are at this point more a matter of judgment: just use tags that represent the pattern of longs and shorts predictably (it's up to you if you follow Dale rather than West or Page, for instance).

3. Prepare an html file for final corrections: "python3 tragedy2html.py oedipusfixedandedited.xml > oedipus.html". Amongst other things,  this script is responsible for splitting words into syllables.

4. Load the file from a web server. If you move the file, make sure the server can find the css, js and svg files in the same directory as the file. Now you can use the browser as a simple editor to correct the automatic tagging of the syllables (which is done by scanGk.js when the page loads - might take a few seconds).
  - a number of external css and js files are loaded by this page (e.g jquery - yes, I've been working on this for a while...). If you're going to be spending a lot of time on this, it makes sense to download those files and serve them locally (e.g. so you can edit on the bus...)
  - shift click on a syllable toggles it between short and long
  - right click brings up a context menu with various functions (not all are relevant to editing Greek Tragedy, and I have a couple of functions left over from editing Plautus that I'll be adding back in soon). Spend some time playing with these before you launch into editing for real. 
  - the editing page does its best to highlight syllables where there might be a problem.
  - In particular, each time a short anceps has alpha, iota or upsilon as the vowel, the syllable is underlined: check to make sure the vowel isn't in fact long (e.g. using the alpheios tools to quickly look up the word).
  - The page's javascript doesn't attempt to scan lyric according to the tagged pattern, it just makes a best guess at syllable length. You'll therefore spend most of your time correcting lyric scansion.
  - If you want to see if all this is worth your while, you can start by loading up prometheusToEdit.html and try out the editing features (you can just open it directly in your browser, so long as you don't expect to save).
  - Make sure the page is being saved with each edit before you put a lot of work into editing. There should be a "..._save.html" version of the file in the same directory.
  - There are occasional bugs with the output which won't show up visually on the page, but which might cause problems from a data point of view (e.g. syllables being tagged as both short and long). These are, I hope, quite rare, but I continue to work to eradicate them. Bug reports with fixes for this are most welcome.
  
5. If you wish, you can make a final html file for publishing by combining your save file with the template file (template.html). metre.js is intended for publication rather than editing. Or make your own scripts to access the data in the html save file (e.g. to convert back to xml, or into csv or sql).
