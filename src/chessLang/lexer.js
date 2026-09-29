"use strict";





export function lexer( stringIn){
	// this is the wrapper function for the lexer. It handles the indentation stuff
	// chessLang uses python-style indentation
	
	let rawLex = lexerCore(stringIn)
	
	// first, seperate it out into the lines
	let lines = [{indentationType:null,indentationLevel:null,contents:[]}]
	for( let i = 0; i < rawLex.length; i++){
		// seperate it out into the lines
		if( rawLex[i].type == "NEWLINE"){
			lines.push({ indentationType:null, indentationLevel:null, contents:[]})
		} else {
			lines[lines.length - 1].contents.push(rawLex[i])
		}
	}
	// note, this got rid of the newline tokens
	
	
	
	// now, look through all the lines and find its indentation type
	lines.forEach( line => {
		if(line.contents.length && line.contents[0].type == "TAB"){
			line.indentationType = "TAB"
		}
		if(line.contents.length && line.contents[0].type == "SPACE"){
			line.indentationType = "SPACE"
		}
	})
	
	// now, go through to check theres not a mix of tabs and spaces
	// note, if a line has no indentation it will be null
	let linesWithIndentation = lines.filter(line => line.indentationType)
	if( !linesWithIndentation.every( line => line.indentationType == linesWithIndentation[0].indentationType)){//TODO what if there is no indentation in the whole thing?
		throw new Error("mix of space and tab indentation")
	}
	
	let indentationType = linesWithIndentation[0].indentationType//TODO what if there is no indentation in the whole thing?
	
	// now, go through all the lines and find its indentation level. While we're doing that, also check to see that all of the indents are the correct type
	lines.forEach( line => {
		if(line.indentationType){
			line.indentationLevel = 0
			for( let i = 0; i < line.contents.length; i++){
				if( line.contents[i].type == "TAB" || line.contents[i].type == "SPACE"){
					if( line.contents[i].type == indentationType){
						line.indentationLevel++
					} else {
						throw new Error("mix of space and tab indentation")
					}
				} else {
					break
				}
			}
		}else{
			line.indentationLevel = 0
		}
	})
	
	
	// now we know that all the indentation is the correct type and indentationLevel has been set for all the lines
	
	
	
	// we are now done with the indentation tokens, and so we should remove them. The parser will not use them, it will instead use special indentation-level-increasing/decreasing tokens
	lines.forEach( line => {
		line.contents = line.contents.slice( line.indentationLevel)
	})
	
	
	
	// if it is space indentation, they might use 1, 2, 4, or some other number of spaces for each indent
	// to account for that (if it is space indentation), divide the indentation level of all lines by the indentation of the line with the least non-zero indentation
	// we need to do this after removing the SPACE tokens so that we know how many to remove
	if( indentationType == "SPACE"){
		
		let leastNonZeroIndentation = Infinity
		
		lines.filter(l=>l.indentationLevel > 0).forEach(l => leastNonZeroIndentation = Math.min( leastNonZeroIndentation, l.indentationLevel))
		// now we have figured out the indentation multiplier, so now just divide all the lines by that amount
		lines.forEach( line => {
			line.indentationLevel /= leastNonZeroIndentation
			if( line.indentationLevel % 1 != 0){
				// there was some double indentation on the bottom level or something, and now there is a decimal indentation amount
				throw new Error("indentation error, please fix it")
			}
		})
		
	}
	
	
	
	
	
	// now, we go through and change the lines back to tokens, adding INCREASE_INDENT and DECREASE_INDENT tokens along the way
	// we also need to add back in the newlines
	
	let result = []
	let lastIndentLevel = 0
	for( let i = 0; i < lines.length; i++){
		let line = lines[i]
		while( line.indentationLevel > lastIndentLevel){
			result.push({type:"INCREASE_INDENT",contents:""}) // the empty string for the contents is needed for the parser to not throw an error
			lastIndentLevel++
		}
		while( line.indentationLevel < lastIndentLevel){
			result.push({type:"DECREASE_INDENT",contents:""})// the empty string for the contents is needed for the parser to not throw an error
			lastIndentLevel--
		}
		for( let j = 0; j < line.contents.length; j++){
			result.push(line.contents[j])
		}
		result.push({type:"NEWLINE"})
	}
	
	
	// now, we can go through and take out any spaces to finish getting it ready for the parser
	result = result.filter(token => token.type != "SPACE")
	
	// also take out the comments
	result = result.filter(t => t.type != "COMMENT")
	
	
	
	// now, go through and get rid of any extra newlines
	// if there are multiple newlines in a row, only keep one of them
	// also, get rid of any newlines at the start
	// result = removeUselessNewlines(result)
	
	//TODO make the lexer match the specs, particularly newline placement
	
	// now, filter out all newlines next to indent-changing, since the indent changing already implies a newline. This is what the parser expects
	// result = removeNewlinesNextToIndentationChange(result)
	
	// keep doing it over and over untill it doesnt remove anything
	let numOfTokensLastPass = result.length + 1000 // so it will go at least once
	while(numOfTokensLastPass != result.length){
		numOfTokensLastPass = result.length
		result = removeUselessIndentation(result)
		result = removeUselessNewlines(result)
		result = removeNewlinesNextToIndentationChange(result)
	}
	
	
	// now, finally, to make it easier for the parser we actually add a newline before and after each DECREASE_INDENT
	// do the after part...
	for( let i = 0; i < result.length; i++){
		if( result[i].type == "DECREASE_INDENT" ){
			result.splice( i + 1, 0, {type:"NEWLINE", contents:""})
		}
	}
	// ...and now the before part
	for( let i = 0; i < result.length; i++){
		if( result[i].type == "DECREASE_INDENT" ){
			result.splice( i, 0, {type:"NEWLINE", contents:""})
			i++
		}
	}
	
	// for whatever reason, we need to do this again
	result = removeUselessNewlines(result)
	
	
	return result
}



// also, we don't care about empty lines really so if there is an increase-indent directly followed by a decreasing indent, get rid of both of them
// also do the other way around
// for it to still have some change there, we need to replace the useless indentation with a newline, instead of just getting rid of it, because the indentatiton-changing currently also includes the newline
function removeUselessIndentation( tokenListIn){
	let lastTokenType = "NOT_APPLICABLE"
	for( let i = 0; i < tokenListIn.length; i++){
		let thisType = tokenListIn[i].type
		if( thisType == "DECREASE_INDENT" && lastTokenType == "INCREASE_INDENT"){
			tokenListIn.splice( i, 1)
			i--
			tokenListIn.splice( i, 1, {type:"NEWLINE", contents:""})
			lastTokenType = "NOT_APPLICABLE"
		} else {
			lastTokenType = thisType
		}
	}
	
	lastTokenType = "NOT_APPLICABLE"
	for( let i = 0; i < tokenListIn.length; i++){
		let thisType = tokenListIn[i].type
		if( thisType == "INCREASE_INDENT" && lastTokenType == "DECREASE_INDENT"){
			tokenListIn.splice( i, 1)
			i--
			tokenListIn.splice( i, 1, {type:"NEWLINE", contents:""})
			lastTokenType = "NOT_APPLICABLE"
		} else {
			lastTokenType = thisType
		}
	}
	return tokenListIn
}

function removeUselessNewlines( tokenList){
	
	// now, go through and get rid of any extra newlines
	// if there are multiple newlines in a row, only keep one of them
	// also, get rid of any newlines at the start
	let lastTokenType = "NEWLINE"
	for( let i = 0; i < tokenList.length; i++){
		let thisType = tokenList[i].type
		if( thisType == "NEWLINE" && lastTokenType == "NEWLINE"){
			tokenList.splice( i, 1)
			i--
		}
		lastTokenType = thisType
	}
	return tokenList
}
function removeNewlinesNextToIndentationChange( tokenList){
	
	
	
	// now, filter out all newlines next to indent-changing, since the indent changing already implies a newline. This is what the parser expects
	return tokenList.filter((item, index) => {
		let amINextToAnIndentChanger = false
		if(
			tokenList[index - 1]?.type == "INCREASE_INDENT" ||
			tokenList[index - 1]?.type == "DECREASE_INDENT" ||
			tokenList[index + 1]?.type == "INCREASE_INDENT" ||
			tokenList[index + 1]?.type == "DECREASE_INDENT"
		){ amINextToAnIndentChanger = true}
		return !(item.type == "NEWLINE" && amINextToAnIndentChanger)
	})
}


// this is the main central part of the lexer. It is called by the lexer wrapper function, which is just called "lexer"
function lexerCore( stringIn){
	
	
	
	//WARNING the possible token regexes must start with the ^ char
	let possibleTokens = [
		//a var named ifa will count as keyword "if" without special handling, so I added (?=([^a-z01-9]|$)) to the end of a lot of token regexes
		{name:"IF",regex:/^if(?=([^a-z01-9]|$))/},
		{name:"FOR",regex:/^for(?=([^a-z01-9]|$))/},
		{name:"WHILE",regex:/^while(?=([^a-z01-9]|$))/},
		{name:"FUNCTIONDEF",regex:/^def(?=([^a-z01-9]|$))/},
		{name:"LET",regex:/^let(?=([^a-z01-9]|$))/},
		{name:"RETURN",regex:/^return(?=([^a-z01-9]|$))/},
		{name:"ELSE",regex:/^else(?=([^a-z01-9]|$))/},
		{name:"IN",regex:/^in(?=([^a-z01-9]|$))/},
		{name:"PLUS",regex:/^\+/},
		{name:"MINUS",regex:/^-/},
		{name:"ASTERISK",regex:/^\*/},
		{name:"SLASH",regex:/^\//},
		{name:"TESTEQUAL",regex:/^==/},
		{name:"TESTGREATERTHAN",regex:/^>/},
		{name:"TESTLESSTHAN",regex:/^</},
		{name:"TESTGREATERTHANOREQUALTO",regex:/^>=/},
		{name:"TESTLESSTHANOREQUALTO",regex:/^<=/},
		{name:"EQUALS",regex:/^=/},
		{name:"NOT",regex:/^!/},
		{name:"AND",regex:/^&/},
		{name:"OR",regex:/^\|/},
		{name:"COLON",regex:/^:/},
		{name:"COMMA",regex:/^,/},
		{name:"LPAREN",regex:/^\(/},
		{name:"RPAREN",regex:/^\)/},
		{name:"LBRACE",regex:/^{/},
		{name:"RBRACE",regex:/^}/},
		{name:"LBRACKET",regex:/^\[/},
		{name:"RBRACKET",regex:/^\]/},
		{name:"NEWLINE",regex:/^\n/},
		{name:"TAB",regex:/^\t/},
		{name:"SPACE",regex:/^[ ]/},
		{name:"NUMBER",regex:/^[0-9]+(?=([^a-z01-9]|$))/},//NOTE currently does not support decimals
		{name:"IDENTIFIER",regex:/^[a-z][a-zA-Z_0-9]*(?=([^a-z01-9]|$))/},
		{name:"STRING",regex:/^"[^"]*"(?=([^a-z01-9]|$))/},
		{name:"COMMENT",regex:/^#[^\n]*(?=\n|$)/},
		// {name:"",regex://},
	]
	
	let index = 0
	
	let result = []
	
	function lexNextChar(){
		// returns true if sucessful
		// returns false when at end of file
		
		let stringInLeft = stringIn.substring(index)
		
		if( stringInLeft.length == 0){ return false}
		
		for( let i = 0; i < possibleTokens.length; i++){
			
			let match = stringInLeft.match(possibleTokens[i].regex)
			if( match){
				result.push({type:possibleTokens[i].name,contents:match[0]})
				index += match[0].length
				return true
			}
		}
		throw new Error("lexer error this doesnt match any of the things:" +  stringInLeft.slice(0, 20) + "...")
	}
	
	let indexLastTime = 0
	while( lexNextChar()){}
	
	return result
}
