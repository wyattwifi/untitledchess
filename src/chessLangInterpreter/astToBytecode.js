


import {InternalCompilerError} from "./compiler-utils.js"


export {
	astToBytecode,
	getNewUniqueIdentifier
}

// I am doing bytecode instead of just interepreting the AST because I need to do the stack and instruction pointer myself to easily handle duplicating programs


//AST is Abstract Syntax Tree. There are things about it on the internet for making your own coding language


function astToBytecode( ast){
	// this does it for the whole thing
	return ast.map( astToBytecodeForFunction)
	
}

function astToBytecodeForArrayOfStatements( statements){
	
	
	let resultCode = []
	
	for( let i = 0; i < statements.length; i++){
		
		let statement = statements[i]
		
		switch( statement.type){
			
			case "classDefinition":
				//TODO do nothing for now
				break
			case "assignment":{
				// take {type:"assignment", lVal:tokens[0].contents, rVal: expression}
				// ...to {type:"assignFromVariable", lval:stringName, rval:variableName }
				
				let expressionLowered = getBytecodeOfExpression( statement.rVal)
				
				resultCode.push(...expressionLowered.bytecodeInstructions)
				
				
				//TODO this should be done better. The AST should not be so complicated that we need to do this
				let lvalName
				if( statement.lVal.name){
					lvalName = statement.lVal.contents.contents
				} else {
					lvalName = statement.lVal
				}
				
				
				
				resultCode.push({type:"assignFromVariable", lval:lvalName, rval:expressionLowered.resultVariableName })//TODO don't know the format have in right format if not string or whatever
				break
			}
			case "if":{
				
				// the code could change around, so for now we put the destination as a label, instead of a number which is what it will need to end up being
				
				let expressionLowered = getBytecodeOfExpression( statement.condition)
				
				resultCode.push(...expressionLowered.bytecodeInstructions)
				
				let endOfIfStamentLocName = getNewUniqueIdentifier()
				
				resultCode.push({type:"jumpIfZero", condition:expressionLowered.resultVariableName, destination: endOfIfStamentLocName})
				
				resultCode.push( ...astToBytecodeForArrayOfStatements(statement.contents))
				
				
				resultCode.push({type:"label",name:endOfIfStamentLocName}) // this will later get removed
				
				break
			}
			case "while":{
				
				/*
				The result code will be like this:
				startLabel
				evaluateCondition
				jumpIfZero to endLabel
				do While body
				jump to startLabel
				endLabel
				*/
				
				
				// the code could change around, so for now we put the destination as a label, instead of a number which is what it will need to end up being
				let startOfWhileStamentLocName = getNewUniqueIdentifier()
				let endOfWhileStamentLocName = getNewUniqueIdentifier()
				
				resultCode.push({type:"label",name:startOfWhileStamentLocName}) // this will later get removed
				
				let expressionLowered = getBytecodeOfExpression( statement.condition)
				
				resultCode.push(...expressionLowered.bytecodeInstructions)
				
				
				resultCode.push({type:"jumpIfZero", condition:expressionLowered.resultVariableName, destination: endOfWhileStamentLocName})
				
				resultCode.push( ...astToBytecodeForArrayOfStatements(statement.contents))
				
				
				resultCode.push({type:"unconditionalJump", destination: startOfWhileStamentLocName})
				
				resultCode.push({type:"label",name:endOfWhileStamentLocName}) // this will later get removed
				
				break
			}
			case "returnStatement":{
				
				let expressionLowered = getBytecodeOfExpression( statement.value)
				
				resultCode.push(...expressionLowered.bytecodeInstructions)
				
				resultCode.push({type:"return", value:expressionLowered.resultVariableName })
				
				break
			}
			case "standaloneFuncall":{
				
				let expressionLowered = getBytecodeOfExpression( statement.expression)
				
				resultCode.push(...expressionLowered.bytecodeInstructions)
				
				break
			}
			
			default:
				throw new InternalCompilerError("An unknown statement type was given to the astToBytecode stuff. The type is: " + statement.type +"The whole statement was " + JSON.stringify(statement))
		
		}
		
	}
	
	return resultCode
	
	
}


function astToBytecodeForFunction( functionAst ){
	// this does it just for the contents of a function, not the whole thing
	
	let code = astToBytecodeForArrayOfStatements( functionAst.statements)
	
	// now, we need to go through and replace all the string label stuff with the numbers that are needed
	
	let locationTable = []
	for( let i = 0; i < code.length; i++){
		// it does not work so well to just delete the labels, because then if some code should jump to the end it would jump to no statement, causing an error TODO avoid that problem by doing it a different way. For now, just replace the label with a nop instruction
		if( code[i].type == "label"){
			locationTable[code[i].name] = i
			code[i] = {type:"nop" }
		}
	}
	
	// now we have the numbers for each label, now go through and actually replace the strings with the numbers
	for( let i = 0; i < code.length; i++){
		if( code[i].type == "jumpIfZero"){
			code[i].destination = locationTable[code[i].destination]
		}
		if( code[i].type == "jumpIfNotZero"){
			code[i].destination = locationTable[code[i].destination]
		}
		if( code[i].type == "unconditionalJump"){
			code[i].destination = locationTable[code[i].destination]
		}
	}
	// now we have replaced all the destination strings with integers, like it sohuld be
	
	return {
		name:functionAst.name,
		paramNames:functionAst.params,
		statements: code,
		accessibleScopes:functionAst.availableScopes//TODO have these be the same name
	}
}





//For now I am just trying to get it to work, not get it to work efficiently

// return value: { bytecodeInstructions: array of statements after which the variable named in resultVariableName will have the value you are looking for, resultVariableName: stringName,}
function getBytecodeOfExpression( expressionAst){
	// takes an expression ast and returns both a sequence of bytecode instructions and the name of the variable that will have the value of that expression after those bytecode instructions are run
	
	// the expression structure was just redone. Now  all expressions are objects containing {op:"stringOfOperationName", otherProperties...}
	
	switch (expressionAst.op) {
		case "variable":
			return {bytecodeInstructions:[],resultVariableName:expressionAst.contents}
		case "functionCall":{
			
			let resultVariableName = getNewUniqueIdentifier()
			
			let resultBytecode = []
			
			
			let paramExpressionsLowered = expressionAst.args.map( getBytecodeOfExpression)
			
			for( let i= 0; i < paramExpressionsLowered.length; i++){
				resultBytecode.push(...paramExpressionsLowered[i].bytecodeInstructions)
			}
			
			let stuffToGetFunctionName = getBytecodeOfExpression( expressionAst.theFunction)
			/*
			// it is needed to store it in another variable because of the functioncall setup for now. It assumes that the function name will be stored in a variable
			let resultVariableName = getNewUniqueIdentifier()
			return {bytecodeInstructions:[
				{type:"assignFromVariable", lval:resultVariableName, rval:expressionAst.contents }
			],resultVariableName:resultVariableName}*/
			
			
			
			let varHoldingFunctionName = stuffToGetFunctionName.resultVariableName
			let codeToSetUpFunctionName = stuffToGetFunctionName.bytecodeInstructions
			
			resultBytecode.push( ...codeToSetUpFunctionName)
			
			
			resultBytecode.push({type:"assignFromFunctionCall", lval:resultVariableName, varHoldingFunctionName:varHoldingFunctionName, parameters:paramExpressionsLowered.map(i=>i.resultVariableName)})
			
			// copied here for reference from bytecode instruction list:
			// {type:"assignFromArrayAcces", lval:stringName, varHoldingArrayName:string,index:variableName}
			// {type:"assignFromFunctionCall", lval:stringName, varHoldingFunctionName:string,parameters:[variableNames]}
			// {type:"assignFromLiteralString", lval:varName, rval:string}
			
			
			return {
				bytecodeInstructions: resultBytecode,
				resultVariableName: resultVariableName,
			}
		}
		case "arrayAccess":{
			
			let resultVariableName = getNewUniqueIdentifier()
			
			let resultBytecode = []
			
			
			let indexExpressionLowered = getBytecodeOfExpression(expressionAst.index)
			
			resultBytecode.push(...indexExpressionLowered.bytecodeInstructions)
			
			
			let stuffToGetArrayName = getBytecodeOfExpression( expressionAst.array)
			resultBytecode.push( ...stuffToGetArrayName.bytecodeInstructions)
			
			
			//TODO account for the elements being different sizes
			// let elementSize = 1
			
			
			// we have the pointer to the array now. Now, we just add the offset to get to the element that we want
			// we store the address in a new var so we do not modify the original array position var
			let addressVarName = getNewUniqueIdentifier()
			resultBytecode.push({type:"assignFromVariable", lval:{op:"variable", contents:addressVarName}, rval:stuffToGetArrayName.resultVariableName })
			
			resultBytecode.push({type:"assignMath", lval:addressVarName, lOperand:addressVarName, operation:"+", rOperand:indexExpressionLowered.resultVariableName})
			
			resultBytecode.push({type:"assignFromHeap", lvalLocalVarName:resultVariableName, localVarHoldingAddress:addressVarName})
			
			
			
			return {
				bytecodeInstructions: resultBytecode,
				resultVariableName: resultVariableName,
			}
		}
		case "number":{
			let name = getNewUniqueIdentifier()
			return {
				bytecodeInstructions: [{type:"assignFromLiteral", lval:name, rval:expressionAst.contents}],
				resultVariableName: name,
			}
		}
		case "UNARYMINUS":{
			//{type:"assignMath", lval:stringName, lOperand:variableName, operation:stringSymbol, rOperand:variableName}
			
			let resultName = getNewUniqueIdentifier()
			let operand_setup = getBytecodeOfExpression( expressionAst.operand)
			
			let resultCode = []
			resultCode.push( ...operand_setup.bytecodeInstructions)
			
			let zero_variable_name = getNewUniqueIdentifier()
			resultCode.push( {type:"assignFromLiteral", lval:zero_variable_name, rval:0})
			
			resultCode.push({type:"assignMath", lval:resultName, lOperand:zero_variable_name, operation:"-", rOperand:operand_setup.resultVariableName})
			
			return {bytecodeInstructions:resultCode, resultVariableName:resultName}
			
		}
		
		case "NOT":{
			//WARNING currently this just returns x == 0 when given x
			
			let resultName = getNewUniqueIdentifier()
			let operand_setup = getBytecodeOfExpression( expressionAst.operand)
			
			let resultCode = []
			resultCode.push( ...operand_setup.bytecodeInstructions)
			
			let zeroVariableName = getNewUniqueIdentifier()
			resultCode.push( {type:"assignFromLiteral", lval:zeroVariableName, rval:0})
			
			resultCode.push({type:"assignMath", lval:resultName, lOperand:zeroVariableName, operation:"TESTEQUAL", rOperand:operand_setup.resultVariableName})
			
			return {bytecodeInstructions:resultCode, resultVariableName:resultName}
		}
		case "stringLiteral":{
			let name = getNewUniqueIdentifier()
			return {
				bytecodeInstructions: [{type:"assignFromLiteralString", lval:name, rval:expressionAst.contents}],
				resultVariableName: name,
			}
			
		}
		case "memberAccess":
			// member access
			return {bytecodeInstructions:[],resultVariableName:expressionAst.object}// I know this isnt right TODO
			throw "TODO"
			
		case "createPointerToFunction":
			let name = getNewUniqueIdentifier()
			return {
				bytecodeInstructions: [{type:"assignFromLiteralString", lval:name, rval:expressionAst.functionNode.name}],
				resultVariableName: name,
			}
		case "PLUS":
		case "MINUS":
		case "ASTERISK":
		case "SLASH":
		case "TESTEQUAL":
		case "TESTGREATERTHAN":
		case "TESTLESSTHAN":
		case "TESTGREATERTHANOREQUALTO":
		case "TESTLESSTHANOREQUALTO":
		case "OR":
		case "AND":
			return get_result_for_binary_op( expressionAst)
			
		case "arrayDeclaration":
			
			let resultName = getNewUniqueIdentifier()
			
			let resultCode = []
			
			resultCode.push({type:"malloc", amount:expressionAst.elements.length * expressionAst.bytesPerElement, placeToStoreAddress:resultName})
			
			let localVarHoldingAddress = getNewUniqueIdentifier() // this will start out at the location we got from the heap. Then, we will increase it as we go along to set all the elements
			resultCode.push({type:"assignFromVariable", lval:{op:"variable", contents:localVarHoldingAddress}, rval:resultName })
			
			
			let localVarHoldingElementSize = getNewUniqueIdentifier()
			resultCode.push({type:"assignFromLiteral", lval:localVarHoldingElementSize, rval:expressionAst.bytesPerElement})
			
			for( let i = 0; i < expressionAst.elements.length; i++){
				let element = expressionAst.elements[i]
				
				let stuffToGetElement = getBytecodeOfExpression(element)
				
				// first, we assign it
				resultCode.push(...stuffToGetElement.bytecodeInstructions)
				resultCode.push({type:"assignToHeap", localVarHoldingAddress:localVarHoldingAddress, localVarHoldingValue:stuffToGetElement.resultVariableName})
				
				// then, we increase the pointer to where to put the next thing
				resultCode.push({type:"assignMath", lval:localVarHoldingAddress, lOperand:localVarHoldingAddress, operation:"+", rOperand:localVarHoldingElementSize})
			}
			return {bytecodeInstructions:resultCode,resultVariableName:resultName}
			
		default:
			console.log(expressionAst)
			throw new InternalCompilerError("An unknown expression operation was given to the astToBytecode stuff")
	}
	
	function get_result_for_binary_op( expressionAst){
		
		let symbolMap = {
			OR: "OR",
			AND: "AND",
			TESTEQUAL: "TESTEQUAL",
			TESTGREATERTHAN: "TESTGREATERTHAN",
			TESTLESSTHAN: "TESTLESSTHAN",
			TESTGREATERTHANOREQUALTO: "TESTGREATERTHANOREQUALTO",
			TESTLESSTHANOREQUALTO: "TESTLESSTHANOREQUALTO",
			PLUS:"+",
			MINUS:"-",
			ASTERISK: "ASTERISK",
			SLASH: "SLASH",
			
			//TODO do the rest
		}
		
		let bytecodeOperationSymbol = symbolMap[expressionAst.op]
		
		
		let resultName = getNewUniqueIdentifier()
		let left_operand_setup = getBytecodeOfExpression( expressionAst.left)
		let right_operand_setup = getBytecodeOfExpression( expressionAst.right)
		
		let resultCode = []
		resultCode.push( ...left_operand_setup.bytecodeInstructions)
		resultCode.push( ...right_operand_setup.bytecodeInstructions)
		
		resultCode.push({type:"assignMath", lval:resultName, lOperand:left_operand_setup.resultVariableName, operation:bytecodeOperationSymbol, rOperand:right_operand_setup.resultVariableName})
		
		return {bytecodeInstructions:resultCode, resultVariableName:resultName}
	}
	
	
}



// often, the compiler will need to have a new variable that the user did not add themselves. This gives a new, unique, name for that variable for the compiler to use
let counter = 0
function getNewUniqueIdentifier(){//WARNING this will fail if the user has a variable or something with a name starting with __abc
	return "__abc" + (counter++)
}



function clone(a){
	return JSON.parse(JSON.stringify(a))
}



//For now, an array of functions is the same as an array of strings with those function names
// and a 2d array is the same as an array of strings where each string is the name of an array









