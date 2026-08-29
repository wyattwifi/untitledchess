
export let grammar = {
	main:{
		raw:[
			{type:"repeatZeroOrMore",subrule:"functiondefOrNewline"}
		],
		polished: rawParse => {
			return polishParse(rawParse.contents[0])
		}
	},
	functiondefOrNewline:{
		raw:[
			{type:"oneOfChoices",options:["functiondef","newlineToken"]},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	newlineToken:{
		raw:[
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
	functiondef:{
		raw:[
			{type:"token",tokenType:"FUNCTIONDEF"},
			{type:"token",tokenType:"IDENTIFIER"},
			{type:"token",tokenType:"LPAREN"},
			{type:"optional",subrule:"params"},
			{type:"token",tokenType:"RPAREN"},
			{type:"optional",subrule:"block"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	params:{
		raw:[
			{type:"token",tokenType:"IDENTIFIER"},
			{type:"repeatZeroOrMore",subrule:"otherThanFirstParams"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	otherThanFirstParams:{
		raw:[
			{type:"token",tokenType:"COMMA"},
			{type:"token",tokenType:"IDENTIFIER"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	statement:{
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
			{type:"optional",subrule:"statementBlock"},
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
	statementBlock:{
		raw:[
			{type:"repeatZeroOrMore",subrule:"statementNewline"},
			{type:"required",subrule:"statement"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	statementNewline:{
		raw:[
			{type:"required",subrule:"statement"},
			{type:"token",tokenType:"NEWLINE"}
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
			{type:"required",subrule:"firstTerm"},
			{type:"repeatZeroOrMore",subrule:"otherTerms"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	firstTerm:{
		raw:[
			{type:"optional",subrule:"negationOrAddition"},
			{type:"required",subrule:"thingA"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	negationOrAddition:{
		raw:[
			{type:"oneOfChoices",options:["plusToken","minusToken"]},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	plusToken:{
		raw:[
			{type:"token",tokenType:"PLUS"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	minusToken:{
		raw:[
			{type:"token",tokenType:"MINUS"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	otherTerms:{
		raw:[
			{type:"required",subrule:"negationOrAddition"},
			{type:"required",subrule:"thingA"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	thingA:{
		raw:[
			{type:"oneOfChoices",options:["arrayOrFncall","aString","anIdentifier","anInteger"]},
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
	aString:{
		raw:[
			{type:"token",tokenType:"STRING"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	anIdentifier:{
		raw:[
			{type:"token",tokenType:"IDENTIFIER"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	anInteger:{
		raw:[
			{type:"token",tokenType:"NUMBER"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	arrayOrFncallArgument:{
		raw:[
			{type:"oneOfChoices",options:["arrayBracketClause","funcallParenClause"]},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	arrayBracketClause:{
		raw:[
			{type:"token",tokenType:"LBRACKET"},
			{type:"required",subrule:"expression"},
			{type:"token",tokenType:"RBRACKET"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	funcallParenClause:{
		raw:[
			{type:"token",tokenType:"LPAREN"},
			{type:"optional",subrule:"paramsToo"},
			{type:"token",tokenType:"RPAREN"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	paramsToo:{
		raw:[
			{type:"required",subrule:"expression"},
			{type:"repeatZeroOrMore",subrule:"paramsThree"},
		],
		polished: rawParse => {
			return {
				name:rawParse.contents[0],
				params:polishParse(rawParse.contents[2]),
				statements:polishParse(rawParse.contents[5]),
			}
		}
	},
	paramsThree:{
		raw:[
			{type:"token",tokenType:"COMMA"},
			{type:"required",subrule:"expression"},
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
