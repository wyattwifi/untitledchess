

import {InternalCompilerError, doForEachStatementArray, doForEachStatement, getScopeFromScopeIdentifier, compilerWarn, doForEachExpression, doForThisScopeArrayAndAllScopeArraysUnderIt, getFunctionThisIsIn, getStatementsInNode, getNodeFromNodeIdentifier} from "../compiler-utils.js"
import {importedFunctionDeclarations} from "../type-stuff.js"

import {getNewUniqueIdentifier} from "../astToBytecode.js"





// at first, the methods and properties might be mixed together, and also they are not in quite the format we want. They are currently like a wrapper saying what it is and if it is stacic and its visibility and then just the parse for as if it were a normal function or declaration
// this groups them together into an array of properties and an array of methods
export function putMethodsAndPropertiesInProperPlace(ast){
	
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
						paramDeclarations:member.contents.paramDeclarations,
						statements:member.contents.statements,
						returnType:null,
					})
				}
				
			}
			statement.contents = undefined // now that we are done with it, clear it
		}
	})
}





// this desugars all static properties and methods into normal fuctions and global variables
//TODO this does not account for renaming where they are used, that should be done too
//NOTE this does not touch the object constructors
export function desugarStaticMembers(ast) { // TODO make them only be visible in the correct scope
	let newGlobalStatements = []
	
	doForEachStatement(ast, (statement) => {
		if (statement.type != "classDefinition") {
			return
		}
		
		// Static properties become global variables.
		for (let property of statement.properties) {
			if (!property.isStatic) {
				continue
			}
			
			let globalName = "_static_property_" + property.name +"_of_" + statement.name //WARNING this can fail if the things have confusing names
			
			property.generatedGlobalName = globalName
			
			if (property.defaultValue != null) {
				newGlobalStatements.push({
					type: "declarationAssignment",
					lVal: globalName,
					rVal: property.defaultValue
				})
			} else {
				throw "not supported yet"
				newGlobalStatements.push({
					type: "declaration",
					name: globalName,
					theType: null
				})
			}
		}
		
		// Static methods become ordinary top-level functions.
		for (let method of statement.methods) {
			if (!method.isStatic) {
				continue
			}
			
			let functionName = "_static_method_" + method.name +"_of_" + statement.name //WARNING this can fail if the things have confusing names
			
			method.generatedFunctionName = functionName
			
			let newFunction = {
				type: "functionDefinition",
				name: functionName,
				
				paramDeclarations: method.paramDeclarations,//TODO not current layout
				statements: method.statements,
				returnType: method.returnType,
			}
			
			ast.push(newFunction)
		}
	})
	
	// Put static variable initialization before ordinary top-level code.
	// This ensures the globals are initialized before __main executes.
	ast.unshift(...newGlobalStatements)
}





// the type checker cannot check that 2 classes are the same by looking at the name, because if they were declared in different places but had the same name that would fail
// so, this gives each class definition a unique ID
export function giveClassesIDs(ast) {
	doForEachStatement(ast, (statement) => {
		if (statement.type != "classDefinition") {
			return
		}
		statement.id = Math.random()
	})
}



// this turns all the object constructors into normal functions
export function handleObjectConstructors(ast){
	
	doForEachStatement(ast, (statement, nodeIdentifier, fnToReplaceNode) => {
		
		if(statement.type == "classDefinition"){
			
			let initMethod = statement.methods.find(
				method => method.name == "init"
			)
			
			if(initMethod == null){
				return
			}
			
			let constructorFunction = {
				type:"functionDefinition",
				name:statement.name,
				
				paramDeclarations:initMethod.paramDeclarations,
				statements:initMethod.statements,
				returnType:{mainType:"object", classDeclaration: statement},
				isAConstructor:true,
			}
			
			fnToReplaceNode(nodeIdentifier, [
				statement,
				constructorFunction
			])
		}
	})
	
	
	// now that we have done that, we go through all the newly created constructors and add "let self = createNewObject(class)" to the start of them and add "return self" at the end
	//TODO this should be done differently if there is inheritance
	
	doForEachStatement(ast, (statement, nodeIdentifier, fnToReplaceNode) => {
		
		if(statement.isAConstructor){
			
			let constructorFunction = {
				type:"declarationAssignment",
				lVal:"self",
				rVal:{op:"createNewObject", theClass:statement.returnType.classDeclaration},
			}
			statement.statements.unshift(constructorFunction)
			
			//TODO also deal with if there were return statements already before this
			statement.statements.push({
				type:"returnStatement",
				value:{op:"variable", contents:"self"},
			})
		}
	})
	
	
}





// this takes all the properties and methods and puts them in an array so they can be indexed in memory
// also, probably more importantly, this turns the methonds into properties that hold the function in them// This takes all the properties and methods and puts them in an array
// so they can be indexed in memory.
// It also turns methods into properties that hold function pointers.
export function handleClassMembers(ast){
	
	doForEachStatement(ast, (statement, nodeIdentifier, fnToReplaceNode) => {
		
		if(statement.type != "classDefinition"){
			return
		}
		
		// we do not need to worry about static stuff because they have been desugared out by now
		
		// Turn instance methods into properties containing function pointers.
		let newFunctionNodes = []
		for(let method of statement.methods){
			
			let functionNode = {
				type: "functionDefinition",
				name: "_method_" + method.name + "_of_" + statement.name,
				paramDeclarations: method.paramDeclarations,
				statements: method.statements,
				returnType: method.returnType,
				isMethod: true,
			}
			
			statement.properties.push({
				name: method.name,
				isStatic: false,
				visibility: method.visibility,
				defaultValue: {
					op: "createPointerToFunction",
					functionNode: functionNode,
				},
			})
			
		}
		
		// We do not need these any more
		statement.methods = undefined
		
		fnToReplaceNode(nodeIdentifier, [
			statement,
			...newFunctionNodes
		])
	})
}
