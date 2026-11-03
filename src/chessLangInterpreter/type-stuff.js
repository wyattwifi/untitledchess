




import {InternalCompilerError} from "./compiler-utils.js"




class Type{
	constructor(a){
		this.mainType = a
	}
}
// if mainType == "array", then elementType should be set


let importedFunctionDeclarations = [
	{
		name:"print",
		paramTypes:[new Type("int")],
		returnType: new Type("exe"),
	},
	{
		name:"range",
		paramTypes:[new Type("int")],
		returnType: {mainType:"array", elementType: new Type("int")},
	},
	{
		name:"getUserChoice",
		paramTypes:[new Type("playerID"), new Type("string"), {mainType:"array", elementType: new Type("string")}],
		returnType: new Type("int"),
	},
	{
		name:"simulateAllChoicesInFunction",
		paramTypes:[new Type("TODO")],
		returnType: new Type("TODO"),
	},
	{
		name:"uiHint",
		paramTypes:[new Type("string")],
		returnType: new Type("exe"),
	},
	{
		name:"uiUpdateState",
		paramTypes:[],
		returnType: new Type("exe"),
	},
	{
		name:"assignArray",
		paramTypes:[new Type("TODO")],
		returnType: new Type("exe"),
	},
	{
		name:"createEmptyArray",
		paramTypes:[],
		returnType: {mainType:"array", elementType: new Type("TODO")},
	},
	{
		name:"endGame",
		paramTypes:[new Type("string")],
		returnType: new Type("exe"),
	},
	{
		name:"setState",
		paramTypes:[new Type("TODO")],
		returnType: new Type("exe"),
	},
	{
		name:"createArray",
		paramTypes:[new Type("TODO")],
		returnType: {mainType:"array", elementType: new Type("TODO")},
	},
	{
		name:"throwError",
		paramTypes:[new Type("string")],
		returnType: new Type("exe"),
	},
	{
		name:"createLoc",
		paramTypes:[ new Type("int"), new Type("int")],
		returnType: new Type("TODO"),
	},
	{
		name:"mod",
		paramTypes:[ new Type("int"), new Type("int")],
		returnType: new Type("int"),
	},
	{
		name:"length",
		paramTypes:[{mainType:"array", elementType: new Type("int")}], //TODO support other than just ints
		returnType: new Type("exe"),
	},
]




// a scope identifier is an array of indexes of the statements for how you get to a scope, except starting with the function name
// for example, if a

// the type information for a variable is stored in the variable declaration


// we have a thing that we do to try to infer types. We will repeat it over and over until it stops infering any new types. This is because knowing one type can let us know another type

let numOfTypesInferred = 0 // we keep track of this. If we do a pass of infering and it does not increase, then we know that we have either finished or cannot complete it

function doPassOfInferingTypes( ast){
	
	
	
	doForEachStatementArray(ast, ( arrayOfStatements, scopeIdentifier) => {
		
		
		for( let i = 0; i < arrayOfStatements.length; i++){
			let statement = arrayOfStatements[i]
			switch( arrayOfStatements[i].type){
				case "assignment":
					// the lval and the rval must have the same type
					// if we know one but not both we can infer the other one
					
					if(getTypeOfExpression( statement.rVal, scopeIdentifier, ast) != null && getTypeOfExpression( statement.lVal, scopeIdentifier, ast) == null){
						setTypeOfExpression( statement.lVal, scopeIdentifier, ast, getTypeOfExpression( statement.rVal, scopeIdentifier, ast))
					}
					
					if(getTypeOfExpression( statement.lVal, scopeIdentifier, ast) != null && getTypeOfExpression( statement.rVal, scopeIdentifier, ast) == null){
						setTypeOfExpression( statement.rVal, scopeIdentifier, ast, getTypeOfExpression( statement.lVal, scopeIdentifier, ast))
					}
					
					inferForExpression( statement.lVal, scopeIdentifier, ast)
					inferForExpression( statement.rVal, scopeIdentifier, ast)
					
					break
				case "returnStatement":
					// we know that the value of this expression and the function return type must be the same
					
					let functionName = scopeIdentifier[0] // this is the function we are in
					
					let thisValueType = getTypeOfExpression(statement.value, scopeIdentifier, ast)
					
					if( thisValueType != null){
						setFunctionReturnType( functionName, thisValueType, ast)
					}
					if( getFunctionReturnType(functionName, ast) != null && thisValueType == null){
						setTypeOfExpression(statement.value, scopeIdentifier, ast, getFunctionReturnType(functionName, ast))
					}
					
					
					inferForExpression( statement.value, scopeIdentifier, ast)
					break
					
				case "declaration":
					break
				case "standaloneFuncall":
					inferForExpression( statement.expression, scopeIdentifier, ast)
					break
					
				case "for":{
					
					inferForExpression( statement.iterable, scopeIdentifier, ast)
					break}
					
				case "if":
				case "while":{
					
					inferForExpression( statement.condition, scopeIdentifier, ast)
					break}
				default:
					throw "still need to account for " + JSON.stringify(arrayOfStatements[i])
			}
		}
		
	})
	
	
	
	
}


function areTypesEqual(a,b){
	if( a.mainType != b.mainType){ return false}
	
	if( a.mainType == "array" && b.mainType == "array"){ return areTypesEqual( a.elementType, b.elementType)}
	
	return true
}



function inferForExpression( expression, scopeIdentifier, ast){
	// this can do some stuff, because for example if you compare 2 things with each other they should be the same type as each other
	
	scopeIdentifier = clone(scopeIdentifier)
	
	
	switch( expression.op){
		
		case "variable":
			return
		case "functionCall":
			
			
			//TODO not yet supporting functions stored in stuff
			if( expression.theFunction.op != "variable"){
				return
			}
			
			// we look through the ast to find the function with that name, then return the returnType of it
			//TODO this does not work with pointers to functions yet
			let theFundec
			for( let fundec of ast){
				if( fundec.name == expression.theFunction.contents){
					theFundec = fundec
				}
			}
			
			// now, we need to check for imported functions
			for( let fundec of importedFunctionDeclarations){
				if( fundec.name == expression.theFunction.contents){
					theFundec = fundec
				}
			}
			
			if( theFundec == undefined){
				
				throw new InternalCompilerError("Tried to get type of function that does not exist")
			}
			
			// now, we go through and make sure that the parameter types and arg types are the same, or infer as needed
			for( let i = 0; i < theFundec.paramTypes.length; i++){
				
				let paramType = theFundec.paramTypes[i]
				let argType = getTypeOfExpression( expression.args[i], scopeIdentifier, ast)
				
				if( paramType === null && argType !== null){
					theFundec.paramTypes[i] = argType
				}
				if( argType === null && paramType !== null){
					setTypeOfExpression( expression.args[i], scopeIdentifier, ast, paramType)
				}
				
				
			}
			
			
		case "arrayAccess":
			//TODO implement
			return
		case "arrayDeclaration":
			
			// first, infer for each element of the array
			for( let element of expression.elements){
				inferForExpression( element, scopeIdentifier, ast)
			}
			
			
			// we know that all the elements need to be the same type
			let theType = null
			for( let i = 0; i < expression.elements.length; i++){
				let element = expression.elements[i]
				if(getTypeOfExpression( element, scopeIdentifier, ast)){
					theType = getTypeOfExpression( element, scopeIdentifier, ast)
					break
				}
			}
			
			if( theType == null){
				// we do not know the type of any elements in the array
				return
			}
			
			// now, we know the type of the array, so set every element to that if we do not already know its type
			for( let element of expression.elements){
				if(getTypeOfExpression( element, scopeIdentifier, ast) == null){
					setTypeOfExpression( element, scopeIdentifier, ast, theType)
				}
			}
			break
		case "UNARYMINUS":
		case "NOT":
		case "number":
		case "stringLiteral":
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





export function inferTypes(ast){
	let typesInferredByLastPass = -1 // make it be -1 so that it will run a first time
	while( numOfTypesInferred > typesInferredByLastPass){
		typesInferredByLastPass = numOfTypesInferred
		doPassOfInferingTypes( ast)
	}
}




function setFunctionReturnType( functionName, theType, ast){
	
	for( let fundec of ast){
		if( fundec.name == functionName){
			// we are in the right function
			// if it has a type already, we know that we have either found the same type (do nothing in that case) or found a different type (throw an error in that case)
			if( fundec.returnType != null){
				if( areTypesEqual( fundec.returnType, theType)){
					return
				} else {
					console.log( theType, fundec.returnType)
					throw "err, inferred as one type then inferred as another type"
				}
			}
			
			numOfTypesInferred++
			fundec.returnType = theType
			
			return
		}
	}
	
	// to be extra careful, we know that it was not a main thing. It must be an imported function or an error
	
	for( let fundec of importedFunctionDeclarations){
		if( fundec.name == functionName){
			// we found the function. Imported functions have the type set already, we just need to make sure that it is the same type
			// if it has a type already, we know that we have either found the same type (do nothing in that case) or found a different type (throw an error in that case)
			if( !areTypesEqual( fundec.returnType, theType)){
				console.log( theType, fundec.returnType)
				throw "err, inferred as one type then inferred as another type"
			
			}
			return
		}
	}
	
	// we didnt find the function anywhere
	throw new InternalCompilerError("function not defined: " + functionName)
}





function getFunctionReturnType( functionName, ast){
	
	for( let fundec of ast){
		if( fundec.name == functionName){
			return fundec.returnType
		}
	}
	for( let fundec of importedFunctionDeclarations){
		if( fundec.name == functionName){
			return fundec.returnType
		}
	}
	
	
	// we didnt find the function anywhere
	throw new InternalCompilerError("function not defined: " + functionName)
}






function clone(a){
	return JSON.parse(JSON.stringify(a))
}

function getTypeOfVariable( varName, scopeIdentifier, ast){
	
	scopeIdentifier = clone(scopeIdentifier)
	
	// first, we need to see if it is actually a function parameter
	let myFundef = null
	
	for( let fundef of ast){
		if(fundef.name == scopeIdentifier[0]){
			myFundef = fundef
			break
		}
	}
	
	for( let i = 0; i < myFundef.params.length; i++){
		if( myFundef.params[i] == varName){
			return myFundef.paramTypes[i]
		}
	}
	
	
	let decStatement = getVariableDeclarationStatement( varName, scopeIdentifier, ast)
	
	return decStatement.variableType
}

function getVariableDeclarationStatement( varName, scopeIdentifier, ast){
	
	
	// if it is the state variable, ignore it for now TODO do this better
	if( varName == "state"){return {variableType:null}}
	
	
	let startingScopeIdentifier = clone(scopeIdentifier)
	
	scopeIdentifier = clone(scopeIdentifier)
	
	let functionName = scopeIdentifier.shift() // the name of the function that the variable is found in
	
	for( let fundec of ast){
		if( fundec.name == functionName){
			// we are in the right function
			// now, we go through the statements untill we get to the correct scope
			let scope = fundec.statements
			while( scopeIdentifier.length){
				scope = scope[scopeIdentifier.shift()].contents
			}
			
			// now we are in the correct scope, or a scope above it. Look through this scope and if it is not in here try again with a scope one lower
			// we just step through all the statements and see if there is one that is the declaration for the variable with that name
			for( let statement of scope){
				if( statement.type == "declaration" && statement.name == varName){
					return statement
				}
			}
			
			
			// we didnt find it. it must be in a lower scope, or something went wrong
			// we can just recursively try the scope one lower
			if( startingScopeIdentifier.length > 1){
				startingScopeIdentifier.pop()
				return getVariableDeclarationStatement( varName, startingScopeIdentifier, ast)
			}
			
			// there is not a lower scope to go to.
			throw new InternalCompilerError("Tried to get the type of a variable but cannot find that variable")
			
		}
	}
	
	
}


function setTypeOfVariable( varName, scopeIdentifier, ast, theType){
	
	// console.log( varName, scopeIdentifier, ast, theType)
	
	scopeIdentifier = clone(scopeIdentifier)
	
	
	
	// first, we need to see if it is actually a function parameter
	let myFundef = null
	
	for( let fundef of ast){
		if(fundef.name == scopeIdentifier[0]){
			myFundef = fundef
			break
		}
	}
	
	for( let i = 0; i < myFundef.params.length; i++){
		if( myFundef.params[i] == varName){
			// it is actually a parameter
			if( myFundef.paramTypes[i] != null){
				if( areTypesEqual( myFundef.paramTypes[i], theType)){
					return
				} else {
					console.log( theType, myFundef.paramTypes[i])
					throw "err, inferred as one type then inferred as another type"
				}
			}
			
			myFundef.paramTypes[i] = theType
			numOfTypesInferred++
			return 
		}
	}
	
	
	
	let statement = getVariableDeclarationStatement( varName, scopeIdentifier, ast)
	
	
	// if it has a type already, we know that we have either found the same type (do nothing in that case) or found a different type (throw an error in that case)
	if( statement.variableType != null){
		if( areTypesEqual( statement.variableType, theType)){
			return
		} else {
			console.log( theType, statement.variableType)
			throw "err, inferred as one type then inferred as another type"
		}
	}
	
	numOfTypesInferred++
	statement.variableType = theType
}



function getTypeOfExpression( expression, scopeIdentifier, ast){
	
	
	scopeIdentifier = clone(scopeIdentifier)
	
	switch( expression.op){
		
		case "variable":
			return getTypeOfVariable(expression.contents, scopeIdentifier, ast)
		case "functionCall":
			
			//TODO not yet supporting functions stored in stuff
			if( expression.theFunction.op != "variable"){
				return
			}
			
			
			// we look through the ast to find the function with that name, then return the returnType of it
			//TODO this does not work with pointers to functions yet
			for( let fundec of ast){
				if( fundec.name == expression.theFunction.contents){
					return fundec.returnType
				}
			}
			
			// now, we need to check for imported functions
			for( let fundec of importedFunctionDeclarations){
				if( fundec.name == expression.theFunction.contents){
					return fundec.returnType
				}
			}
			
			console.log(expression)
			throw new InternalCompilerError("Tried to get type of function that does not exist")
			
		case "arrayAccess":
			
			let arrayType = getTypeOfExpression( expression.array, scopeIdentifier, ast)
			if( arrayType == null){ return null}
			return arrayType.elementType
		case "arrayDeclaration":
			
			
			// we know that all the elements need to be the same type
			let theType = null
			for( let i = 0; i < expression.elements.length; i++){
				let element = expression.elements[i]
				if(getTypeOfExpression( element, scopeIdentifier, ast)){
					theType = getTypeOfExpression( element, scopeIdentifier, ast)
					break
				}
			}
			
			if( theType == null){
				// we do not know the type of any elements in the array
				return null
			}
			return {mainType:"array", elementType: theType}
			
			
			
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
			//TODO add support for overwritting operators and string concatenation
			return new Type("int")
		case "TESTEQUAL":
		case "TESTGREATERTHAN":
		case "TESTLESSTHAN":
		case "TESTGREATERTHANOREQUALTO":
		case "TESTLESSTHANOREQUALTO":
			return new Type("bool")
		case "memberAccess":
			return new Type("int")//TODO not just have a placeholder
		default:
			throw new InternalCompilerError("Expression OP not supported. Here is the expression: " + JSON.stringify(expression))
	}
	
	
}



function assertTypesAreEqual( typeOne, typeTwo){
	
	if( !areTypesEqual( typeOne, typeTwo)){
		throw new Error("types are not the same")
	}
}





function setTypeOfExpression( expression, scopeIdentifier, ast, theType){
	
	
	scopeIdentifier = clone(scopeIdentifier)
	
	switch( expression.op){
		
		case "variable":
			setTypeOfVariable( expression.contents, scopeIdentifier, ast, theType)
			return
		case "functionCall":
			// we now know the return type of the function
			setFunctionReturnType( expression.theFunction.contents, theType, ast)
			return
		case "arrayAccess":
			// we now know the type of the elements of it
			
			// first, set the main type
			setTypeOfExpression( expression.array, scopeIdentifier, ast, theType)
			
			// now, set the type of the index to int, which it always is
			setTypeOfExpression( expression.index, scopeIdentifier, ast, new Type("int"))
			
			break
		case "arrayDeclaration":
			
			for( let element of expression.elements){
				if(getTypeOfExpression( element, scopeIdentifier, ast) == null){
					setTypeOfExpression( element, scopeIdentifier, ast, theType.elementType)
				}
			}
			
			
			break
			
		case "UNARYMINUS":
		case "NOT":
		case "number":
		case "stringLiteral":
		case "PLUS":
		case "MINUS":
		case "ASTERISK":
		case "SLASH":
			//TODO add support for overwritting operators and string concatenation
		case "TESTEQUAL":
		case "TESTGREATERTHAN":
		case "TESTLESSTHAN":
		case "TESTGREATERTHANOREQUALTO":
		case "TESTLESSTHANOREQUALTO":
			return // these types are intuitive
			//throw "errE this shouldnt be reached"
		default:
			throw new InternalCompilerError("Expression OP not supported. Here is the expression: " + JSON.stringify(expression))
	}
	
	
}









