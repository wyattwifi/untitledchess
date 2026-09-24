"use strict";

import {polishParse} from "./parseChessLang.js"

// this takes a thing with no blank lines


/*

* is repeatZeroOrMore
? is optional

main = functiondef*
functiondef = FUNCTIONDEF IDENTIFIER LPAREN ( IDENTIFIER ( COMMA IDENTIFIER)*)? RPAREN COLON block? NEWLINE
block = INCREASE_INDENT statementOrSubblock* DECREASE_INDENT
statementOrSubblock = (assignment | declarationAssignment | ifBlock | returnStatement | expression)
assignment =  IDENTIFIER EQUALS expression NEWLINE
declarationAssignment = LET IDENTIFIER EQUALS expression NEWLINE
returnStatement = RETURN expression NEWLINE
ifBlock = IF expression COLON block? NEWLINE
expression = MINUS? expressionPrimary ( (PLUS | MINUS) expressionPrimary)*
expressionPrimary = (arrayOrFncall | IDENTIFIER | NUMBER | STRING )
arrayOrFncall = IDENTIFIER arrayOrFncallGroup arrayOrFncallGroup*
arrayOrFncallGroup = (LPAREN ( expression ( COMMA expression)* )? RPAREN) | (LBRACKET expression RBRACKET)



// each DECREASE_INDENT must be followed by and preceded by a NEWLINE
// each INCREASE_INDENT must be on its own, neither followed nor preceded by NEWLINE
// I know thats wierd, but at the moment that seems the simplest for the parser

["assignment","declarationAssignment","ifBlock","forBlock","returnRule","expression"]


this grammar json itself has the following syntax:
the whole thing is a bunch of rules
Each rule has raw and polished parts
each raw part is an array of things
each thing is an object, which has the type attribute of "token","subrule", "oneOfChoices", or "group". Each thing can also have the properties set to true of optional, repeatZeroOrMore, repeatOnceOrMore(TODO support this in parser), or none of those (but only one of those options, not multiple combined)
Each oneOfChoices that is not a subrule must also have a "name" attribute to be identified by



the polish functions take the array of symbols, not including the name nor wraped in any object

*/

export let grammar = {
	
	main:{
		raw:[
			{type:"subrule",subrule:"functiondef", repeatZeroOrMore:true}
		],
		polish: rawParse => {
			return rawParse[0].map(polishParse) // the first symbol is repeatZeroOrMore, so the parse of that symbol is actually an array. That's why just rawParse.map(polishParse) doesnt work
		}
	},
	functiondef:{
		raw:[
			{type:"token", tokenType:"FUNCTIONDEF"},
			{type:"token", tokenType:"IDENTIFIER"},
			{type:"token", tokenType:"LPAREN"},
			{type:"group", subgroup:[
				{type:"token", tokenType:"IDENTIFIER"},
				{type:"group", subgroup:[
					{type:"token",tokenType:"COMMA"},
					{type:"token",tokenType:"IDENTIFIER"},
				], repeatZeroOrMore:true}
			], optional:true},
			{type:"token",tokenType:"RPAREN"},
			{type:"token",tokenType:"COLON"},
			{type:"subrule",subrule:"block", optional:true},
			{type:"token",tokenType:"NEWLINE"},
		],
		polish: rawParse => {
			let params = []
			if( rawParse[3]){
				params.push(rawParse[3][0])
				params.push(...rawParse[3][1].map(e => e[1]))
			}
			let statements = []
			if( rawParse[6]){ // remember that the function body can be empty
				statements = polishParse( rawParse[6])
			}
			return {
				name:rawParse[1],
				params: params,
				statements:statements,
			}
		}
	},
	block:{
		raw:[
			{type:"token",tokenType:"INCREASE_INDENT"},
			{type:"subrule", subrule:"statementOrSubblock", repeatZeroOrMore:true},
			{type:"token",tokenType:"DECREASE_INDENT"}
		],
		polish: rawParse => {
			return rawParse[1].map(polishParse)
		}
	},
	statementOrSubblock:{
		raw:[
			{type:"oneOfChoices",options:[
				{type:"subrule", subrule:"assignment"},
				{type:"subrule", subrule:"declarationAssignment"},
				{type:"subrule", subrule:"ifBlock"},
				{type:"subrule", subrule:"forBlock"},
				{type:"subrule", subrule:"returnRule"},
				{type:"group", subgroup:[
					{type:"subrule", subrule:"expression"}, //TODO the only type of expression that should be allowed is a functioncall
					{type:"token",tokenType:"NEWLINE"},
				], name:"standaloneFuncall"},
			]},
		],
		polish: rawParse => {
			if( rawParse[0].name == "standaloneFuncall"){
				return {type:"assignment", lVal:"bitBucket", rVal: polishParse(rawParse[0].contents[0])}//TODO do this right
			}
			return polishParse(rawParse[0])
		}
	},
	assignment:{
		raw:[
			{type:"token",tokenType:"IDENTIFIER"},
			{type:"token",tokenType:"EQUALS"},
			{type:"subrule",subrule:"expression"},
			{type:"token",tokenType:"NEWLINE"},
		],
		polish: rawParse => {
			return {type:"assignment", lVal:rawParse[0], rVal: polishParse(rawParse[2])}
		}
	},
	declarationAssignment:{
		raw:[
			{type:"token",tokenType:"LET"},
			{type:"token",tokenType:"IDENTIFIER"},
			{type:"token",tokenType:"EQUALS"},
			{type:"subrule",subrule:"expression"},
			{type:"token",tokenType:"NEWLINE"},
		],
		polish: rawParse => {
			return {type:"declarationAssignment", lVal:rawParse[1], rVal: polishParse(rawParse[3])}
		}
	},
	ifBlock:{
		raw:[
			{type:"token",tokenType:"IF"},
			{type:"subrule",subrule:"expression"},
			{type:"token",tokenType:"COLON"},
			{type:"subrule",subrule:"block",optional:true},
			{type:"token",tokenType:"NEWLINE"},
		],
		polish: rawParse => {
			let statements = []
			if( rawParse[3]){ // remember that the body can be empty
				statements = polishParse( rawParse[3])
			}
			return {type:"if",condition: polishParse(rawParse[1]), contents:statements}
		}
	},
	forBlock:{ // I know this isn't right, but doing it for now, this is really more of a "while" block currently
		raw:[
			{type:"token",tokenType:"FOR"},
			{type:"subrule",subrule:"expression"},
			{type:"token",tokenType:"COLON"},
			{type:"subrule",subrule:"block",optional:true},
			{type:"token",tokenType:"NEWLINE"},
		],
		polish: rawParse => {
			let statements = []
			if( rawParse[3]){
				statements = polishParse(rawParse[3])
			}
			return {type:"for",condition: polishParse(rawParse[1]), contents:statements}
			// return "TODOfor"
		}
	},
	boolExpression:{
		raw:[
			{type:"token",tokenType:"NOT", optional:true},
			{type:"subrule",subrule:"bool"},
			{type:"group",subgroup:[
				{type:"oneOfChoices",options:[
					{type:"token",tokenType:"OR",name:"or"},
					{type:"token",tokenType:"AND",name:"and"}
				]},
				{type:"token",tokenType:"NOT", optional:true},
				{type:"subrule",subrule:"bool"},
			], repeatZeroOrMore:true},
		],
		polish: rawParse => {
			return "TODO"
		}
	},
	numberExpression:{
		raw:[
			{type:"token",tokenType:"MINUS", optional:true},
			{type:"subrule",subrule:"expressionPrimary"},
			{type:"group",subgroup:[
				{type:"oneOfChoices",options:[
					{type:"token",tokenType:"PLUS",name:"plus"},
					{type:"token",tokenType:"MINUS",name:"minus"}
				]},
				{type:"subrule",subrule:"expressionPrimary"},
			], repeatZeroOrMore:true},
		],
		polish: rawParse => {
			
			let terms = []
			
			let isFirstTermPositive = rawParse[0] === null
			terms.push({ contents:polishParse(rawParse[1]), isPositive: isFirstTermPositive})// do the first term
			
			// now do all the other terms
			for( let termTokens of rawParse[2]){
				// now, termTokens is the rawParse of the group
				let isPositive = termTokens[0].name == "plus"//TODO check this
				terms.push({ contents:polishParse(termTokens[1]), isPositive: isPositive})
			}
			
			return { type:"addition/subtraction", terms:terms}
		}
	},
	expression:{
		raw:[
			{type:"token",tokenType:"MINUS", optional:true},
			{type:"subrule",subrule:"expressionPrimary"},
			{type:"group",subgroup:[
				{type:"oneOfChoices",options:[
					{type:"token",tokenType:"PLUS",name:"plus"},
					{type:"token",tokenType:"MINUS",name:"minus"}
				]},
				{type:"subrule",subrule:"expressionPrimary"},
			], repeatZeroOrMore:true},
		],
		polish: rawParse => {
			
			let terms = []
			
			let isFirstTermPositive = rawParse[0] === null
			terms.push({ contents:polishParse(rawParse[1]), isPositive: isFirstTermPositive})// do the first term
			
			// now do all the other terms
			for( let termTokens of rawParse[2]){
				// now, termTokens is the rawParse of the group
				let isPositive = termTokens[0].name == "plus"//TODO check this
				terms.push({ contents:polishParse(termTokens[1]), isPositive: isPositive})
			}
			
			return { type:"addition/subtraction", terms:terms}
		}
	},
	expressionPrimary:{
		raw:[
			{type:"oneOfChoices",options:[
				{type:"subrule",subrule:"arrayOrFncall"},
				{type:"token",tokenType:"IDENTIFIER", name:"variable"},
				{type:"token",tokenType:"NUMBER", name:"numberLiteral"},
				{type:"token",tokenType:"STRING", name:"stringLiteral"},
			]},
		],
		polish: rawParse => {
			switch(rawParse[0].name){
				case "variable":
					return { type: "identifier", contents: rawParse[0].contents }
				case "numberLiteral":
					return { type: "integer", contents: Number(rawParse[0].contents) }
				case "stringLiteral":
					return { type: "string", contents: rawParse[0].contents }
			}
			return polishParse(rawParse[0])
		}
	},
	arrayOrFncall:{
		raw:[
			{type:"token",tokenType:"IDENTIFIER"},
			{type:"subrule",subrule:"arrayOrFncallGroup"},
			{type:"subrule",subrule:"arrayOrFncallGroup",repeatZeroOrMore:true},
		],
		polish: rawParse => {
			let callChain = []
			callChain.push(polishParse(rawParse[1]))
			callChain.push(...rawParse[2].map(polishParse))
			
			return {type:"arrayOrFncall", firstName: rawParse[0], callChain: callChain}
		}
	},
	arrayOrFncallGroup:{
		raw:[
			{type:"oneOfChoices",options:[
				{type:"group",subgroup:[
					{type:"token", tokenType:"LPAREN"},
					{type:"group", subgroup:[
						{type:"subrule", subrule:"expression"},
						{type:"group", subgroup:[
							{type:"token", tokenType:"COMMA"},
							{type:"subrule", subrule:"expression"}
						],repeatZeroOrMore:true}
					], optional:true},
					{type:"token", tokenType:"RPAREN"},
				],name:"funcall"},
				{type:"group",subgroup:[
					{type:"token", tokenType:"LBRACKET"},
					{type:"subrule", subrule:"expression"},
					{type:"token", tokenType:"RBRACKET"},
				],name:"arrayAccess"},
			]},
		],
		polish: rawParse => {
			if( rawParse[0].name == "funcall"){
				
				let args = []
				let rawParseMiddlePart = rawParse[0].contents
				
				if( rawParseMiddlePart[1]){
					// there are some args
					args.push(polishParse(rawParseMiddlePart[1][0]))
					
					for( let a of rawParseMiddlePart[1][1]){
						args.push(polishParse(a[1]))
					}
				}
				
				
				return {type:"functionCall", args: args }
			} else if( rawParse[0].name == "arrayAccess"){
				return {type:"arrayLookup", index: polishParse(rawParse[0].contents[1])}
			} else {
				throw "errA"
			}
		}
	},
	returnRule:{
		raw:[
			{type:"token",tokenType:"RETURN"},
			{type:"subrule",subrule:"expression"},
			{type:"token",tokenType:"NEWLINE"},
		],
		polish: rawParse => {
			return {
				type:"returnStatement",
				value:polishParse(rawParse[1]),
			}
		}
	},
}

