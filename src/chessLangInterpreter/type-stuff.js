




import {InternalCompilerError, doForEachStatement, doForEachExpression, getFunctionThisIsIn} from "./compiler-utils.js"




class Type{
	constructor(a){
		this.mainType = a
	}
}
// if mainType == "array", then elementType should be set
/*
Here are the types
mainType:theThing.
	if == "array", then elementType = aType
	if == "function", then returnType = aType and paramTypes = []
*/


export let importedFunctionDeclarations = [ // actually, now changing it to be an array of symbols
	{
		name:"print",
		mainType:"function",
		paramTypes:[new Type("int")],
		returnType: new Type("exe"),
	},
	{
		name:"range",
		mainType:"function",
		paramTypes:[new Type("int")],
		returnType: {mainType:"array", elementType: new Type("int")},
	},
	/*{
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
	},*/
	{
		name:"length",
		paramTypes:[{mainType:"array", elementType: new Type("int")}], //TODO support other than just ints
		returnType: new Type("exe"),
		symbol:{name:"blank", type:{mainType:"function", paramTypes:[{mainType:"array", elementType: new Type("int")}], returnType: new Type("int")}}
	},
]




// a scope identifier is an array of indexes of the statements for how you get to a scope, except starting with the function name
// for example, if a

// the type information for a variable is stored in the variable declaration


// we have a thing that we do to try to infer types. We will repeat it over and over until it stops infering any new types. This is because knowing one type can let us know another type

let numOfTypesInferred = 0 // we keep track of this. If we do a pass of infering and it does not increase, then we know that we have either finished or cannot complete it




function doPassOfInferingTypes( ast){
	
	
	
	doForEachStatement(ast, ( statement, nodeIdentifier) => {
		
		
		switch( statement.type){
			case "assignment":
				// the lval and the rval must have the same type
				// if we know one but not both we can infer the other one
				
				setTypesEqual( statement.lVal, statement.rVal, ast)
				
				break
			case "returnStatement":
				// we know that the value of this expression and the function return type must be the same
				
				let myFundec = getFunctionThisIsIn( nodeIdentifier, ast)
				
				
				let thisValueType = getTypeOfExpression(statement.value, ast)
				
				if( thisValueType != null && myFundec.returnType == null){
					myFundec.returnType = thisValueType
				}
				if( myFundec.returnType != null && thisValueType == null){
					setTypeOfExpression(statement.value, ast, myFundec.returnType)
				}
				break
				
			case "declaration":
			case "standaloneFuncall":
			case "functionDefinition":
			case "classDefinition":
			case "for":
				//TODO the iterable must be an iterable
				break
			case "if":
			case "while":
				if( getTypeOfExpression(statement.condition, ast) == null){
					setTypeOfExpression(statement.condition, ast, new Type("bool"))
				}
				break
			default:
				throw "still need to account for " + JSON.stringify(statement)
		}
	
		
	})
	
	
	
	
	doForEachExpression(ast, ( expression, scopeIdentifier) => {
		
		inferForExpression( expression, scopeIdentifier, ast)
	})
	
}

function setTypesEqual( expressionA, expressionB, ast){
	
	let typeA = getTypeOfExpression(expressionA, ast)
	let typeB = getTypeOfExpression(expressionB, ast)
	
	// if we don't know either type, we cant do it
	if( typeA === null && typeB === null){ return}
	
	// if they are both already set, we are good
	if( typeA !== null && typeB !== null){ return}
	
	// now we know one or the other. Set one to be the other
	if( typeA === null){
		setTypeOfExpression( expressionA, ast, typeB)
	} else if( typeB === null){
		setTypeOfExpression( expressionB, ast, typeA)
	}
}

// function setTypesEqualOfSymbols( symbolA, symbolB, ast){
// 	//TODO
// }

/*
function setTypesEqualOfTypes( typeA, typeB, ast){
	//TODO
}*/

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
				//setTypeOfExpression(expression.theFunction, ast, {mainType:"function", paramTypes:Array(50).fill(null), returnType:null}) // 50 should be enough
				// actually, it would be tidier to get the type of that thing from when we assign a pointerToFunction into it
				return
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





export function inferTypes(ast){
	let typesInferredByLastPass = -1 // make it be -1 so that it will run a first time
	while( numOfTypesInferred > typesInferredByLastPass){
		typesInferredByLastPass = numOfTypesInferred
		doPassOfInferingTypes( ast)
	}
}



function clone(a){
	return JSON.parse(JSON.stringify(a))
}

function getTypeOfExpression( expression, ast){
	
	
	switch( expression.op){
		
		case "variable":
			return expression.symbol.type
		case "functionCall":
			if( getTypeOfExpression( expression.theFunction) == null){ return null}
			return getTypeOfExpression( expression.theFunction).returnType
		case "arrayAccess":
			
			let arrayType = getTypeOfExpression( expression.array, ast)
			if( arrayType == null){ return null}
			if( arrayType.elementType === undefined){ //note, it can still be null
				throw "I thought this was an array access!?!?"
			}
			return arrayType.elementType
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
		case "createPointerToFunction":
			return {
				mainType:"function",
				paramTypes:expression.functionNode.paramTypes,
				returnType:expression.functionNode.returnType
			}
		default:
			throw new InternalCompilerError("Expression OP not supported. Here is the expression: " + JSON.stringify(expression))
	}
	
	
}


function assertTypesAreEqual( typeOne, typeTwo){
	
	if( !areTypesEqual( typeOne, typeTwo)){
		throw new Error("types are not the same")
	}
}





function setTypeOfExpression( expression, ast, theType){
	
	if( getTypeOfExpression( expression, ast) != null){
		return
	}
	
	
	switch( expression.op){
		
		case "variable":
			if( expression.symbol.type == null && theType != null){
				numOfTypesInferred++
			}
			expression.symbol.type = theType
			break
		case "functionCall":
			// we now know the return type of the function
			setFunctionReturnType(expression.theFunction, theType, ast)
			return
		case "arrayAccess":
			// we now know the type of the elements of it
			
			// first, set the main type
			setTypeOfExpression( expression.array, ast, theType)
			
			// now, set the type of the index to int, which it always is
			setTypeOfExpression( expression.index, ast, new Type("int"))
			
			return
		case "arrayDeclaration":
			
			for( let element of expression.elements){
				setTypeOfExpression( element, ast, theType.elementType)
			}
			
			
			return
			
		case "createPointerToFunction":
			
			if( theType.mainType != "function"){
				throw new Error("tried assigning a pointer to a function something other than pointer to function")
			}
			
			expression.functionNode.returnType = theType.returnType
			for( let i = 0; i < expression.functionNode.params.length; i++){
				if( expression.functionNode.paramTypes[i] == null && theType.paramTypes[i] != null){
					numOfTypesInferred++
				}
				expression.functionNode.paramTypes[i] = theType.paramTypes[i]
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



function setFunctionReturnType(functionExpression, returnType, ast) {
	let functionType = getTypeOfExpression(functionExpression, ast)
	
	if(functionType == null) {
		throw new InternalCompilerError("Cannot set return type of an unknown function")
	}
	
	if(functionType.mainType != "function") {
		throw new InternalCompilerError("Tried to set return type of something that isn't a function")
	}
	
	if(functionType.returnType == null) {
		functionType.returnType = returnType
		numOfTypesInferred++
	}
}


function safeStringify(value, indent = 2) {
	try {
		return JSON.stringify(value, null, indent)
	}
	catch(error) {
		if(value === null || typeof value !== "object") {
			return String(value)
		}
		
		if(Array.isArray(value)) {
			return "[" + value.map(element => safeStringify(element, indent)).join(", ") + "]"
		}
		
		let result = {}
		
		for(let key of Object.keys(value)) {
			try {
				result[key] = JSON.parse(JSON.stringify(value[key]))
			}
			catch(error) {
				result[key] = safeStringify(value[key], indent)
			}
		}
		
		return JSON.stringify(result, null, indent)
	}
}
window.safeStringify = safeStringify // debugging


