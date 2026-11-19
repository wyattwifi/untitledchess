


import {InternalCompilerError, doForEachStatementArray, doForEachStatement, getScopeFromScopeIdentifier, compilerWarn, doForEachExpression, doForThisScopeArrayAndAllScopeArraysUnderIt, getFunctionThisIsIn, getStatementsInNode, getNodeFromNodeIdentifier} from "../compiler-utils.js"
import {importedFunctionDeclarations} from "../type-stuff.js"

import {getNewUniqueIdentifier} from "../astToBytecode.js"












export function desugarDeclarationAssignments( ast){
	// at first, the AST only has Assignements and combined DeclarationAssignments.
	// This desugars the DeclarationAssignments into Declarations and Assignments
	
	
	doForEachStatementArray(ast, ( arrayOfStatements) => {
		
		for( let i = 0; i < arrayOfStatements.length; i++){
			
			if( arrayOfStatements[i].type == "declarationAssignment"){
				let oldStatement = arrayOfStatements[i]
				
				// we just need to put the declaration in before it, and then switch the type to "assignment"
				oldStatement.type = "assignment"
				
				// now, put in the declaration just before the assignment
				let declarationStatement = {type:"declaration", name:oldStatement.lVal, theType:null}
				arrayOfStatements.splice( i, 0, declarationStatement)
				i++ // to account for the new element
				
				// however, also the grammar for assignments expects an expression as the lVal, but the declarationAssignment expects a variable name as the lval. Since we are switching it we also need to switch the type
				oldStatement.lVal = {op:"variable", contents:oldStatement.lVal}
				
			}
		}
	})
	
	
	
}






export function desugarForLoops( ast){
	
	
	
	doForEachStatementArray(ast, ( arrayOfStatements) => {
		
		
		for( let i = 0; i < arrayOfStatements.length; i++){
			if( arrayOfStatements[i].type == "for"){
				
				
				/*
				 *	given this code:
				 *	for thing in getThings():
				 *		doSomething(thing)
				 *	
				 *	it should desugar it into something like:
				 *	let i = 0
				 *	let theArray = getThings()
				 *	while i < length(theArray):
				 *		let thing = theArray[i]
				 *		doSomething()
				 *		i = i + 1
				 *	
				 *	
				 *	
				 */
				
				
				let oldStatement = arrayOfStatements[i]
				
				// we turn for i in iterable -> let i = 0; while( i < length(iterable)){ loopVariableName = iterable[i] ...; i++}, but the variable is named something other than "i"
				
				let counterVariableName = getNewUniqueIdentifier() // the equivalent of "i"
				let loopVariableName = oldStatement.loopVariableName // the equivalent of "thing" in "for thing of things"
				let arrayOfIterableVariableName = getNewUniqueIdentifier() // the equivalent of "things" in "for thing of things"
				
				// first, switch it to a while loop
				
				
				let newCondition = {
					op:"TESTLESSTHAN",
					left:{op:"variable",contents:counterVariableName},
					right:{op:"functionCall", theFunction:{op:"variable", contents:"length"}, args:[{op:"variable", contents:arrayOfIterableVariableName}]}
				}
				
				
				let newStatements = oldStatement.contents // this is the array of new contents of the loop
				
				newStatements.push({ // add to the end of the statements a statement incrementing the counterVariableName
					type: "assignment",
					lVal: {op:"variable", contents:counterVariableName}, // the lVal of assignment operations must be an expression
					rVal: {
						op: "PLUS",
						left: {
							op: "variable",
							contents: counterVariableName
						},
						right: {
							op: "number",
							contents: 1
						}
					}
				})
				
				// we cannot yet treat the iterable as a string variable name, because it could be an expression that returns an array instead
				// this uses a temporary fix that needs replaced by a better thing eventually
				
				newStatements.unshift({ // add to the first of the array
					type: "declarationAssignment",
					lVal: loopVariableName, // the lVal of assignment operations must be an expression
					rVal: {
						op: "arrayAccess",
						array: {op:"variable",contents:arrayOfIterableVariableName},
						index: {op:"variable",contents:counterVariableName},
					}
				})
				
				
				// actually put in the new statement
				arrayOfStatements[i] = {type:"while", condition: newCondition, contents:newStatements}
				
				
				
				// now, we need to put in the statement creating the array from the iterable thing, since the iterable thing could be a fncall with side effects
				let declarationStatement = {type:"declarationAssignment", lVal:arrayOfIterableVariableName, rVal: oldStatement.iterable}
				arrayOfStatements.splice( i, 0, declarationStatement)
				i++ // to account for the new element
				
				
				// now, all that is left is to put in the variable declaration thing
				let declarationStatement2 = {type:"declarationAssignment", lVal:counterVariableName, rVal: {op:"number",contents:0}}
				arrayOfStatements.splice( i, 0, declarationStatement2)
				i++ // to account for the new element
				
			}
			
		}
	})
	
	
	
	return ast
}

