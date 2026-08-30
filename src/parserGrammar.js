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


*/
//TODO this new grammar JSON syntax is nicer, but the parser needs to support it
export let grammar = {
	
	main:{
		raw:[
			{type:"repeatZeroOrMore",subrule:"functiondef"}
		],
		polished: rawParse => {
			return polishParse(rawParse.contents[0])
		}
	},
	functiondef:{
		raw:[
			{type:"token",tokenType:"FUNCTIONDEF"},
			{type:"token",tokenType:"IDENTIFIER"},
			{type:"token",tokenType:"LPAREN"},
			{type:"optional",subgroup:[
				{type:"token",tokenType:"IDENTIFIER"},
				{type:"repeatZeroOrMore",subrule:[
					{type:"token",subrule:"COMMA"},
					{type:"token",subrule:"IDENTIFIER"},
				]}
			]},
			{type:"token",tokenType:"RPAREN"},
			{type:"optional",subrule:"block"},
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
			{type:"repeatZeroOrMore",subrule:"statementOrSubblock"},
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
			{type:"oneOfChoices",options:["assignment","declarationAssignment","ifBlock","forBlock","returnRule","expression"]},//TODO the only type of expression that should be allowed is a functioncall
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
			{type:"required",subrule:"expression"},
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
			{type:"required",subrule:"expression"},
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
			{type:"required",subrule:"expression"},
			{type:"token",tokenType:"RPAREN"},
			{type:"optional",subrule:"block"},
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
	forBlock:{ // I know this isn't right, but doing it for now
		raw:[
			{type:"token",tokenType:"FOR"},
			{type:"token",tokenType:"LPAREN"},
			{type:"required",subrule:"expression"},
			{type:"token",tokenType:"RPAREN"},
			{type:"optional",subrule:"block"},
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
			{type:"optional",subgroup:[
				{type:"token",tokenType:"MINUS"},
			]},
			{type:"required",tokenType:"expressionPrimary"},
			{type:"repeatZeroOrMore",subgroup:[
				{type:"oneOfChoices",options:[
					{type:"token",tokenType:"PLUS"},
					{type:"token",tokenType:"MINUS"}
				]},
				{type:"required",subrule:"expressionPrimary"},
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
	expressionPrimary:{
		raw:[
			{type:"oneOfChoices",options:[
				{type:"required",subrule:"arrayOrFncall"},
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
			{type:"required",subrule:"arrayOrFncallArgument"},
			{type:"repeatZeroOrMore",subrule:"arrayOrFncallArgument"},
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
				{type:"subgroup",contents:[
					{type:"token", tokenType:"LPAREN"},
					{type:"optional", subrule:[
						{type:"required", subrule:"expression"},
						{type:"repeatZeroOrMore", subrule:[
							{type:"token", tokenType:"COMMA"},
							{type:"required", subrule:"expression"}
						]}
					]},
					{type:"token", tokenType:"RPAREN"},
				]},
				{type:"subgroup",contents:[
					{type:"token", tokenType:"LBRACKET"},
					{type:"required", subrule:"expression"},
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
			{type:"required",subrule:"expression"},
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

