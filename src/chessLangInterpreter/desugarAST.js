




import {InternalCompilerError, doForEachStatementArray, doForEachStatement, getScopeFromScopeIdentifier, compilerWarn, doForEachExpression, doForThisScopeArrayAndAllScopeArraysUnderIt, getFunctionThisIsIn, getStatementsInNode, getNodeFromNodeIdentifier} from "./compiler-utils.js"
import {importedFunctionDeclarations} from "./type-stuff.js"

import {getNewUniqueIdentifier} from "./astToBytecode.js"


// a declaration is of the form {name:string, type:type}


export function desugarAST( ast){
	desugarFunctionsIntoVariables(ast)
	putMethodsAndPropertiesInProperPlace(ast)
	desugarForLoops(ast) // we need to do this before desugaring declarationAssignments because this adds new declarationAssignments
	desugarDeclarationAssignments(ast)
	pointVariablesToSymbols(ast)
	return ast
}


function desugarDeclarationAssignments( ast){
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









function desugarForLoops( ast){
	
	
	
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


export function rearrangeFunctions(ast){
	markAccessableScopesForFunctions(ast)
	bringAllFunctionsToLowestLevel(ast)
	moveTopLevelCodeIntoFunction(ast)
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




// at first, the methods and properties might be mixed together, and also they are not in quite the format we want. They are currently like a wrapper saying what it is and if it is stacic and its visibility and then just the parse for as if it were a normal function or declaration
// this groups them together into an array of properties and an array of methods
function putMethodsAndPropertiesInProperPlace(ast){
	
	doForEachStatement(ast, (statement) => {
		
		let wasThereAMethodYet = false // we want to issue a warning if there is a property declared after a method
		
		if(statement.type == "classDefinition"){
			statement.properties = []
			statement.methods = []
		
			for( let member of statement.contents){
				if(member.type == "property"){
					if( wasThereAMethodYet){
						compilerWarn("There was a property declared after a method")
					}
					
					statement.properties.push({
						name:member.contents.lVal,
						isStatic:member.isStatic,
						visibility:member.visibility,
						defaultValue:member.contents.rVal,
					})
				} else if(member.type == "method"){
					wasThereAMethodYet = true
					
					statement.methods.push({
						name:member.contents.name,
						isStatic:member.isStatic,
						visibility:member.visibility,
						params:member.contents.params,
						paramTypes:member.contents.paramTypes,
						statements:member.contents.statements,
						returnType:null,
					})
				}
				
			}
			statement.contents = undefined // now that we are done with it, clear it
		}
	})
}


// the AST has lots of references to symbols
// each symbol stores the type, and maybe some other stuff
function pointVariablesToSymbols(ast){
	
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
		
		
		// now, see if it is defined as a variable in this scope
		let nodeIdentifierOfMyParent = structuredClone(nodeIdentifier)
		nodeIdentifierOfMyParent.pop() // to make it actually live up to its name
		let arrayOfStatementsIAmIn = getStatementsInNode( nodeIdentifierOfMyParent, ast)
		
		
		
		for( let statement of arrayOfStatementsIAmIn){
			if( statement.type == "declaration" && statement.name == name){
				return statement// we found it!
			}
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
function desugarFunctionsIntoVariables( ast){
	
	
	doForEachStatement(ast, (statement, nodeIdentifier, fnToReplaceNode) => {
		
		if( statement.type == "functionDefinition"){
			// it is a function definition. We need to do the thing for it
			// replace the node with its variable declaration and then the original node itself
			let declarationStatement = {type:"declarationAssignment", lVal:statement.name, rVal: {op:"createPointerToFunction", functionNode:statement}}
			fnToReplaceNode( nodeIdentifier, [declarationStatement, statement])
			
			
		}
	})
	
}

















