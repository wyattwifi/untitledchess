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
			result.push({type:"INCREASE_INDENT"})
			lastIndentLevel++
		}
		while( line.indentationLevel < lastIndentLevel){
			result.push({type:"DECREASE_INDENT"})
			lastIndentLevel--
		}
		for( let j = 0; j < line.contents.length; j++){
			result.push(line.contents[j])
		}
		result.push({type:"NEWLINE"})
	}
	
	
	// now, we can go through and take out any spaces to finish getting it ready for the parser
	result = result.filter(token => token.type != "SPACE")
	
	
	
	
	return result
}


// this is the main central part of the lexer. It is called by the lexer wrapper function, which is just called "lexer"
function lexerCore( stringIn){
	
	
	
	//WARNING the possible token regexes must start with the ^ char
	let possibleTokens = [
		{name:"IF",regex:/^if(?=\s|$)/},
		{name:"FOR",regex:/^for/},
		{name:"FUNCTIONDEF",regex:/^function/},
		{name:"LET",regex:/^let/},
		{name:"RETURN",regex:/^return/},
		{name:"ELSE",regex:/^else/},
		{name:"PLUS",regex:/^\+/},
		{name:"MINUS",regex:/^-/},
		{name:"ASTERISK",regex:/^\*/},
		{name:"DOUBLEEQUALS",regex:/^==/},
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
		{name:"NUMBER",regex:/^[0-9]+/},//NOTE currently not support decimals
		{name:"IDENTIFIER",regex:/^[a-z][a-zA-Z_0-9]*/},
		{name:"STRING",regex:/^"[^"]*"/},
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
