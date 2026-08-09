"use strict"

//WARNING for now I'm trying to have this parse correct code correctly. No guarantees about what incorrect code will do
// some of the comments are inaccurate. This could use some work


// the piece descriptions in this chess game are written in their own coding language. That provides extra structure and clarity


//I'm afraid the AST is not very polished yet.



/*


STRUCTURE OF THE AST:

The main thing is an array of functions
 each function is: {
		name:name,
		params:[param, param, param, ...],
		statements:[statement, statement, ...],
	}
each param is {
				type: "identifier",
				contents: array or string, im not sure which
			}


each statement is one of these 3 things for now:
1: {type:"assignment", lVal:tokens[0].contents, rVal: expression}
2: {type:"if",condition: expression, contents:[statements]}
3: {type:"while",condition: expression, contents:[statements]}



each expression is: { type:"addition/subtraction", terms:[term]}

each term is: { contents:thingA, isPositive: bool} // for simplicity the parser always treats an expression of any sort as a list of terms, just often there will be only one term
// for now multiplication and division are not supported

each thingA is:
1:{type:"arrayOrFncall", firstName: string or array I'm not sure which, callChain: [thingB]}
2: { type: "string", contents: string or array I'm not sure which }
3:{ type: "integer", contents: a normal JS number }
4:{ type: "identifier", contents: string or array I'm not sure which }

each thingB is:
1: {type:"arrayLookup", index: expression}
2: {type:"functionCall",args: [expressions] }


A function/array lookup chain is something like (in JS) thing[3][6]( aVariable, "some text")["key based array lookup"]("yet another function call")




*/

// this is the main overarching function that takes the source code string and returns the AST
function parseChessLang( sourceCode){
	
	let lines = sourceCode.split("\n")
	
	//WARNING this does not support # symbol in strings currently
	lines = lines.map( l => l.replace(/#.*/, ""))// remove comments
	
	
	lines = lines.filter( l => l.trim() != "") // remove blank lines.
	
	// divide up the lines into the function sections. Each section is the lines of the function
	// only functions are allowed on the lowest level. In other words, all code must be part of a function
	let functionLines = []
	for( let line of lines){
		if( line.startsWith("function ")){
			functionLines.push([line])
		} else {
			functionLines[functionLines.length - 1].push(line)
		}
	}
	
	let functionASTs = []
	
	for( let linesOfOneFunction of functionLines){
		functionASTs.push(parseFunction(linesOfOneFunction))
	}
	return functionASTs
}

//TODO either fully support or block uniary minus

function parseFunction( lines){ // param is an array of strings
	
	// this takes all the lines that supposedly belong to a function
	// the first line should be in the format of "function name( param1, param2, ...)"
	// all of the other lines should be indented at least once
	
	
	let firstLine = lines[0]
	
	
	// parse the first line
	let firstLineTokens = tokenize(firstLine)
	
	// check that the function declaration is valid
	if( firstLineTokens.length < 4){
		throw new Error("invalid function declaration (too short): " + firstLine)
	}
	if( firstLineTokens[0].type != "identifier" || firstLineTokens[0].contents != "function"){
		throw new Error('invalid function declaration (must start with "function "): ' + firstLine)
	}
	if( firstLineTokens[1].type != "identifier" ){
		throw new Error('invalid function declaration (must have a valid name): ' + firstLine)
	}
	if( firstLineTokens[2].type != "symbol" || firstLineTokens[2].contents != "("){
		throw new Error('invalid function declaration (must have a "(" in the right place): ' + firstLine)
	}
	if( firstLineTokens[firstLineTokens.length - 1].type != "symbol" || firstLineTokens[firstLineTokens.length - 1].contents != ")"){
		throw new Error('invalid function declaration (must have a ")" in the right place): ' + firstLine)
	}
	
	let name = firstLineTokens[1].contents
	
	let paramTokens = firstLineTokens.slice(3, firstLineTokens.length - 1)
	let params = []
	let paramSections = splitByLowestLevelCommas( paramTokens) //TODO this only works if the token format is the same as the AST format
	for( let i = 0; i < paramSections.length; i++){
		if( paramSections.length != 1){
			throw new Error("what is this parameter?")
		}
		params[i] = paramSections[i][0]
	}
	
	let bodyLines = lines.slice(1)
	
	// now that we have all the body lines, we need to seperate them out into blocks
	// a block is either just one line, or it is one main line and all the sublines within it
	
	// first, decrease the indentation level
	bodyLines = bodyLines.map(decrimentIndentation)
	
	let blocks = seperateLinesIntoBlocks( bodyLines)
	
	let statements = blocks.map(parseBlock)
	
	
	return {
		name:name,
		params:params,
		statements:statements,
	}
	
}

// this is either one command, or it is an if/while statement
function parseBlock( lines){// takes an array of strings. Each of the strings not within a sub-block should not have any indentation. Each string is a line
	
	
	// is it just one line? If so it is just an assignment. TODO add support for expressions on themselves, particularly funcalls
	if( lines.length == 1){
		// for now the only allowed thing is an assignment
		let tokens = tokenize(lines[0])
		
		
		// check that the assignment is valid
		if( tokens.length < 3){
			throw new Error("invalid assignment (too short): " + lines[0])
		}
		if( tokens[0].type != "identifier"){
			throw new Error('invalid assignment (must start with a name): ' + lines[0])
		}
		if( tokens[1].type != "symbol" || tokens[1].contents != "="){
			throw new Error('invalid assignment (must have "="): ' + lines[0])
		}
		
		return {type:"assignment", lVal:tokens[0].contents, rVal:parseExpression(tokens.slice(2))}
		
	}
	
	// now we know that it must be multi-line
	// it is an if or a while for now those are the only allowed things
	//TODO
	
	let firstLineTokens = tokenize(lines[0])
	
	if( firstLineTokens[0].type != "identifier"){ throw new Error("aaa!")}
	
	// format: if expression
	
	if( firstLineTokens[0].contents == "if"){
		return {type:"if",condition:parseExpression(firstLineTokens.slice(1)), contents:seperateLinesIntoBlocks(lines.slice(1).map(decrimentIndentation)).map(parseBlock)}
	}
	if( firstLineTokens[0].contents == "while"){
		return {type:"while",condition:parseExpression(firstLineTokens.slice(1)), contents:seperateLinesIntoBlocks(lines.slice(1).map(decrimentIndentation)).map(parseBlock)}
	}
	
}


function decrimentIndentation(theString){
	return theString.slice(1)
}

function seperateLinesIntoBlocks( lines){ // takes an array of strings
	let blocks = []
	
	for( let i = 0; i < lines.length; i++){
		if( getIndentationLevel(lines[i]) == 0){
			blocks.push([lines[i]])
		} else {
			blocks[blocks.length - 1].push(lines[i])
		}
	}
	return blocks
	
}

function getIndentationLevel( theString){
	let result = 0
	for( let i = 0; i < theString.length; i++){
		if( theString[i] == "\t"){
			result++
		} else {
			return result
		}
	}
	throw new Error("blank line here, shouldnt be here")
}



function tokenize(input) {
	let tokens = [];
	let i = 0;

	while (i < input.length) {
		let c = input[i];

		// whitespace
		if (/\s/.test(c)) {
			i++;
			continue;
		}

		// symbols
		if ("()+-[],=".includes(c)) {
			tokens.push({ type: "symbol", contents: c });
			i++;
			continue;
		}

		// string literal
		if (c === '"') {
			let start = ++i;
			while (i < input.length && input[i] !== '"') i++;
			tokens.push({
				type: "string",
				contents: input.slice(start, i)
			});
			i++; // skip closing "
			continue;
		}

		// number (INT)
		if (/[0-9]/.test(c)) {
			let start = i;

			while (i < input.length && /[0-9]/.test(input[i])) {
				i++;
			}

			tokens.push({
				type: "integer",
				contents: Number(input.slice(start, i))
			});

			continue;
		}

		// identifier
		if (/[a-zA-Z_]/.test(c)) {
			let start = i;

			while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
				i++;
			}

			tokens.push({
				type: "identifier",
				contents: input.slice(start, i)
			});

			continue;
		}

		throw new Error("Unknown character: " + c);
	}

	return tokens;
}


function getIndexOfFirstLowestLevelOccurenceOfSymbol( symbol, tokens){
	let depth = 0
	for (let i = 0; i < tokens.length; i++) {
		let t = tokens[i];

		// update depth
		if (t.type === "symbol") {
			if (t.contents === ")") depth--;
			if (t.contents === "]") depth--;
			
			if( t.contents == symbol && depth == 0){ return i}
			
			if (t.contents === "(") depth++;
			if (t.contents === "[") depth++;
		}
	}
	throw "error the symbol wasnt found"
}





// there can be these in a chain (of length 1 or more) because you can have functions that return arrays, or you can have arrays of arrays or arrays of functions

// this is a helper function that instead of returning the properly nested structure just returns an array of the things from left to right
function parseArrayLookupOrFunctionCallChainHelper( tokens){
	
	// this just takes the tokens of the chain, not the identifier at the first
	// this just parses the first one in the chain and if needed does recursion for the others in the chain
	
	if( tokens[0].type == "symbol" && tokens[0].contents == "["){
		// the first thing is an array lookup
		let endBracketIndex = getIndexOfFirstLowestLevelOccurenceOfSymbol("]", tokens)
		let stuffAfterThat = tokens.slice( endBracketIndex + 1)
		let insidesOfIndex = tokens.slice( 1, endBracketIndex)
		
		if( stuffAfterThat.length){
			return [{type:"arrayLookup",index:parseExpression(insidesOfIndex)}, ...parseArrayLookupOrFunctionCallChainHelper(stuffAfterThat)]
		} else {
			return [{type:"arrayLookup",index:parseExpression(insidesOfIndex)}]
		}
		
	}
	if( tokens[0].type == "symbol" && tokens[0].contents == "("){
		// the first thing is a function call
		let endParenIndex = getIndexOfFirstLowestLevelOccurenceOfSymbol(")", tokens)
		let stuffAfterThat = tokens.slice( endParenIndex + 1)
		let argTokens = tokens.slice( 1, endParenIndex)
		
		let parsedArgs = splitByLowestLevelCommas( argTokens).map(a=>parseExpression(a))
		
		if( stuffAfterThat.length){
			return [{type:"functionCall",args:parsedArgs}, ...parseArrayLookupOrFunctionCallChainHelper(stuffAfterThat)]
		} else {
			return [{type:"functionCall",args:parsedArgs}]
		}
		
	}
	throw "error"
	
}

function splitByLowestLevelCommas( tokens){
	let theTerms = [];
	let current = [];

	let depth = 0;
	

	for (let i = 0; i < tokens.length; i++) {
		let t = tokens[i];

		// update depth
		if (t.type === "symbol") {
			if (t.contents === "(") depth++;
			if (t.contents === ")") depth--;

			if (t.contents === "[") depth++;
			if (t.contents === "]") depth--;

			// split only at top level
			if ( t.contents === "," && depth == 0) {
				theTerms.push(current);
				current = [];
				continue; // skip adding operator
			}
		}

		current.push(t);
	}

	if (current.length > 0) {
		theTerms.push(current);
	} else{ /*throw "error expression ends with a ,"*/} // actually can be OK because the whole thing could be empty or just one value

	return theTerms;

}


// note, this treats everything as if it is a bunch of terms being added or subtracted together. If there is no addition or subtraction it works okay, it just acts like there is only one term
function parseLowestLevelAdditionSubtraction(tokens) {
	let theTerms = [];
	let current = [];

	let depthParen = 0;
	let depthBracket = 0;
	
	let isThisTermPositive = true
	

	for (let i = 0; i < tokens.length; i++) {
		let t = tokens[i];

		// update depth
		if (t.type === "symbol") {
			if (t.contents === "(") depthParen++;
			if (t.contents === ")") depthParen--;

			if (t.contents === "[") depthBracket++;
			if (t.contents === "]") depthBracket--;

			// split only at top level
			if (
				(t.contents === "+" || t.contents === "-") &&
				depthParen === 0 &&
				depthBracket === 0
			) {
				theTerms.push({contents:parseExpressionWithoutLowestLevelAdditionSubtraction(current),isPositive:isThisTermPositive});
				current = [];
				if(t.contents === "+"){isThisTermPositive = true}
				if(t.contents === "-"){isThisTermPositive = false}
				continue; // skip adding operator
			}
		}

		current.push(t);
	}

	if (current.length > 0) {
		theTerms.push({contents:parseExpressionWithoutLowestLevelAdditionSubtraction(current),isPositive:isThisTermPositive});
	} else{ /*throw "error expression ends with a + or a - without something after it"*/} // it can actually be okay because the whole thing could be empty

	return {type:"addition/subtraction", terms:theTerms};
}


// Parse the string, int, identifier, function call, or array access
function parseExpressionWithoutLowestLevelAdditionSubtraction( tokens){
	
	
	// is it a string, int, or identifier?
	if( tokens.length == 1){
		// if so, that is pretty easy
		return tokens[0]
	}
	
	// now, it is either an array access or a function call
	// so, just use the parser for that
	return {type:"arrayOrFncall", firstName:tokens[0].contents, callChain:parseArrayLookupOrFunctionCallChainHelper( tokens.slice(1))}
	
}


//WARNING this currently does not support using parentheses to set order of operations
// things supported in expressions: array lookups(expr), strings, function calls with parameters, variables,addition, subtraction, integers
function parseExpression( tokens){
	
	// the starting token should be an identifier (which could then be an ordinary identifier or a function call or array lookup), an int, or a string, optionally followed (after the optional function call or array lookup stuff) by + or -
	// for now, just split by lowest-level + and -
	let terms = parseLowestLevelAdditionSubtraction( tokens)
	return terms
}
