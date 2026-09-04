"use strict";



// this takes a thing with no blank lines


/*

* is repeatZeroOrMore
? is optional

main = functiondef*
functiondef = FUNCTIONDEF IDENTIFIER LPAREN ( IDENTIFIER ( COMMA IDENTIFIER)*)? RPAREN block? NEWLINE
block = INCREASE_INDENT statementOrSubblock* DECREASE_INDENT
statementOrSubblock = (assignment | declarationAssignment | ifBlock | returnStatement | expression)
assignment =  IDENTIFIER EQUALS expression NEWLINE
declarationAssignment = LET IDENTIFIER EQUALS expression NEWLINE
returnStatement = RETURN expression NEWLINE
ifBlock = IF LPAREN  expression RPAREN block? NEWLINE
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
each thing is an object, which has the type attribute of "token","subrule", "oneOfChoices", or "group". Each thing can also have the properties set to true of optional, repeatZeroOrMore, repeatOnceOrMore, or none of those (but only one of those options, not multiple combined)
//TODO it currently uses an old format, update it to use this new format

*/
//TODO this new grammar JSON syntax is nicer, but the parser needs to support it
export let grammar = {
	
	main:{
		raw:[
			{type:"subrule",subrule:"functiondef", repeatZeroOrMore:true}
		],
		polished: rawParse => {
			return polishParse(rawParse.contents[0])
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
			{type:"subrule",subrule:"block", optional:true},
			{type:"token",tokenType:"NEWLINE"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	block:{
		raw:[
			{type:"token",tokenType:"INCREASE_INDENT"},
			{type:"subrule", subrule:"statementOrSubblock", repeatZeroOrMore:true},
			{type:"token",tokenType:"DECREASE_INDENT"}
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
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
				]},
			]},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	assignment:{
		raw:[
			{type:"token",tokenType:"IDENTIFIER"},
			{type:"token",tokenType:"EQUALS"},
			{type:"subrule",subrule:"expression"},
			{type:"token",tokenType:"NEWLINE"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
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
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	ifBlock:{
		raw:[
			{type:"token",tokenType:"IF"},
			{type:"token",tokenType:"LPAREN"},
			{type:"subrule",subrule:"expression"},
			{type:"token",tokenType:"RPAREN"},
			{type:"subrule",subrule:"block",optional:true},
			{type:"token",tokenType:"NEWLINE"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	forBlock:{ // I know this isn't right, but doing it for now, this is really more of a "while" block currently
		raw:[
			{type:"token",tokenType:"FOR"},
			{type:"token",tokenType:"LPAREN"},
			{type:"subrule",subrule:"expression"},
			{type:"token",tokenType:"RPAREN"},
			{type:"subrule",subrule:"block",optional:true},
			{type:"token",tokenType:"NEWLINE"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	expression:{
		raw:[
			{type:"token",tokenType:"MINUS", optional:true},
			{type:"subrule",subrule:"expressionPrimary"},
			{type:"group",subgroup:[
				{type:"oneOfChoices",options:[
					{type:"token",tokenType:"PLUS"},
					{type:"token",tokenType:"MINUS"}
				]},
				{type:"subrule",subrule:"expressionPrimary"},
			], repeatZeroOrMore:true},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	expressionPrimary:{
		raw:[
			{type:"oneOfChoices",options:[
				{type:"subrule",subrule:"arrayOrFncall"},
				{type:"token",tokenType:"IDENTIFIER"},
				{type:"token",tokenType:"NUMBER"},
				{type:"token",tokenType:"STRING"},
			]},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	arrayOrFncall:{
		raw:[
			{type:"token",tokenType:"IDENTIFIER"},
			{type:"subrule",subrule:"arrayOrFncallGroup"},
			{type:"subrule",subrule:"arrayOrFncallGroup",repeatZeroOrMore:true},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
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
				]},
				{type:"group",subgroup:[
					{type:"token", tokenType:"LBRACKET"},
					{type:"subrule", subrule:"expression"},
					{type:"token", tokenType:"RBRACKET"},
				]},
			]},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	returnRule:{
		raw:[
			{type:"token",tokenType:"RETURN"},
			{type:"subrule",subrule:"expression"},
			{type:"token",tokenType:"NEWLINE"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
}

