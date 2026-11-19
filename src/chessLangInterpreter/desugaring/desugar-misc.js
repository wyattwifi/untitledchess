




import {InternalCompilerError, doForEachStatementArray, doForEachStatement, getScopeFromScopeIdentifier, compilerWarn, doForEachExpression, doForThisScopeArrayAndAllScopeArraysUnderIt, getFunctionThisIsIn, getStatementsInNode, getNodeFromNodeIdentifier} from "../compiler-utils.js"
import {importedFunctionDeclarations} from "../type-stuff.js"

import {getNewUniqueIdentifier} from "../astToBytecode.js"


// a declaration is of the form {name:string, type:type}









// the AST has lots of references to symbols
// each symbol stores the type, and maybe some other stuff
export function pointVariablesToSymbols(ast){
	
	// first we do it for parameters
	

	
	// first, turn the parameters to symbols
	// this is handled earlier now
// 	doForEachStatement(ast, (statement) => {
// 		
// 		if( statement.type == "functionDefinition"){
// 			statement.paramSymbols = []
// 			for( let i = 0; i < statement.params.length; i++){
// 				// statement.paramSymbols[i] = {name:statement.params[i], type:null}
// 			}
// 		}
// 	})
	
	// now, turn the vardecs to symbols
	// this is handled when the declarations are declared
// 	doForEachStatement(ast, (statement) => {
// 		
// 		if( statement.type == "declaration"){
// 			statement.symbol = {name:statement.name, type:null}
// 		}
// 	})
	
	
	// now, go through all the vars and link them to the appropriate symbol
	//TODO doesnt deal with classes
	doForEachExpression(ast, (expression, nodeIdentifier) => {
		
		if( expression.op == "variable"){
			// it is a variable. Find the parameter symbol or 
			expression.birthplace = getDeclarationForName( expression.contents, nodeIdentifier)
			expression.contents = undefined // we are done with that now
		}
	})
	
	// NOTE by itself, this could get a declaration that occurs after a variable is used, but that should have been verified away by this point
	function getDeclarationForName( name, nodeIdentifier){
		
		// first, see if it is a variable holding an imported function:
		for( let fun of importedFunctionDeclarations){
			// console.log(fun.name, name)
			if( fun.name == name){
				return fun
			}
		}
		
		
		
		// now, check to see if it is a parameter for the scope this is in
		let myFundef = getFunctionThisIsIn( nodeIdentifier, ast)
		if( myFundef != null){
			for( let paramDec of myFundef.paramDeclarations){
				if( paramDec.name == name){
					return paramDec
				}
			}
		}
		
		
		// now, see if it is defined as a variable in this scope, or defined as a class in this scope
		
		let nodeIdentifierOfMyParent = structuredClone(nodeIdentifier)
		nodeIdentifierOfMyParent.pop() // to make it actually live up to its name
		let arrayOfStatementsIAmIn = getStatementsInNode( nodeIdentifierOfMyParent, ast)
		
		
		
		for( let statement of arrayOfStatementsIAmIn){
			if( statement.type == "declaration" && statement.name == name){
				return statement// we found it!
			}
			// if( statement.type == "classDefinition" && statement.name == name){
			// 	return statement// we found it!
			// } this (object constructors) should be desugared into a normal variable at this point
		}
		
		// it was not in this scope. Try the scope one lower, if we can
		if( nodeIdentifier.length == 0){
			throw "err cant find symbol"
		}
		
		let newNodeIdentifier = structuredClone(nodeIdentifier)
		newNodeIdentifier.pop()
		return getDeclarationForName( name, newNodeIdentifier)
	}
	
}


// basically this makes the name of each function be a variable pointer to that function. That way, we do not need to worry about functions as their own thing, they are just a type of variable
export function desugarFunctionsIntoVariables( ast){
	
	
	doForEachStatement(ast, (statement, nodeIdentifier, fnToReplaceNode) => {
		
		if( statement.type == "functionDefinition"){
			// it is a function definition. We need to do the thing for it
			// replace the node with its variable declaration and then the original node itself
			let declarationStatement = {type:"declarationAssignment", lVal:statement.name, rVal: {op:"createPointerToFunction", functionNode:statement}}
			fnToReplaceNode( nodeIdentifier, [declarationStatement, statement])
			
			
		}
	})
	
}









