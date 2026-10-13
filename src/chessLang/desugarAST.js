




import {InternalCompilerError} from "./parseChessLang.js"

import {getNewUniqueIdentifier} from "./astToBytecode.js"


export function desugarAST( ast){
	// currently all this does is replace FOR loops with WHILE loops
	return desugarForLoops(ast)
}









function desugarForLoops( ast){
	
	for( let functionDeclaration of ast){
		desugarForLoopsOfStatementArray( functionDeclaration.statements)
		
		// that takes care of all the for loops at the lowest level of the function body and other layers too
	}
	//TODO also needs to do parts not on the lowest level
	return ast
}

function desugarForLoopsOfStatementArray( arrayOfStatements){
	
	for( let i = 0; i < arrayOfStatements.length; i++){
		if( arrayOfStatements[i].type == "for"){
			
			let oldStatement = arrayOfStatements[i]
			
			// we turn for i in iterable -> let i = 0; while( i < length(iterable)){ loopVariableName = iterable[i] ...; i++}, but the variable is named something other than "i"
			
			let counterVariableName = getNewUniqueIdentifier() // the equivalent of "i"
			let loopVariableName = oldStatement.loopVariableName // the equivalent of "thing" in "for thing of things"
			let arrayOfIterableVariableName = getNewUniqueIdentifier() // the equivalent of "things" in "for thing of things"
			
			// first, switch it to a while loop
			
			
			let newCondition = {
				op:"TESTLESSTHAN",
				left:{op:"variable",contents:counterVariableName},
				right:{op:"functionCall", theFunction:{op:"variable", contents:"length"}, args:[oldStatement.iterable]}
			}
			
			
			let newStatements = oldStatement.contents // the new thing has already been pushed to it
			
			newStatements.push({ // add to the end of the statements a statement incrementing the counterVariableName
				type: "assignment",
				lVal: counterVariableName,
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
				type: "assignment",
				lVal: "temporaryPlaceholder",
				rVal: oldStatement.iterable
			})
			newStatements.unshift({ // add to the first of the array
				type: "assignment",
				lVal: loopVariableName,
				rVal: {
					op: "arrayAccess",
					array: {op:"variable",contents:arrayOfIterableVariableName},
					index: {op:"variable",contents:counterVariableName},
				}
			})
			
			
			// actually put in the new statement
			arrayOfStatements[i] = {type:"while", condition: newCondition, contents:newStatements}
			
			
			
			// now, we need to put in the statement creating the array from the iterable thing, since the iterable thing could be a fncall with side effects
			let declarationStatement = {type:"assignment", lVal:arrayOfIterableVariableName, rVal: oldStatement.iterable}//TODO should be declalaniosAssignment
			arrayOfStatements.splice( i, 0, declarationStatement)
			i++ // to account for the new element
			
			
			// now, all that is left is to put in the variable declaration thing
			let declarationStatement2 = {type:"assignment", lVal:counterVariableName, rVal: {op:"number",contents:0}}//TODO should be declalaniosAssignment
			arrayOfStatements.splice( i, 0, declarationStatement2)
			i++ // to account for the new element
			
		}
		// now, we need to take care of non-lowest-level statements too
		if( arrayOfStatements[i].type == "if"){
			desugarForLoopsOfStatementArray( arrayOfStatements[i].contents)
		}
		if( arrayOfStatements[i].type == "for"){
			desugarForLoopsOfStatementArray( arrayOfStatements[i].contents)
		}
		if( arrayOfStatements[i].type == "while"){
			desugarForLoopsOfStatementArray( arrayOfStatements[i].contents)
		}
	}
	
}
