

import {polishParse} from "./parseChessLang.js"

import {InternalCompilerError} from "./compiler-utils.js"
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
			{type:"subrule",subrule:"statementOrSubblock", repeatZeroOrMore:true}
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
				type:"functionDefinition",
				name:rawParse[1],
				params: params,
				paramTypes: params.map(a=>null),
				statements:statements,
				returnType:null,
			}
		}
	},
	
	/*
	here is the format of a class declaration:
	
	class Dog inherits Animal,Trustable:
		let weight = 100 #default initialization
		let name
		private let ssn
		static let isLiked = True #classwide property
		def init( name):
			self.name = name
		def bark():
			print(self.name + " says bark")
		private def leakSSN():
			print(self.ssn)
		static def becomeWolves():
			static.isLiked = False
	
	
	
	
	*/
	
	classDef:{
		raw:[
			{type:"token", tokenType:"CLASSDEF"},
			{type:"token", tokenType:"IDENTIFIER"},
			{type:"group", subgroup:[ // the optional inheritance
				{type:"token", tokenType:"INHERITS"},
				{type:"token", tokenType:"IDENTIFIER"},
				{type:"group", subgroup:[
					{type:"token",tokenType:"COMMA"},
					{type:"token",tokenType:"IDENTIFIER"},
				], repeatZeroOrMore:true}
			], optional:true},
			{type:"token",tokenType:"COLON"},
			{type:"token",tokenType:"INCREASE_INDENT"},
			{type:"subrule", subrule:"classDefElement", repeatZeroOrMore:true},
			{type:"token",tokenType:"DECREASE_INDENT"},
			{type:"token",tokenType:"NEWLINE"},
		],
		polish: rawParse => {
			
			let ancestorNames = []
			if( rawParse[2]){
				ancestorNames.push(rawParse[2][1])
				ancestorNames.push(...rawParse[2][2].map(e => e[1]))
			}
			
			
			return {
				type:"classDefinition",
				name:rawParse[1],
				ancestorNames:ancestorNames,
				contents:rawParse[5].map(polishParse),
			}
		}
	},
	classDefElement:{
		raw:[
			{type:"token", tokenType:"STATIC", optional:true},
			{type:"subrule", subrule:"classMemberVisibilityModifier", optional:true},
			{type:"oneOfChoices",options:[
				{type:"subrule", subrule:"declarationAssignment"},
				{type:"subrule", subrule:"functiondef"},
			]},
		],
		polish: rawParse => {
			console.log(rawParse)
			
			let visibility = "PUBLIC" // the default
			if( rawParse[1] != null){
				visibility = rawParse[1].contents[0].name
			}
			
			if( rawParse[2].name == "declarationAssignment"){
				
				return {
					type:"property",
					isStatic: rawParse[0] !== null,
					visibility: visibility,
					contents:polishParse(rawParse[2])
				}
			} else if( rawParse[2].name == "functiondef"){
				
				return {
					type:"method",
					isStatic: rawParse[0] !== null,
					visibility: visibility,
					contents:polishParse(rawParse[2])
				}
			} else {
				throw new InternalCompilerError("This should never be reached")
			}
			
		}
	},
	classMemberVisibilityModifier:{
		raw:[
			{type:"oneOfChoices",options:[
				{type:"token",tokenType:"PRIVATE", name:"PRIVATE"},
				{type:"token",tokenType:"PUBLIC", name:"PUBLIC"},
				{type:"token",tokenType:"PROTECTED", name:"PROTECTED"},
			]},
		],
		polish: rawParse => {
			throw new InternalCompilerError("Not needed this shouldnt ever get called")
		}
	},
	
	
	
	
	//TODO in classes and in general support declaring without assignment
	//TODO potentially support defining types within classes for use within that class only
	
	
	
	
	
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
				{type:"subrule", subrule:"whileBlock"},
				{type:"subrule", subrule:"returnRule"},
				{type:"group", subgroup:[
					{type:"subrule", subrule:"expression"}, //NOTE the only type of expression that should be allowed is a functioncall
					{type:"token",tokenType:"NEWLINE"},
				], name:"standaloneFuncall"},
				{type:"subrule",subrule:"functiondef"},
				{type:"subrule",subrule:"classDef"},
			]},
		],
		polish: rawParse => {
			if( rawParse[0].name == "standaloneFuncall"){
				return {type:"standaloneFuncall", expression: polishParse(rawParse[0].contents[0])}//TODO make this more intuitive
			}
			return polishParse(rawParse[0])
		}
	},
	assignment:{
		raw:[
			{type:"subrule",subrule:"expression"},
			{type:"token",tokenType:"EQUALS"},
			{type:"subrule",subrule:"expression"},
			{type:"token",tokenType:"NEWLINE"},
		],
		polish: rawParse => {
			return {type:"assignment", lVal:polishParse(rawParse[0]), rVal: polishParse(rawParse[2])}
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
	forBlock:{
		raw:[
			{type:"token",tokenType:"FOR"},
			{type:"token",tokenType:"IDENTIFIER"},
			{type:"token",tokenType:"IN"},
			{type:"subrule",subrule:"expression"},
			{type:"token",tokenType:"COLON"},
			{type:"subrule",subrule:"block",optional:true},
			{type:"token",tokenType:"NEWLINE"},
		],
		polish: rawParse => {
			let statements = []
			if( rawParse[5]){ // remember that the body can be empty
				statements = polishParse(rawParse[5])
			}
			return {type:"for",loopVariableName:rawParse[1], iterable: polishParse(rawParse[3]), contents:statements}
		}
	},
	whileBlock:{
		raw:[
			{type:"token",tokenType:"WHILE"},
			{type:"subrule",subrule:"expression"},
			{type:"token",tokenType:"COLON"},
			{type:"subrule",subrule:"block",optional:true},
			{type:"token",tokenType:"NEWLINE"},
		],
		polish: rawParse => {
			let statements = []
			if( rawParse[3]){ // remember that the body can be empty
				statements = polishParse(rawParse[3])
			}
			return {type:"while",condition: polishParse(rawParse[1]), contents:statements}
		}
	},
	//"expression" is handled separately, in a Pratt parser
	functionCallArgumentsIncludingParens:{
		raw:[
			{type:"token", tokenType:"LPAREN"},
			{type:"group", subgroup:[
				{type:"subrule", subrule:"expression"},
				{type:"group", subgroup:[
					{type:"token", tokenType:"COMMA"},
					{type:"subrule", subrule:"expression"}
				],repeatZeroOrMore:true},
			], optional:true},
			{type:"token", tokenType:"RPAREN"},
		],
		polish: rawParse => {
			
			let args = []
			if( rawParse[1]){
				args = [ rawParse[1][0]]
				for( let i = 0; i < rawParse[1][1].length; i++){
					args.push( rawParse[1][1][i][1])
				}
			}
			return args
		},
	},
	returnRule:{
		raw:[
			{type:"token",tokenType:"RETURN"},
			{type:"subrule",subrule:"expression", optional:true},
			{type:"token",tokenType:"NEWLINE"},
		],
		polish: rawParse => {
			if( rawParse[1]){
				return {
					type:"returnStatement",
					value:polishParse(rawParse[1]),
				}
			} else {
				return {
					type:"returnStatement",
					value:"NONE", // TODO do this better
				}
			}
		}
	},
	arrayDeclarationBesidesFirstBracket:{
		raw:[
			// {type:"token",tokenType:"LBRACKET"},// the expression stuff already consumest that
			{type:"group", subgroup:[
				{type:"subrule", subrule:"expression"},
				{type:"group", subgroup:[
					{type:"token", tokenType:"COMMA"},
					{type:"subrule", subrule:"expression"}
				],repeatZeroOrMore:true},
			], optional:true},
			{type:"token",tokenType:"RBRACKET"},
		],
		polish: rawParse => {
			
			let elements = []
			if( rawParse[0]){
				elements = [ rawParse[0][0].contents]
				for( let i = 0; i < rawParse[0][1].length; i++){
					elements.push( rawParse[0][1][i][1].contents)
				}
			}
			return elements
		}
	},
}

