"use strict"

//WARNING for now I'm trying to have this parse correct code correctly. No guarantees about what incorrect code will do
// some of the comments are inaccurate. This could use some work


// the piece descriptions in this chess game are written in their own coding language. That provides extra structure and clarity



class InternalCompilerError extends Error{
	constructor(message){
		super("Internal Compiler Error. User, this isn't your fault. Apparently the compiler is coded wrong. If you want it, here's the error message:" + message)
	}
}

//I'm afraid the AST is not very polished yet.

// I am trying to redo the parser


import {grammar} from "./parserGrammar.js"

// this is the main overarching function that takes the source code string and returns the AST
export function parse(tokenList){
	
	
	function parseRuleRaw(ruleName){
		// this is the first step of parsing a rule. It returns the raw parse, not the AST
		// More specifically, it returns {name:"ruleName",contents:[array of the parsed tokens/subrules. Each part of the rule is one element of the array. Tokens are just strings of their contents. repeatZeroOrMore is an array of the raw parses of each repitition. optional is the raw parse of the subrule if it exists, and null otherwise.]}
		
		let result = []
		
		
		if( !grammar[ruleName]){
			throw new InternalCompilerError("rule " + ruleName + " does not exist")
		}
		
		
		let rule = grammar[ruleName].raw
		
		for( let i = 0; i < rule.length; i++){
			switch( rule[i].type){
				case "required":{
					
					let savedPosition = position
					let attemptedParse = parseRuleRaw(rule[i].subrule)
					if( attemptedParse.error){
						position = savedPosition // it didn't work, undo that part
						attemptedParse.stack.push(ruleName)
						return attemptedParse
					} else {
						result.push( attemptedParse)
					}
					break}
				case "optional":{
					let savedPosition = position
					let attemptedParse = parseRuleRaw(rule[i].subrule)
					if( attemptedParse.error){
						position = savedPosition // it didn't work, undo that part
						attemptedParse.stack.push(ruleName)
						result.push(null)
					} else {
						result.push( attemptedParse)
					}
					break}
				case "oneOfChoices":{
					let errors = [] // the error returned by each option that failed
					let savedPosition
					let succeeded = false
					for( let j = 0; j < rule[i].options.length && !succeeded; j++){
						let option = rule[i].options[j]
						savedPosition = position
						let attemptedParse = parseRuleRaw(option)
						if( attemptedParse.error){
							position = savedPosition // it didn't work, undo that part
							errors.push(attemptedParse)
						} else {
							result.push( attemptedParse)
							succeeded = true
						}
					}
					// if it was a success, the result has already been pushed to the result array
					if( !succeeded){ // ...but if not, we need to handle the error
						const errorThatGotFurthest = errors.reduce((best, current) =>
							current.position > best.position ? current : best
						)
						errorThatGotFurthest.stack.push(ruleName)
						return errorThatGotFurthest
					}
					break}
				case "repeatZeroOrMore":{
					let savedPosition = position
					let done = false
					let myResult = []
					while(!done){
						savedPosition = position
						let r = parseRuleRaw(rule[i].subrule)
						if( r.error){
							r.stack.push(ruleName)
							position = savedPosition // it didn't work
							done = true
						} else {
							myResult.push( r)
						}
					}
					result.push(myResult)
					break}
				case "token":{
					let r = consume(rule[i].tokenType)
					if( r.error){
						r.stack.push(ruleName)
						return r
					} else {
						result.push( r.contents)
					}
					break}
			}
		}
		return result
	}
	/*
	// parses one of the items in the array of the rule declaration
	function parsePartOfRule( partOfRule){
		switch( partOfRule.type){
			case "required":{
				
				let savedPosition = position
				let attemptedParse = parseRuleRaw(rule[i].subrule)
				if( attemptedParse.error){
					position = savedPosition // it didn't work, undo that part
					return attemptedParse
				} else {
					result.push( attemptedParse)
				}
				result.push(parseRuleRaw(rule[i].subrule))
				break}
			case "optional":{
				let savedPosition = position
				let attemptedParse = parseRuleRaw(rule[i].subrule)
				if( attemptedParse.error){
					position = savedPosition // it didn't work, undo that part
					result.push(null)
				} else {
					result.push( attemptedParse)
				}
				break}
			case "oneOfChoices":{
				let errors = [] // the error returned by each option that failed
				let savedPosition
				let succeeded = false
				for( let option of rule[i].options){
					
					savedPosition = position
					let attemptedParse = parseRuleRaw(option)
					if( attemptedParse.error){
						position = savedPosition // it didn't work, undo that part
						errors.push(attemptedParse)
					} else {
						result.push( attemptedParse)
						succeeded = true
					}
				}
				// if it was a success, the result has already been pushed to the result array
				if( !succeeded){ // ...but if not, we need to handle the error
					const errorThatGotFurthest = errors.reduce((best, current) =>
					current.position > best.position ? current : best
					)
					return errorThatGotFurthest
				}
				break}
			case "repeatZeroOrMore":{
				let savedPosition = position
				let myResult = []
				let done = false
				while(!done){
					savedPosition = position
					let r = parseRuleRaw(rule[i].subrule)
					if( r.error){
						position = savedPosition // it didn't work
						done = true
					} else {
						result.push( r)
					}
				}
				result.push(myResult)
				break}
			case "token":{
				let r = consume(rule[i].tokenType)
				if( r.error){
					return r
				} else {
					result.push( r)
				}
				break}
		}
	}*/
	
	function polishParse(ruleRawParse){
		return grammar[ruleRawParse.name].polish(ruleRawParse)
	}
	
	
	
	
	
	let position = 0
	function consume(tokenType){
		if( !tokenList[position]){
			let error = {error:true,position:position,message:"Parse Error: expected " + tokenType + " but got nothing at position " + position}
			if( position > furthestError.position){
				// this is the new furthest error. We might need this later on
				furthestError = error
			}
			return error
		}
		if( tokenList[position].type != tokenType){
			// throw new Error("parse error")
			// let stack = new Error("").stack
			// debugger
			// console.trace()
			let error = {error:true,position:position,message:"Parse Error: expected " + tokenType + " but got " + tokenList[position].type + " at position " + position,stack:[] }
			if( position > furthestError.position){
				// this is the new furthest error. We might need this later on
				furthestError = error
			}
			if( position > furthestErrorsPosition){
				// this is the new furthest error. We might need this later on
				furthestErrors = [error]
				furthestErrorsPosition = position
			}
			if( position == furthestErrorsPosition){
				// this is the new furthest error. We might need this later on
				furthestErrors.push(error)
			}
			// if( position == 48){debugger}
			return error
		}
		let contents = tokenList[position].contents
		// if(!contents){debugger}
		position++
		return {success:true, contents:contents}
	}
	
	let furthestError = {position:-1}// do this as a temporary placeholder
	
	let furthestErrors = []
	let furthestErrorsPosition = -1
	
	// return polishParse(parseRuleRaw("main")) // this is always the main overall rule
	let result = parseRuleRaw("main")
	
	if( position != tokenList.length){
		// it did not get to the end. This could be if the rules were satisfied but then there was gobleygook at the end
		// if that happens, return the error that got the farthest
		console.log(furthestErrors)
		throw furthestError
	}
	
	return result // temp just return the raw thing
}







/*


whole thing = functiondef*
functiondef = IDENTIFIER LPAREN params-optional RPAREN LBRACE statement* RBRACE
params = IDENTIFIER ( COMMA IDENTIFIER)*
statement = assignment | if | while
assignment = IDENTIFIER EQUALS expression
expression = 
if =
while =










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


