


/*
import {InternalCompilerError, doForEachStatement, doForEachExpression, getFunctionThisIsIn} from "./compiler-utils.js"





export function checkTypes(ast){
	// doForEachExpression
}



function areTypesEqual(a,b){
	if( a.mainType != b.mainType){ return false}
	
	if( a.mainType == "array" && b.mainType == "array"){ return areTypesEqual( a.elementType, b.elementType)}
	
	if( a.mainType == "function" && b.mainType == "function"){
		// it is a function type
		if( a.paramTypes.length != b.paramTypes.length){ // if they have different numbers of parameters, the cant be the same thing
			return false
		}
		
		for( let i = 0; i < a.paramTypes.length; i++){
			if( !areTypesEqual( a.paramTypes[i], b.paramTypes[i])){
				return false
			}
		}
		
		return areTypesEqual( a.returnType, b.returnType)
		
	}
	
	return true
}


function assertExpressionIsOfType( expression, type, ast){
	
	
	
	switch( expression.op){
		
		case "variable":
			
			return
		case "functionCall":{
			
			
			// we can look at the params given and know that the params of the type are the same
			
			let theFunctionType = getTypeOfExpression(expression.theFunction, ast)
			
			if( theFunctionType == null){ // we don't  know anything about it yet. We can at least know that it is a pointer to a function
				setTypeOfExpression(expression.theFunction, ast, {mainType:"function", paramTypes:Array(50).fill(null), returnType:null}) // 50 should be enough
			}
			
			// we can look at all the arg types to infer the param types
			for( let i = 0; i < expression.args.length; i++){
				let theType = getTypeOfExpression( expression.args[i], ast)
				if( theType != null){
					// we can set the type of the param
					getTypeOfExpression( expression.theFunction, ast).paramTypes[i] = theType
				}
			}
			
			
			
			// now, we can go the other way and find out about the args from the params
			let theType = getTypeOfExpression(expression.theFunction, ast)
			for( let i = 0; i < theType.paramTypes.length; i++){
				if( theType.paramTypes[i] != null){
					
					setTypeOfExpression( expression.args[i], ast, theType.paramTypes[i])
				}
			}
			
			break
		}
		case "arrayAccess":
			// we know that the index must be an int
			if( getTypeOfExpression(expression.index, ast) == null){
				setTypeOfExpression(expression.index, ast, new Type("int"))
			}
			return
		case "arrayDeclaration":
			
			
			// we know that all the elements need to be the same type
			let theType = null
			for( let i = 0; i < expression.elements.length; i++){
				let element = expression.elements[i]
				if(getTypeOfExpression( element, ast)){
					theType = getTypeOfExpression( element, ast)
					break
				}
			}
			
			if( theType == null){
				// we do not know the type of any elements in the array
				return
			}
			
			// now, we know the type of the array, so set every element to that if we do not already know its type
			for( let element of expression.elements){
				if(getTypeOfExpression( element, ast) == null){
					setTypeOfExpression( element, ast, theType)
				}
			}
			break
		case "UNARYMINUS":
		case "NOT":
		case "number":
		case "stringLiteral":
		case "createPointerToFunction":
			return
		case "AND":
			function inferForExpression( expression, scopeIdentifier, ast){
				// this can do some stuff, because for example if you compare 2 things with each other they should be the same type as each other
				
				scopeIdentifier = clone(scopeIdentifier)
				
				
				switch( expression.op){
					
					case "variable":
						return
					case "functionCall":{
						
						
						// we can look at the params given and know that the params of the type are the same
						
						let theFunctionType = getTypeOfExpression(expression.theFunction, ast)
						
						if( theFunctionType == null){ // we don't  know anything about it yet. We can at least know that it is a pointer to a function
							setTypeOfExpression(expression.theFunction, ast, {mainType:"function", paramTypes:Array(50).fill(null), returnType:null}) // 50 should be enough
						}
						
						// we can look at all the arg types to infer the param types
						for( let i = 0; i < expression.args.length; i++){
							let theType = getTypeOfExpression( expression.args[i], ast)
							if( theType != null){
								// we can set the type of the param
								getTypeOfExpression( expression.theFunction, ast).paramTypes[i] = theType
							}
						}
						
						
						
						// now, we can go the other way and find out about the args from the params
						let theType = getTypeOfExpression(expression.theFunction, ast)
						for( let i = 0; i < theType.paramTypes.length; i++){
							if( theType.paramTypes[i] != null){
								
								setTypeOfExpression( expression.args[i], ast, theType.paramTypes[i])
							}
						}
						
						break
					}
					case "arrayAccess":
						// we know that the index must be an int
						if( getTypeOfExpression(expression.index, ast) == null){
							setTypeOfExpression(expression.index, ast, new Type("int"))
						}
						return
					case "arrayDeclaration":
						
						
						// we know that all the elements need to be the same type
						let theType = null
						for( let i = 0; i < expression.elements.length; i++){
							let element = expression.elements[i]
							if(getTypeOfExpression( element, ast)){
								theType = getTypeOfExpression( element, ast)
								break
							}
						}
						
						if( theType == null){
							// we do not know the type of any elements in the array
							return
						}
						
						// now, we know the type of the array, so set every element to that if we do not already know its type
						for( let element of expression.elements){
							if(getTypeOfExpression( element, ast) == null){
								setTypeOfExpression( element, ast, theType)
							}
						}
						break
					case "UNARYMINUS":
					case "NOT":
					case "number":
					case "stringLiteral":
					case "createPointerToFunction":
						return
					case "AND":
					case "OR":
					case "PLUS":
					case "MINUS":
					case "ASTERISK":
					case "SLASH":
					case "TESTEQUAL":
					case "TESTGREATERTHAN":
					case "TESTLESSTHAN":
					case "TESTGREATERTHANOREQUALTO":
					case "TESTLESSTHANOREQUALTO":
						//TODO implement
						return
					default:
						throw new InternalCompilerError("Expression OP not supported. Here is the expression: " + JSON.stringify(expression))
				}
				
				
			}
		case "OR":
		case "PLUS":
		case "MINUS":
		case "ASTERISK":
		case "SLASH":
		case "TESTEQUAL":
		case "TESTGREATERTHAN":
		case "TESTLESSTHAN":
		case "TESTGREATERTHANOREQUALTO":
		case "TESTLESSTHANOREQUALTO":
			//TODO implement
			return
		default:
			throw new InternalCompilerError("Expression OP not supported. Here is the expression: " + JSON.stringify(expression))
	}
	
	
}









*/




































































import {
	InternalCompilerError,
	doForEachStatement,
	doForEachExpression,
	getFunctionThisIsIn
} from "./compiler-utils.js"


class Type{
	constructor(a){
		this.mainType = a
	}
}


export function checkTypes(ast){
	
	// First, check every expression individually.
	doForEachExpression(ast, (expression, scopeIdentifier) => {
		checkExpression(expression, ast)
	})
	
	
	// Now check statements that impose additional type requirements.
	doForEachStatement(ast, (statement, nodeIdentifier) => {
		
		switch(statement.type){
			
			case "assignment":
			case "declarationAssignment":{
				
				assertExpressionsHaveSameType(
					statement.lVal,
					statement.rVal,
					ast
				)
				
				break
			}
			
			case "returnStatement":{
				
				let myFundec = getFunctionThisIsIn(nodeIdentifier, ast)
				
				if(myFundec == null){
					throw new Error("Return statement outside of a function")
				}
				
				if(myFundec.returnType == null){
					throw new Error("Could not determine the return type of function " + myFundec.name)
				}
				
				assertExpressionIsOfType(
					statement.value,
					myFundec.returnType,
					ast
				)
				
				break
			}
			
			case "if":
			case "while":
				
				assertExpressionIsOfType(
					statement.condition,
					new Type("bool"),
										 ast
				)
				
				break
				
			case "declaration":
			case "standaloneFuncall":
			case "functionDefinition":
			case "classDefinition":
			case "for":
				break
				
			default:
				throw new InternalCompilerError(
					"Type checker does not support this statement: " +
					JSON.stringify(statement)
				)
		}
		
	})
	
}


// Returns whether two types are equivalent.
function areTypesEqual(a,b){
	
	if(a == null || b == null){
		return a === b
	}
	
	if(a.mainType != b.mainType){
		return false
	}
	
	
	if(a.mainType == "array"){
		return areTypesEqual(a.elementType,b.elementType)
	}
	
	
	if(a.mainType == "function"){
		
		if(a.paramTypes.length != b.paramTypes.length){
			return false
		}
		
		for(let i = 0; i < a.paramTypes.length; i++){
			
			if(!areTypesEqual(a.paramTypes[i],b.paramTypes[i])){
				return false
			}
		}
		
		return areTypesEqual(a.returnType,b.returnType)
	}
	
	
	return true
}


// Throws an error if two types are different.
function assertTypesAreEqual(typeOne,typeTwo){
	
	if(!areTypesEqual(typeOne,typeTwo)){
		
		throw new Error(
			"Types are not the same: " +
			JSON.stringify(typeOne) +
			" and " +
			JSON.stringify(typeTwo)
		)
	}
	
}


// Gets the type of an expression.
// This is the read-only equivalent of the function in your type inference code.
function getTypeOfExpression(expression,ast){
	
	if(expression == null){
		return null
	}
	
	switch(expression.op){
		
		case "variable":
			return expression.symbol.type
			
			
		case "functionCall":{
			
			let functionType = getTypeOfExpression(expression.theFunction,ast)
			
			if(functionType == null){
				return null
			}
			
			if(functionType.mainType != "function"){
				throw new Error("Tried calling something that isn't a function")
			}
			
			return functionType.returnType
		}
		
		
		case "arrayAccess":{
			
			let arrayType = getTypeOfExpression(expression.array,ast)
			
			if(arrayType == null){
				return null
			}
			
			if(arrayType.mainType != "array"){
				throw new Error("Tried accessing an element of something that isn't an array")
			}
			
			return arrayType.elementType
		}
		
		
		case "arrayDeclaration":{
			
			for(let element of expression.elements){
				
				let elementType = getTypeOfExpression(element,ast)
				
				if(elementType != null){
					return {
						mainType:"array",
						elementType:elementType
					}
				}
			}
			
			return null
		}
		
		
		case "parengroup":
			return getTypeOfExpression(expression.contents,ast)
			
			
		case "UNARYMINUS":
			return new Type("int")
			
			
		case "NOT":
			return new Type("bool")
			
			
		case "number":
			return new Type("int")
			
			
		case "stringLiteral":
			return new Type("string")
			
			
		case "PLUS":
		case "MINUS":
		case "ASTERISK":
		case "SLASH":
			return new Type("int")
			
			
		case "TESTEQUAL":
		case "TESTGREATERTHAN":
		case "TESTLESSTHAN":
		case "TESTGREATERTHANOREQUALTO":
		case "TESTLESSTHANOREQUALTO":
		case "AND":
		case "OR":
			return new Type("bool")
			
			
		case "memberAccess":
			return new Type("int") // TODO replace with actual member type
			
			
		case "createPointerToFunction":{
			
			let func = expression.functionNode
			
			return {
				mainType:"function",
				paramTypes:func.paramTypes,
				returnType:func.returnType
			}
		}
		
		
		default:
			throw new InternalCompilerError(
				"Expression OP not supported: " +
				JSON.stringify(expression)
			)
	}
	
}


// Asserts that an expression has a particular type.
function assertExpressionIsOfType(expression,type,ast){
	
	let actualType = getTypeOfExpression(expression,ast)
	
	if(actualType == null){
		
		throw new Error(
			"Could not determine the type of expression: " +
			JSON.stringify(expression)
		)
	}
	
	assertTypesAreEqual(actualType,type)
	
	
}


// Asserts that two expressions have the same type.
function assertExpressionsHaveSameType(expressionA,expressionB,ast){
	
	let typeA = getTypeOfExpression(expressionA,ast)
	let typeB = getTypeOfExpression(expressionB,ast)
	
	if(typeA == null || typeB == null){
		
		throw new Error(
			"Could not determine the types of both expressions: " +
			JSON.stringify(expressionA) + " and " +
			JSON.stringify(expressionB)
		)
	}
	
	assertTypesAreEqual(typeA,typeB)
	
}


// Checks the rules associated with an individual expression.
function checkExpression(expression,ast){
	
	switch(expression.op){
		
		case "variable":
			
			if(expression.symbol.type == null){
				throw new Error(
					"Could not infer the type of variable " +
					expression.contents
				)
			}
			
			return
			
			
		case "number":
		case "stringLiteral":
			return
			
			
		case "parengroup":
			
			return
			
			
		case "UNARYMINUS":
			
			assertExpressionIsOfType(
				expression.operand,
				new Type("int"),
									 ast
			)
			
			return
			
			
		case "NOT":
			
			assertExpressionIsOfType(
				expression.operand,
				new Type("bool"),
									 ast
			)
			
			return
			
			
		case "AND":
		case "OR":{
			
			assertExpressionIsOfType(
				expression.left,
				new Type("bool"),
									 ast
			)
			
			assertExpressionIsOfType(
				expression.right,
				new Type("bool"),
									 ast
			)
			
			return
		}
		
		
		case "PLUS":
		case "MINUS":
		case "ASTERISK":
		case "SLASH":{
			
			assertExpressionIsOfType(
				expression.left,
				new Type("int"),
									 ast
			)
			
			assertExpressionIsOfType(
				expression.right,
				new Type("int"),
									 ast
			)
			
			return
		}
		
		
		case "TESTEQUAL":{
			
			assertExpressionsHaveSameType(
				expression.left,
				expression.right,
				ast
			)
			
			return
		}
		
		
		case "TESTGREATERTHAN":
		case "TESTLESSTHAN":
		case "TESTGREATERTHANOREQUALTO":
		case "TESTLESSTHANOREQUALTO":{
			
			assertExpressionIsOfType(
				expression.left,
				new Type("int"),
									 ast
			)
			
			assertExpressionIsOfType(
				expression.right,
				new Type("int"),
									 ast
			)
			
			return
		}
		
		
		case "arrayAccess":{
			
			assertExpressionIsOfType(
				expression.index,
				new Type("int"),
									 ast
			)
			
			let arrayType = getTypeOfExpression(expression.array,ast)
			
			if(arrayType == null){
				throw new Error("Could not determine the type of the array")
			}
			
			if(arrayType.mainType != "array"){
				throw new Error("Tried accessing an element of something that isn't an array")
			}
			
			return
		}
		
		
		case "arrayDeclaration":{
			
			let firstType = null
			
			for(let element of expression.elements){
				
				let elementType = getTypeOfExpression(element,ast)
				
				if(elementType == null){
					throw new Error(
						"Could not determine the type of an array element"
					)
				}
				
				if(firstType == null){
					firstType = elementType
				} else {
					assertTypesAreEqual(firstType,elementType)
				}
			}
			
			return
		}
		
		
		case "functionCall":{
			
			let functionType = getTypeOfExpression(expression.theFunction,ast)
			
			if(functionType == null){
				throw new Error("Could not determine the type of the function being called")
			}
			
			if(functionType.mainType != "function"){
				throw new Error("Tried calling something that isn't a function")
			}
			
			let params = functionType.paramTypes
			let args = expression.args
			
			// The inference code uses 50 null parameters as a placeholder
			// when it encounters a function whose type is initially unknown.
			let isPlaceholder = params.length == 50
			
			if(isPlaceholder){
				
				let lastKnownParam = -1
				
				for(let i = 0; i < params.length; i++){
					if(params[i] != null){
						lastKnownParam = i
					}
				}
				
				if(lastKnownParam >= args.length){
					throw new Error("Too few arguments supplied to function")
				}
				
			} else if(params.length != args.length){
				
				throw new Error(
					"Incorrect number of arguments. Expected " +
					params.length + ", got " + args.length
				)
			}
			
			
			for(let i = 0; i < args.length; i++){
				
				if(params[i] != null){
					
					assertExpressionIsOfType(
						args[i],
						params[i],
						ast
					)
					
				} else {
					
					throw new Error(
						"Could not infer the type of parameter " + i +
						" of the called function"
					)
					
				}
			}
			
			return
		}
		
		
		case "createPointerToFunction":
			return
			
			
		case "memberAccess":
			return
			
			
		default:
			throw new InternalCompilerError(
				"Expression OP not supported by type checker: " +
				JSON.stringify(expression)
			)
			
	}
	
}


