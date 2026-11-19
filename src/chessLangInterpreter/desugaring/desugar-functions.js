




import {InternalCompilerError, doForEachStatementArray, doForEachStatement, getScopeFromScopeIdentifier, compilerWarn, doForEachExpression, doForThisScopeArrayAndAllScopeArraysUnderIt, getFunctionThisIsIn, getStatementsInNode, getNodeFromNodeIdentifier} from "../compiler-utils.js"
import {importedFunctionDeclarations} from "../type-stuff.js"

import {getNewUniqueIdentifier} from "../astToBytecode.js"







export function rearrangeFunctions(ast){
	markAccessableScopesForFunctions(ast)
	bringAllFunctionsToLowestLevel(ast)
	moveTopLevelCodeIntoFunction(ast)
}










function markAccessableScopesForFunctions(ast){
	// nested functions can use the scope of the function(s) they are nested in. However, currently we rearrange the AST so that by the end the functions are all on the lowest level, so you cannot tell what scopes they used to have access to. This marks which scopes they can access so we can know after they are rearranged
	//WARNING I dont know if this works with vars declared in if or for statements
	
	//TODO the order of availableScopes is all messed up for now
	// for each node, if it is a function definition give it an availableScopes property that lists all the functions it is nested in, plus/including __main
	doForEachStatement(ast, (statement, nodeIdentifier) => {
		
		nodeIdentifier = structuredClone(nodeIdentifier)
		
		if(statement.type == "functionDefinition"){
			
			statement.availableScopes = ["__main"] // all the other functions are nested in that function. It is not yet collected into a fundef, that will happen later
			
			// now, we just go back up the node identifier and see which ones are a function that this can reach
			while( nodeIdentifier.length){
				let thatStatement = getNodeFromNodeIdentifier( ast, structuredClone(nodeIdentifier))
				if( thatStatement.type == "functionDefinition"){
					statement.availableScopes.push(thatStatement.name)
				}
				nodeIdentifier.pop()
			}
		}
	})
	//NOTE in the end format availableScopes has the broadest scopes at the start and the most limited ones at the end
}



function bringAllFunctionsToLowestLevel(ast){
	
	let functions = []
	
	doForEachStatementArray(ast, (arrayOfStatements) => {
		
		for(let i = 0; i < arrayOfStatements.length; i++){
			
			if(arrayOfStatements[i].type == "functionDefinition"){
				
				functions.push(arrayOfStatements[i])
				arrayOfStatements.splice(i, 1)
				i--
				
			}
			
		}
		
	})
	
	ast.push(...functions)
	
	return ast
}



function moveTopLevelCodeIntoFunction(ast){
	
	let newFunction = {
		type:"functionDefinition",
		name:"__main",
		paramDeclarations: [],
		statements:[],
		returnType:null,
		availableScopes:[],//it isn't even nested in itself
	}
	
	for(let i = 0; i < ast.length; i++){
		
		if(ast[i].type != "functionDefinition"){
			newFunction.statements.push(ast[i])
			ast.splice(i, 1)
			i--
		}
		
	}
	
	ast.push(newFunction)
	
	return ast
}



