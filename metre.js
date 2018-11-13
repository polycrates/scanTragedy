var newtext;
var lastmetre="";
var showdetails=false;
var showprint=false;
var dwork=""
var author=""
var corrBtn="<button id='corrBtn' class='btn-default'>Correction</button>"
var loaderspan="<span id='loader'><img src='ajax-loader.gif'></span>"
var filename=""


function printNums(cmd){

	var poemstoprint=[]
	var nextpoem
//fix for no poem

 
//  Working on this...

	if($('html').find('.poem').length > 1){
	poemprint=$('#poemprint').val()
	//poemsinput=poemprint.split(",")
	poemsinput=poemprint.trim().split(/\s*,\s*/)
	$(poemsinput).each(function(){
		if(this.match("-")){
		console.log("range: "+this)
			var range=this.split("-")
			poemtoprint=range[0]
			console.log('first: '+poemtoprint)
			last=range[1]
			console.log("last: "+ last)
		//need to make sure these are just numbers so we can increment
		//?
		//no: better to get the poem numbers from the doc, add them with next()
		//until we hit the second parameter (poemnum==last..)
			$('.poem').each(function(){
				if ($(this).data('number')==poemtoprint){
					index=$(this).index('.poem')
					poemstoprint.push(poemtoprint)
					while (nextpoem != last){
						index++
						nextpoem=$('.poem').eq(index).data('number')
						poemstoprint.push(nextpoem)
					}
					//poemstoprint.push(last)
				}			
			});
			}
			else{
				poemstoprint.push(this)  // no ranges, just csv
			}
		
	});
}
else{
	poemstoprint=["1"]
	console.log("only one work here")
}
console.log(poemstoprint)
//print whole poems if nothing in the start/end fields
$(poemstoprint).each(function(){
if (poemstoprint.length == 1){
startline=$('#startprint').val()-1
endline=$('#endprint').val()-1
console.log (startline + endline)
var number=this
author=$('.poem').filter('[data-number='+number+']').data('author')||author
dwork=$('.poem').filter('[data-number='+number+']').data('work')||dwork
mylines=$('.poem').filter('[data-number='+number+']').find('.line');
if (!$('.poem').length || !$('.mylines').length){
	mylines=$('.line')
}

if(startline==""||startline==undefined||startline==-1){startline=0}
if(endline==""||endline==undefined||endline==-1){endline=mylines.length-1}

$("<h2>"+author+" "+dwork+" "+number+"; lines "+(startline+1)+"-"+(endline+1)+"</h2>").appendTo('#printable')

console.log("from "+startline)
console.log("to "+ endline)
$(mylines).each(function(index){
	$(this).css(':before', '')
	if(index >= startline && index <= endline){
	if($(this).data('metre')){
    	var metre = $(this).data('metre')
    }
    else{
    	var metre=$(this).closest('.poem').data('metre');
    }
    scanline($(this), metre);
    //caesura($(this), metre);  //why doesn't this work with drama?
	$(this).clone().appendTo('#printable');
	}
});
}
else{
	var number=this
	startline=1
	author=$('.poem').filter('[data-number='+number+']').data('author')
	dwork=$('.poem').filter('[data-number='+number+']').data('work')
	$("<h2>"+author+" "+dwork+" "+number+"</h2>").appendTo('#printable')
	$("<div class='poem' id='poem"+number+"'>").appendTo('#printable')
	mylines=$('.poem').filter('[data-number='+number+']').find('.line');

	$(mylines).each(function(index){
		$(this).css(':before', '')
		if($(this).data('metre')){
			var metre = $(this).data('metre')
		}
		else{
			var metre=$(this).closest('.poem').data('metre');
		}
		scanline($(this), metre);
		//caesura($(this), metre);  //why doesn't this work with drama?
		$(this).clone().appendTo('#printable');

	});

	}

}); //end of $(poemstoprint).each

$( "#printable").find('.line').addClass("selected")


    if ($('#colors').is(':checked')){
		$( "#printable").find('.line').addClass("colored")
	}

var DocumentContainer = document.getElementById('printable');
var WindowObject = window.open("", "PrintWindow", "width=750,height=650,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=yes");
WindowObject.document.writeln(DocumentContainer.innerHTML);

WindowObject.document.write('<link rel="stylesheet" type="text/css" href="print.css">')
WindowObject.document.write('<style>html {counter-reset: linecounter '+startline+';}</style>')
WindowObject.document.write('<style>.line {counter-increment: linecounter; line-height: 25px; padding-bottom: 10px;}</style>')
$('#printable').empty();
//WindowObject.document.close();
/*
setTimeout(function(){
    WindowObject.focus();
    WindowObject.print();
    WindowObject.close();
},6000);
*/
//}
}

var urlParam = function(name, w){
    w = w || window;
    var rx = new RegExp('[\&|\?]'+name+'=([^\&\#]+)'),
        val = w.location.search.match(rx);
    return !val ? '':val[1];
}
function scanline(line, metre){
	if (metre == "hexameter" || metre == "elegy" || metre=="da4" || metre=="hex"){
    var hemis=0;
    var feet=0
    var arsisCount=0;
    var arsis=true;
    sylls=$(line).find('.syll')
    $(sylls).each(function(index){ 
        var prev=$(sylls).eq([index-1])
        var prevprev=$(sylls).eq([index-2])
        if(arsis){
            if(!$(prev).hasClass('startfoot')){
                $(this).addClass('startfoot')
            }
            if(!$(this).hasClass('elided')){
                if(!$(line).hasClass('pentameter')){
                arsis=false;
                arsisCount++;
                }
                else{
                    if(arsisCount!=2 && arsisCount!=5){
                        arsis=false;
                        arsisCount++;
                    }
                    else{
                        arsisCount++;
                        $(this).addClass('halffoot startfoot endfoot');
                    }
                }
            }
        }
        else if ($(this).hasClass('long')){
            arsis=true;
            $(this).addClass('spondee endfoot')
            if ($(prev).hasClass('elided')){
                $(prevprev).addClass('spondee')
                }
            else{
            $(prev).addClass('spondee')
            }
        }
        else if($(this).hasClass('short')){
            $(this).addClass('dactyl')
            if ($(prev).hasClass('elided')){
                $(prevprev).addClass('dactyl')
                if($(prevprev).hasClass('short')){
                    arsis=true
                    $(this).addClass('endfoot')

                }
                }
            else{
            $(prev).addClass('dactyl')
                if($(prev).hasClass('short')){
                    arsis=true
                    $(this).addClass('endfoot')

                }
            }        
        }
    });
    }
    else if (metre == "ia6" ||metre == "ia4" ||metre == "ia4cat" || metre == "senarii" || metre == "scazon" || metre == "iambic_strophe" || metre == "tr7" || metre == "tr7" ||metre == "ia7"|| metre == "ia8"|| metre == "tr8" || metre=="tr4cat"){
    	console.log("scanning a "+metre)
    	caesura=0;
    	sylls=$(line).find('.syll')
    	var count = 1;
    	var resolved = 0;
    	var hemis=0;
		$(sylls).each(function(index){
			if($(this).hasClass('elided')){
				return
			}
			if($(this).hasClass('resolved') && !$(this).hasClass('res1') && !$(this).hasClass('res2')){
				if (resolved==1){
					console.log('resetting resolved');
					resolved=0;
					hemis++;
					$(this).addClass("res2")
					}
					else {
					resolved++;
					console.log('first resolved');
					$(this).addClass("res1")
					}
			}
			else if($(this).hasClass('res1')){
				resolved++;
				//return;
			}
			else {
				resolved=0;
				hemis++;// long, unresolved short or res2 is a half foot
			}
			foot=(hemis + (hemis % 2)) / 2;
			$(this).addClass("hemi"+hemis);
			$(this).addClass("foot"+foot);
			
			if (hemis%2==0 && resolved != 1){
				$(this).addClass("footend")
			}
			//check for caesura:
			if(hemis==5 && $(this).is(':last-child') && caesura == 0  && resolved != 1 && ( metre == "ia6" || metre == "senarii")){
				$(this).addClass('caesura');
				caesura=1;
			}
			else if (hemis==7 && $(this).is(':last-child') && caesura == 0  && resolved != 1 && ( metre == "ia6" || metre == "senarii")){
				$(this).addClass('caesura');
				caesura=1;
			}
			else if (hemis==8 && $(this).is(':last-child') && caesura == 0  && resolved != 1 && ( metre == "tr7" || metre == "ia7" || metre == "ia8" || metre == "tr8")){
				$(this).addClass('diaeresis');
				caesura=1;
			}
		});
    }
	else if (metre == "an4cat"||metre == "an4" ||metre == "an8"||metre == "an7" ||metre == "an2"){
	var sylls = $(line).find('.syll');
	$(sylls).each(function(index){
		$(this).removeClass("resolved res1 res2 res1p res2p")
	});
	var sylls = $(line).find('.syll');
    caesura=0;
    var count = 1;
    var shorts = 0;
    var hemis=0;
	$(sylls).each(function(index){		
			if($(this).hasClass('elided')){
				return
			}
			if($(this).hasClass('short')){
				if (shorts==1){
					shorts=0;
					}
					else {
					shorts++;
					hemis++;
					}
			}
			else {
				hemis++;// long or unresolved short is a half foot
			}
			
			foot=(hemis + (hemis % 2)) / 2;
			$(this).addClass("foot"+foot);
			if (hemis%2==0 && shorts != 1){
				$(this).addClass("footend")
			}
			if (metre=="an4" && hemis==4 && $(this).is(':last-child')){	
				$(this).addClass("diaeresis")
			}
		}); 		
	}
	else if (metre == "ba4"||metre == "cr4"||metre == "cr2"||metre == "cr3"||metre == "ba2"||metre == "ba3"||metre == "ba3cat"||metre == "ba4cat"){
	//console.log("checking ba/cr")
	var sylls = $(line).find('.syll');
	 caesura=0;
    var count = 1;
    var resolved = 0;
    var hemis=0;
    var feet=1;
	$(sylls).each(function(index){		
			if($(this).hasClass('elided')){
				return
			}
			if($(this).hasClass('resolved')){
				if (resolved==1){
					resolved=0;
					}
					else {
					resolved++;
					hemis++;
					}
			}
			else {
				hemis++;// long or unresolved short is a third of a foot
			}
			
			if (hemis%3==0 && resolved != 1){
				$(this).addClass("footend")
				feet++;
				if ((metre == "ba4"||metre == "cr4") && $(this).is(':last-child')){
					if (feet==3){
						$(this).addClass("diaeresis")
					}
				}
			}
			$(this).addClass("foot"+feet);
	});
	}
	}
function caesura(line, metre){
if (metre == "hexameter" || metre == "elegy"){
    arses=$(line).find('.startfoot');
    var penthtext=$(arses).eq(2).text();
    var hepthtext=$(arses).eq(3).text();
    var trochetext=$(arses).eq(2).next('.short').text();
    //console.log(penthtext+", "+hepthtext+", "+trochetext)


    if($(arses).eq(2).is(':last-child') && $(arses).eq(2).hasClass('long')){
        if (penthtext.match(/[.,:!?;]$/)){
        $(arses).eq(2).addClass('caesura');
        //console.log("punc in penth")
        return
        }
    }
    if($(arses).eq(3).is(':last-child') && $(arses).eq(3).hasClass('long')){
        if (hepthtext.match(/[.,:!?;]$/)){
            //console.log("punc in hepth")
            $(arses).eq(3).addClass('caesura');
        return
        }  
    }
    if (trochetext.match(/[.,:!?;]$/)){
        $(arses).eq(2).next('.short').addClass('caesura')
        //console.log("punc in troche")
        return
    }
    if($(arses).eq(2).is(':last-child') && $(arses).eq(2).hasClass('long')){
        //console.log("wordbreak in penth")
        $(arses).eq(2).addClass('caesura');
    }
    else if($(arses).eq(3).is(':last-child')  && $(arses).eq(3).hasClass('long')){
        //console.log("wordbreak in hepth")
        $(arses).eq(3).addClass('caesura');
    }
    else if($(arses).eq(2).next('.short').is(':last-child')){
        //console.log("wordbreak in troche")
        $(arses).eq(2).next('.short').addClass('caesura')
    }
    }
}
function makeToggles(letter){
    var re = new RegExp(letter,"g");
    $('.syll').each(function(){
        var string=$(this).html();
        var newstring=string.replace(re, "<span class='"+letter+"'>"+letter+"</span>");
        $(this).html(newstring);
    });
}
function toggleColors(){
	if ($('#colors').is(':checked')){
	$('.selected').addClass('colored')
	}
	else{
	$('.selected').removeClass('colored')
	}
}
function fixmetername(name){
		newtext = name.replace("scazon_dimeter","Iambic Strophe with Scazon plus Iambic Dimeter");
		newtext = newtext.replace("iamtetcata", "Iambic Tetrameter Catalectic (Septenarii)");
		newtext = newtext.replace("iambic_strophe", "Iambic Strophe: Iambic Trimeter, Iambic Dimeter");
		newtext = newtext.replace("1st_pythiambic", "1st Pythiambic Distich: Dactylic Hexameter plus Iambic Dimeter");
		newtext = newtext.replace("2nd_pythiambic", "2nd Pythiambic Distich: Dactylic Hexameter plus Iambic Trimeter");
		newtext = newtext.replace("senarii", "Senarii (Iambic Trimeter)");
		newtext = newtext.replace("arch3", "3rd Archilochean Distich: Iambic Trimeter / Hemiepes + Iambic Dimeter");
		newtext = newtext.replace("alcmanic_strophe", "Alcmanic Strophe: Dactylic Hexameter + Dactylic Tetrameter");
		newtext = newtext.replace("arch2", "Second Archilochean Distich: Dactylic Hexameter / Iambic Dimeter + Hemiepes");
		newtext = newtext.replace("asc1", "1st Asclepiadean");
		newtext = newtext.replace("sapadon", "Sapphic (3) + Adonic");
		newtext = newtext.replace("asc2", "2nd Asclepiadean Distich");
		newtext = newtext.replace("arch4", "4th Archilochean Distich");
		newtext = newtext.replace("asc4", "4th Asclepiadean Stanza (AABC)");
		newtext = newtext.replace("asc3", "3rd Asclepiadean Stanza (AAAB)");
		newtext = newtext.replace("sapphic2", "2nd Sapphic Distich");
		newtext = newtext.replace("alcaic", "Alcaic Stanza (AABC)");
		newtext = newtext.replace("glycpher", "Glyconics + Pherecratean");
		newtext = newtext.replace("asc5", "5th ('Greater') Asclepiadean");
		newtext = newtext.replace("ionaminore", "Ionic A Minore");
		newtext = newtext.replace("trocstrophe", "Trocaic Strophe");
		newtext = newtext.replace("scazon", "Scazon (Choliamb)");
		newtext = newtext.replace("hexameter", "Dactylic Hexameter");

		return(newtext);
}
function prepText(){
	if($('.poem').length < 2){
		$('#poemprint').prop('disabled', true);
	}
	else{
		$('#poemprint').prop('disabled', false);
	}

makeToggles("ā");
makeToggles("ē");
makeToggles("ī");
makeToggles("ō");
makeToggles("ū");
makeToggles("j");
makeToggles("v");
toggleMacrons();

$( "<span> </span>" ).insertAfter( ".word" );

if ($( ".poem" ).length == 1){
	$('.line').eq(0).addClass('first');
	//add header here
	author=$( ".poem" ).data('author');
	metre=$( ".poem" ).data('metre');
	work=$( ".poem" ).data('work');
	if($( ".poem" ).data('book')){
		book=", Book " + $( ".poem" ).data('book');
		}
	else {
		book=""
	}
	header="<div class='poem_header'><div class='book_info'><div class='book_title'> "+ author + ", "+work+book+"</div><div class='poem_metre'>"+metre+"</div></div></div>";
	$('.poem').prepend(header);	
}


$('.poem').addClass('w3-card-2');
$('.fragment_book').addClass('w3-card-2 w3-container');
$('.poem_header').addClass('w3-container');
$('.hexameter .poem_header').addClass('w3-blue');
$('.elegy .poem_header').addClass('w3-green');
$('.hendecasyllables .poem_header').addClass('w3-shaded-spruce');
$('.scazon .poem_header').addClass('w3-orange');
$('.senarii .poem_header').addClass('w3-blue-grey');
$('.sapadon .poem_header').addClass('w3-black');
$('.priapean .poem_header').addClass('w3-pink');
$('.asc5 .poem_header').addClass('w3-yellow');
$('.glycpher .poem_header').addClass('w3-indigo');
$('.galliamb .poem_header').addClass('w3-lime');
$('.iamtetcata .poem_header').addClass('w3-purple');
$('.alcaic .poem_header').addClass('w3-khaki');
$('.trocstrophe .poem_header').addClass('w3-golden-lime');
$('.iambic_strophe .poem_header').addClass('w3-lapis-blue');
$('.asc2 .poem_header').addClass('w3-tawny-port');
$('.asc3 .poem_header').addClass('w3-autumn-maple');
$('.asc4 .poem_header').addClass('w3-vivid-red');
$('.asc1 .poem_header').addClass('w3-vivid-yellow-green');
$('.ionaminore .poem_header').addClass('w3-vivid-blue');
$('.arch1 .poem_header').addClass('w3-vivid-red');
$('.arch4 .poem_header').addClass('w3-vivid-reddish-orange');
$('.arch3 .poem_header').addClass('w3-flame');
$('.arch2 .poem_header').addClass('w3-vivid-reddish-purple');
$('.alcmanic_strophe .poem_header').addClass('w3-vivid-orange-yellow');
$('.sapphic2 .poem_header').addClass('w3-greenery');
$('.sotadean .poem_header').addClass('w3-grenadine');
$('.1st_pythiambic .poem_header').addClass('w3-vivid-purplish-blue');
$('.2nd_pythiambic .poem_header').addClass('w3-vivid-blue');

$('.poem_meter').each(function(){
		name = $(this).text();
		newtext=fixmetername(name);
		$(this).text(newtext);
	});
$('.line').each(function(){
		poemnum=$(this).closest('.poem').data('number');
		//console.log(poemnum);
		if(!poemnum){
		poemnum=$(this).closest('.poem').data('book');
		}
		if(poemnum){
		$(this).attr("data-before", poemnum + ".");
		}
		
});
		//fix numbering for stanzas:
$('.poem').each(function(){
		$(this).find(".line").each(function(index){
			//console.log(index);
			if ((index+1) % 5 == 0){
				$(this).addClass("fifth")//this is picked up in css
			}
		});
});
	
	if($('.poem').eq(0).data('work')){
		mywork=$('.poem').eq(0).data('work')+" ";
	}
	else{
		mywork="";
	}
	console.log($('.poem').eq(0).data('work'));
	if($('.poem').eq(0).data('book')){
		mybook=$('.poem').eq(0).data('book');
	}
	else{
		mybook="";
	}
		if($('.poem').eq(0).data('number')){
		mynumber=". "+$('.poem').eq(0).data('number');
	}
	else{
		mynumber="";
	}
	myinfo=$('.poem').eq(0).data('author')+" "+mywork+" " + mybook + mynumber +$('.poem_title').eq(0).text()+ ": "+  $('.poem').eq(0).data('metre');
	//$('#info').html(myinfo);
	$('#info').html("");
	
$('.poem_title').each(function(){
		mytitle = $(this).text();
		newtext=mytitle.replace(/ā/gi, 'a');
		newtext=newtext.replace(/ē/gi, 'e');
		newtext=newtext.replace(/ī/gi, 'i');
		newtext=newtext.replace(/ō/gi, 'o');
		newtext=newtext.replace(/ū/gi, 'u');
		newtext=newtext.replace(/-/g, '');
		$(this).text(newtext);
	});
}
function display(list, item){
	$('#authors ul li').removeClass('chosen');
	$(item).addClass("chosen");
	newcontent=$('#'+list).clone();
	$('#works').html(newcontent)
	$('#works').find('div').show()	
	$('#books').html("")
}
function display2(list, item){
	$('#books ul li').removeClass('chosen');
	$(item).addClass("chosen");
	newcontent=$('#'+list).clone();
	$('#books').html(newcontent);
	$('#books').find('div').show();

}
function loadup(file, item){
	filename=file
	author=$(item).closest('div').data('author')
	dwork=$(item).text()
	console.log("filename is now " +filename)
	console.log("author is now " +author)
	console.log("work is now " +dwork)

	//$('#loadme').jmspinner('large');
	console.log("loading")
	$(item).css('background-color', 'orange');
	$('#greekdiv').load(file+".html .greek > *", function(){
		//$('#loadme').jmspinner(false);
		$('#loadme').html('');
		console.log("loaded")
		$('#details').text('Click a Line / Use Up and Down Arrows');
		prepText();
	});
	//need to add author to title
	window.history.pushState('', file, '/greek/index.html?Use_Id='+file);
	document.title = file;
}
function loadnav(file){
	title=file.charAt(0).toUpperCase() + file.slice(1).toLowerCase();
	$('#info').html(title)
	$('#greekdiv').load(file+".html")
	$('#details').text('');
}
function loadPattern(metre){
	$('#details').load("metredivs.html #"+metre)
}
function toggleMacrons(){
	console.log("fixing macrons")
	if ($('#macrons').is(':checked')){
	$('.ā').text('ā');
	$('.ē').text('ē');
	$('.ī').text('ī');
	$('.ō').text('ō');
	$('.ū').text('ū');
	}
	else{
	$('.ā').text('a');
	$('.ē').text('e');
	$('.ī').text('i');
	$('.ō').text('o');
	$('.ū').text('u');
	}
}
function toggleJv(){
	console.log("fixing jv")
	if ($('#jv').is(':checked')){
	$('.j').text('j');
	$('.v').text('v');
	}
	else{
	$('.j').text('i');
	$('.v').text('u');
	}
}
function toggleOptions(){
	$('#settings').toggle();
	showdetails = !showdetails;
	if (showdetails==true){
		$('#options').html('Options &#9650;')
	}
	else{
		$('#options').html('Options &#9660;')
	}
}


function togglePrintMe(){
	$('#printMe').toggle();
	showprint = !showprint;
	if (showprint==true){
		$('#print').html('Print/PDF &#9650;')
	}
	else{
		$('#print').html('Print/PDF &#9660;')
	}
}

$(document).on('click', '#corrBtn', function(event){
	console.log("submitting feedback on "+filename)
	line=$(this).parent().index('.line')+1
	
	var path = window.location.pathname;
	//var filename = path.match(/.*\/([^/]+)\.([^?]+)/i)[1];
	url="http://hypotactic.com/corrections-form/?file="+filename+"&line="+line
	window.open(url,'_blank');
});

$(document).on('click', '.line', function () {
	$('#corrBtn').remove()
    if ($('#feedback').is(':checked') && !$(this).hasClass('selected')){  //problem: we keep adding buttons!!!!
    	$(corrBtn).appendTo(this);
    	}
    $('.line').removeClass('selected colored')

    $(this).addClass('selected');
    if ($('#colors').is(':checked')){
		$(this).addClass('colored')
	}
    if($(this).data('metre')){
    var metre = $(this).data('metre')
    }
    else{
    var metre=$(this).closest('.poem').data('metre');
    }
    scanline($(this), metre);
    //caesura($(this), metre);
    if(metre != lastmetre){
    	loadPattern(metre)
    }
    lastmetre = metre;
    });

$(document).on('click', '.syll', function (event) {
if (event.shiftKey){
	if ($(this).hasClass('short')){
		$(this).removeClass('short');
		$(this).addClass('long');
		console.log("making long")
		}
	else if ($(this).hasClass('long')){
		$(this).removeClass('long');
		$(this).addClass('short');
		console.log("making short")

		}
	}
});



$(document).keydown(function(e) {
        var lines = $('.line');
        var selected = $('.selected')
        mypos=$(lines).index(selected);

        if (e.which === 38) {
        e.preventDefault();
        console.log("up was pressed");
        var newline=$(lines).eq(mypos-1);
  		$( newline ).addClass("selected");
  		if ($('#colors').is(':checked')){
			$(newline).addClass('colored')
		}
  		$( lines ).eq(mypos).removeClass("selected colored");
		if($(newline).data('metre')){
    		var metre = $(newline).data('metre')
    	}
    	else{
    		var metre=$(newline).closest('.poem').data('metre');
    	}
    	scanline($(newline), metre);
    	caesura($(newline), metre);
        }
        
        else if (e.which === 40) {
        e.preventDefault();
        console.log("down was pressed");
        var newline=$(lines).eq(mypos+1);
  		$( newline ).addClass("selected");
  		if ($('#colors').is(':checked')){
			$(newline).addClass('colored')
		}
  		$( lines ).eq(mypos).removeClass("selected colored");		
  		if($(newline).data('metre')){
    		var metre = $(newline).data('metre')
    	}
    	else{
    		var metre=$(newline).closest('.poem').data('metre');
    	}
    	scanline($(newline), metre);
    	caesura($(newline), metre);
        }
    });

/*$(window).on("scroll resize", function(){
if ($( ".poem" ).length > 1){
    $('.poem').each(function(){            
        var scrollTop = $(window).scrollTop();
        elementOffset = $(this).offset().top;
        distance = (elementOffset - scrollTop);
        if(distance > 20 && distance < 60){
        console.log("scrolled" + $(this).find('.poem_number').text());
        index=$(this).index();
        metre=$(this).data('metre');
        metre=fixmetername(metre);
        if($(this).data('work')){
        	mywork=" "+$(this).data('work');
        	}
        	else{
        	mywork="";
        	}
        if($(this).data('book')){
        	mybook=" Book "+$(this).data('book')+", "
        	}
        	else{
        	mybook="";
        	}

		myinfo=$(this).data('author')+mywork+mybook+" Poem "+ $(this).find('.poem_number').text() + " " + $(this).find('.poem_title').text() + ": "+ metre;
        $('#info').html(myinfo);
        return; //break the loop
        }
    });
    }
});*/

$(document).ready(function () {
	if($('.poem').length < 2){
		$('#poemprint').prop('disabled', true);
	}


	var useId = urlParam('Use_Id');
	if (useId==""||useId==undefined){
		console.log("no url id")
		useId = "about"
	}
	if(useId=="about"){
		loadup(useId)
		//$('#loadme').jmspinner();
		console.log("loading")
		$('#greekdiv').load("about.html", function(){
		//$('#loadme').jmspinner('false');
		$('#loadme').html('');
		window.history.pushState('','', '/greek/index.html?Use_Id=about')
		console.log("loaded")
	});
	}
	else{
		loadup(useId)
	}
	

});
