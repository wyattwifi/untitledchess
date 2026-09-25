


import {lexer} from "./lexer.js" //temporarily, for dev


//WARNING for now I'm trying to have this parse correct code correctly. No guarantees about what incorrect code will do
// some of the comments are inaccurate. This could use some work


// the piece descriptions in this chess game are written in their own coding language. That provides extra structure and clarity



export class InternalCompilerError extends Error{
	constructor(message){
		super("Internal Compiler Error. User, this isn't your fault. Apparently the compiler is coded wrong. If you want it, here's the error message:" + message)
	}
}

//I'm afraid the AST is not very polished yet.

// I am trying to redo the parser


import {grammar} from "./parserGrammar.js"



// this is the main overarching function that takes the source code string and returns the AST
export function parse(tokenList){
	
	
	console.log(tokenList)
	
	/* this returns {success:true|false, and then (if successful) contents:theRawParse}
	 this does not handle backtracking, all the putting-back-the-position needs done in parseSymbolIgnoreModifiers
	 possibilities of rawParse based on type:
	 repeatZeroOrMore: array of raw parses gotten with parseSymbolIgnoreModifiers
	 optional: array of raw parses gotten with parseSymbolIgnoreModifiers
	 no modifiers: raw parse gotten with parseSymbolIgnoreModifiers
	*/
	//TODO support repeatOnceOrMore
	function parseSymbol( symbol){
		
		if( symbol.repeatZeroOrMore){
			let result = []
			let savedPosition
			while(true){
				savedPosition = position
				let a = parseSymbolIgnoreModifiers( symbol)
				if( a.success){
					result.push(a.contents)
				} else {
					position = savedPosition
					break
				}
			}
			
			return {success:true, contents:result}
			
		} else if( symbol.optional ){
			let savedPosition = position
			let result = parseSymbolIgnoreModifiers( symbol)
			if( result.success){
				return result
			} else {
				position = savedPosition
				return {success:true, contents:null}
			}
		} else {
			// it does not have any modifier, it is just a normal required thing
			return parseSymbolIgnoreModifiers( symbol)
		}
		// all 3 of the branches return. You should never get here
	}
	
	
	// this returns {success:true|false, and then (if successful) contents:theRawParse}
	/*
	here are the values that "theRawParse" can have for each branch:
	token:string of token contents
	subrule: {name:string of subrule name, contents:{name:stringOfSubruleName, contents:rawParse of subrule, gotten with parseArrayOfSymbols}}NOTE maybe this could be improved
	oneOfChoices:{name:stringName (either the name of the subrule or a name specified in the grammar), contents:rawParse gotten with parseSymbol}
	group: array of rawParses of symbols in group, gotten from parseSymbol
	*/
	function parseSymbolIgnoreModifiers( symbol){
		// this does not care if it is optional or repeated, it just parses the raw thing without those modifiers, as if it did not have any modifiers
		
		switch( symbol.type){
			case "token":{
				// consume only increases the position if it was successful, so we do not need to worry about backtracking here. Also, the return value of consume already has built-in success:true|false
				return consume(symbol.tokenType)
				break}
			case "subrule":{
				
				// expressions are handled by a pratt parser instead of the main recursive descent parser
				if( symbol.subrule == "expression"){
					let result = expressionPrattParser(0)
					if( result.success){
						return {success:true,contents:{name:"expression",contents:result.contents}}
					} else {
						return {success:false}
					}
				}
				
				if( !grammar[symbol.subrule]){
					console.trace()
					console.log(symbol)
					throw new InternalCompilerError("The grammar calls for a subrule that is not defined in the grammar")
				}
				
				let result = parseArrayOfSymbols(grammar[symbol.subrule].raw)
				if( result.success){
					return {success:true, contents:{name:symbol.subrule, contents:result.contents}}
				} else {
					return result
				}
				// return parseArrayOfSymbols(grammar[symbol.subrule].raw)
				break}
			case "oneOfChoices":{
					// it has the property "options", which is an array of the allowed symbols
					//TODO implement correctly
					for( let i = 0; i < symbol.options.length; i++){
						let savedPosition = position
						let attemptedParse = parseSymbol(symbol.options[i])
						if( attemptedParse.success){
							// we need to add in the name to identify it
							let name
							let resultSymbol = symbol.options[i]
							if(resultSymbol.type == "subrule"){
								name = resultSymbol.subrule
								// also, currently the return of parsing a subrule includes the name. We only need it once, so take the extra layer out
								attemptedParse.contents = attemptedParse.contents.contents
								//TODO do this better
							} else {
								if(!resultSymbol.name){
									throw new InternalCompilerError("a8963249")
								}
								name = resultSymbol.name
							}
							
							return {success:true,contents:{name:name,contents:attemptedParse.contents}}//I know this looks a bit wierd, but I believe I did it right to satisfy the specs
						} else {
							position = savedPosition // it didn't work, undo that part
						}
					}
					// now we went through and tried all of the options, and none of them worked
					
					// so, we return an error. For easy debugging, we use the error that got the furthest
					//however, the error messages actually get handled separately, in the conusme function, so we dont need to do that now
					return {success:false}
				
				break}
			case "group":{
				
				return parseArrayOfSymbols(symbol.subgroup)
				break}
			default:
				throw new InternalCompilerError("parse symbol ignore modifiers failed for " + JSON.stringify(symbol))
		}
		
		
	}
	
	
	
	// returns {success:true|false, and then (if successful) contents:[array of raw parses]}
	// the rawParses are gotten from parseSymbol
	function parseArrayOfSymbols(arrayOfSymbols){
		let result = []
		for( let i = 0; i < arrayOfSymbols.length; i++){
			let a = parseSymbol( arrayOfSymbols[i])
			if( a.success){
				result.push(a.contents)
			} else {
				return {success:false}
			}
		}
		return {success:true, contents:result}
	}
	
	
	
	let furthestErrors = []
	let furthestErrorsPosition = -1
	
	// this is where all the parse error-handling happens. For easy debugging, we only keep the errors that got the furthest
	function registerError( expectedToken, actualToken){
		if( position > furthestErrorsPosition){
			furthestErrors = ["Parse Error: expected " + expectedToken + " but got " + actualToken + " at position " + position]
			furthestErrorsPosition = position
		} else if ( position == furthestErrorsPosition){
			furthestErrors.push("Parse Error: expected " + expectedToken + " but got " + actualToken + " at position " + position)
		}
	}
	
	
	let position = 0
	// consume only increases the position if it was successful
	// returns {success:true|false, contents(if successful): string or whatever that is the raw contents of the token, eg the name of the variable if the token is IDENTIFIER}
	function consume(tokenType){
		if( !tokenList[position]){
			registerError( tokenType, "nothing")
			return {success:false,err:"TODO"}
		}
		if( tokenList[position].type != tokenType){
			registerError( tokenType, tokenList[position].type)
			return {success:false,err:"TODO"}
		}
		let contents = tokenList[position].contents
		// if(!contents){debugger}
		position++
		return {success:true, contents:contents}
	}
	
	function peek(){
		return tokenList[position]
	}
	
	
	// returns {success:true|false, (if successful) contents:parse}
	function expressionPrattParser( minimumBindingPower){
		
		
		let currentToken = peek()
		consume(currentToken.type)
		let left
		
		//TODO support unary operators
		
		switch( currentToken.type){
			case "IDENTIFIER":{
				left = {op:"variable", contents:currentToken.contents}
				if( peek().type == "LPAREN" || peek().type == "LBRACKET"){
					// it is the start of a funcall or arraylookup
					// this is better handled by the recursive descent parser
					position-- // undo the consuming the identifier
					left = parseArrayOfSymbols(grammar["arrayOrFncall"].raw)
					if( !left.success){
						return {success:false}
					}
					
					console.log(left.contents)
					
					left = {op:"funcallOrArrayAccess", contents:polishParse({name:"arrayOrFncall", contents:left.contents})}
				}
				break}
			case "NUMBER":{
				left = {op:"number", contents:currentToken.contents}
				break}
			//NOTE I deliberately did not support unary plus. I think it potentially would cause more trouble than it would solve
			case "MINUS":{
				consume("MINUS")
				let potentialOperand = expressionPrattParser( 100)
				if( !potentialOperand.success){
					return {success:false}
				}
				left = {op:"UNARYMINUS", operand:potentialOperand.contents}
				break}
			case "NOT":{
				consume("NOT")
				let potentialOperand = expressionPrattParser( 30)
				if( !potentialOperand.success){
					return {success:false}
				}
				left = {op:"NOT", operand:potentialOperand.contents}
				break}
			case "STRING":{
				left = {op:"stringLiteral",contents:currentToken.contents}
				break}
			case "LPAREN":{
				let potentialInnerExpression = expressionPrattParser(0)
				if( !potentialInnerExpression.success){
					return {success:false}
				}
				
				left = {op:"parengroup", contents:potentialInnerExpression.contents}
				if( !consume("RPAREN").success){
					registerError( "RPAREN", peek())
					return {success:false}
				}
				break}
			default:{
				registerError( "identifier, number, minus, string or lparen", peek())
				return {success:false}}
		}
		while(true){
			currentToken = peek()
			
			let bindingPowers = {
				OR:{left:10,right:11},
				AND:{left:20,right:21},
				//NOT has binding power of 30, but it is unary so it is handled above
				TESTEQUAL:{left:40,right:41},
				TESTGREATERTHAN:{left:40,right:41},
				TESTLESSTHAN:{left:40,right:41},
				TESTGREATERTHANOREQUALTO:{left:40,right:41},
				TESTLESSTHANOREQUALTO:{left:40,right:41},
				PLUS:{left:50,right:51},
				MINUS:{left:50,right:51},
				ASTERISK:{left:60,right:61},
				SLASH:{left:60,right:61},
			}
			
			if( !bindingPowers[currentToken.type]){
				break
			}
			let binding_powers = bindingPowers[currentToken.type]
			
			if( binding_powers.left < minimumBindingPower){
				break
			}
			
			consume(currentToken.type)
			
			let potentialRight = expressionPrattParser(binding_powers.right)
			if( !potentialRight.success){
				return {success:false}
			}
			
			left = {op:currentToken.type, left:left, right:potentialRight.contents}
			
		}
		return {success:true, contents:left}
	}
	
	
	
	// return polishParse(parseRuleRaw("main")) // this is always the main overall rule
	let rawParse = parseArrayOfSymbols(grammar["main"].raw)//parseRuleRaw("main")
	
	console.log(JSON.stringify(rawParse))
	
	
	// now, just get it into the same format as the other rule parses (for the polishParse function). This is needed because in the other parts of the parsing this is done by the thing calling parseArrayOfSymbols. This time it is being called from out here, so we need to do it here
	
	let rawParseFormatTwo = {name:"main",contents:rawParse.contents}
	
	
	
	if( position != tokenList.length || !rawParse.success){
		// it did not get to the end. This could be, for example, if the rules were satisfied but then there was gobleygook at the end
		// if that happens, return the error that got the farthest
		console.log(furthestErrors)
		throw "a"
		// throw furthestError
	}
	
	return polishParse( rawParseFormatTwo)
	
	
	
	
}

/*
the expression structure was just redone. Now  all expressions are objects containing {op:"stringOfOperationName", otherProperties...}
TODO this could be more polished and have more intuitive names
Possible values for op:
"variable"
"funcallOrArrayAccess"
"number"
"UNARYMINUS"
"NOT"
"stringLiteral"
"parengroup"
"PLUS"
"MINUS"
"ASTERISK"
"SLASH"
"TESTEQUAL"
"TESTGREATERTHAN"
"TESTLESSTHAN"
"TESTGREATERTHANOREQUALTO"
"TESTLESSTHANOREQUALTO"
*/










export function polishParse(ruleRawParse){
	
	if( ruleRawParse.name == "expression"){
		return ruleRawParse.contents
	}
	
	if(!ruleRawParse || !grammar[ruleRawParse.name]){
		console.log(ruleRawParse)
		console.trace()
		debugger
	}
	return grammar[ruleRawParse.name].polish(ruleRawParse.contents)
}



/*




TODO what the parser currently returns does not match up with this

STRUCTURE OF THE AST:

The main thing is an array of functions
 each function is: {
		name:name,
		params:[ array of string names of params],
		statements:[statement, statement, ...],
	}


			each statement is one of these things for now:
1: {type:"assignment", lVal:tokens[0].contents, rVal: expression}
1: {type:"declalaniosAssignment", lVal:tokens[0].contents, rVal: expression}
2: {type:"if",condition: expression, contents:[statements]}
3: {type:"while",condition: expression, contents:[statements]}



each expression is: { type:"addition/subtraction", terms:[term]}

each term is: { contents:thingA, isPositive: bool} // for simplicity the parser always treats an expression of any sort as a list of terms, just often there will be only one term
// for now multiplication and division are not supported

each thingA (aka expressionPrimary) is:
1:{type:"arrayOrFncall", firstName: string or array I'm not sure which, callChain: [thingB]}
2: { type: "string", contents: string or array I'm not sure which }
3:{ type: "integer", contents: a normal JS number }
4:{ type: "identifier", contents: string or array I'm not sure which }

each thingB is:
1: {type:"arrayLookup", index: expression}
2: {type:"functionCall",args: [expressions] }


A function/array lookup chain is something like (in JS) thing[3][6]( aVariable, "some text")["key based array lookup"]("yet another function call")



Possible thing to switch it to:
{type:"functionCall", theFunction:expression that returns a function, params:[ array of expressions]}
{type:"arrayAccess", array:expression that returns an array, index:expression that returns string or int}
{type:"unaryMathOp", kind:"-"|"!", operand:expression}
{type:"binaryMathOp", kind:"-"|"!", operand:expression}




*/


