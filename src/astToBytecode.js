


import {InternalCompilerError} from "./parseChessLang.js"


// I am doing bytecode instead of just interepreting the AST because I need to do the stack and instruction pointer myself to easily handle duplicating programs


//AST is Abstract Syntax Tree. There are things about it on the internet for making your own coding language

/*
These 2 classes could potentially come in handy later, but they are not needed here
class Frame{
	constructor(){
		this.functionName = ""
		this.instructionPointer = 0
		this.localVariables = [] // use key
	}
}

class Thread{
	constructor(){
		this.stack = []// array of Frame objects
	}
}*/


export function astToBytecode( ast){
	// this does it for the whole thing
	return ast.map( astToBytecodeForFunction)
	
}

function astToBytecodeForArrayOfStatements( statements){
	
	
	let resultCode = []
	
	for( let i = 0; i < statements.length; i++){
		
		let statement = statements[i]
		
		switch( statement.type){
			
			
			case "assignment":{
				// take {type:"assignment", lVal:tokens[0].contents, rVal: expression}
				// ...to {type:"assignFromVariable", lval:stringName, rval:variableName }
				
				let expressionLowered = getBytecodeOfExpression( statement.rVal)
				
				resultCode.push(...expressionLowered.bytecodeInstructions)
				
				resultCode.push({type:"assignFromVariable", lval:new String(statement.lVal), rval:expressionLowered.resultVariableName })//TODO don't know the format have in right format if not string or whatever
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
			case "returnStatement":{
				
				let expressionLowered = getBytecodeOfExpression( statement.value)
				
				resultCode.push(...expressionLowered.bytecodeInstructions)
				
				resultCode.push({type:"assignFromVariable", lval:"r", rval:expressionLowered.resultVariableName })
				//TODO this does not actually exit the function, it just sets the return value for now
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
	}
	// now we have replaced all the destination strings with integers, like it sohuld be
	
	return {
		name:functionAst.name,
		paramNames:functionAst.params,
		statements: code,
	}
}





//For now I am just trying to get it to work, not get it to work efficiently

// return value: { bytecodeInstructions: array of statements after which the variable named in resultVariableName will have the value you are looking for, resultVariableName: stringName,}
function getBytecodeOfExpression( expressionAst){
	// takes an expression ast and returns both a sequence of bytecode instructions and the name of the variable that will have the value of that expression after those bytecode instructions are run
	
	
	
	switch( expressionAst.type){
		case "addition/subtraction":
			
			let terms = expressionAst.terms
			
			
			if( terms.length > 1){
				
				//  we take off the last term and process it
				
				
				// basically, we take off the last term. Then we (recursively) get the code for both the last term and all the other terms. Then, we just stitch the code of the two together
				
				let allButLastTermAst = clone(expressionAst)
				allButLastTermAst.terms = allButLastTermAst.terms.slice(0, allButLastTermAst.terms.length - 1) // take off the last one
				
				
				let lastTerm = terms[terms.length - 1]
				
				
				let allButLastLowered = getBytecodeOfExpression( allButLastTermAst)
				
				let lastTermLowered = getBytecodeOfExpression( lastTerm.contents)
				
				let resultName = getNewUniqueIdentifier()
				
				let result = {
					bytecodeInstructions: [ ...allButLastLowered.bytecodeInstructions, ...lastTermLowered.bytecodeInstructions],
					resultVariableName: resultName,
				}
				
				// now we have most of the code in place, we just need a statement tying it all together
				// we put it in an if statement to decide if we need "+" or "-"
				
				
				if( lastTerm.isPositive){
					result.bytecodeInstructions.push({type:"assignMath", lval:resultName, lOperand:allButLastLowered.resultVariableName, operation:"+", rOperand:lastTermLowered.resultVariableName})
				} else {
					result.bytecodeInstructions.push({type:"assignMath", lval:resultName, lOperand:allButLastLowered.resultVariableName, operation:"-", rOperand:lastTermLowered.resultVariableName})
				}
				
				
				return result
				
				
			} else { // there is only one term in the term list
				// either it is positive and we can just return the result of it, or it is negative and we add a step negating it
				if( terms[0].isPositive){
					// it is positive
					return getBytecodeOfExpression( terms[0].contents)
				} else {
					
					let defaultResult = getBytecodeOfExpression( terms[0].contents)
					
					let zeroVariableName = getNewUniqueIdentifier() // this variable will hold the value 0
					
					defaultResult.bytecodeInstructions.push({type:"assignFromLiteral", lval:zeroVariableName, rval:0})
					defaultResult.bytecodeInstructions.push({type:"assignMath", lval:defaultResult.resultVariableName, lOperand:zeroVariableName, operation:"-", rOperand:defaultResult.resultVariableName})
					
					return defaultResult
				}
			}
			
			break
		case "arrayOrFncall":
			
			// copied here for reference from bytecode instruction list:
			// {type:"assignFromArrayAcces", lval:stringName, varHoldingArrayName:string,index:variableName}
			// {type:"assignFromFunctionCall", lval:stringName, varHoldingFunctionName:string,parameters:[variableNames]}
			// {type:"assignFromLiteralString", lval:varName, rval:string}
			
			// we will have a variable that holds the running total. We start out by storing the name of the first thing in it. Then we go down the list of calls, one call at a time, doing the call based on the current value of the running total and then storing the value back into the running total
			
			
			let runningTotalName = getNewUniqueIdentifier() // or, rather, runningResult
			
			let resultBytecode = []
			
			resultBytecode.push({type:"assignFromLiteralString", lval:runningTotalName, rval:expressionAst.firstName})
			
			for( let i = 0; i < expressionAst.callChain.length; i++){
				let call = expressionAst.callChain[i]
				switch (call.type){
					case "arrayLookup":
						let indexExpressionLowered = getBytecodeOfExpression( call.index)
						resultBytecode.push(...indexExpressionLowered.bytecodeInstructions )
						resultBytecode.push({type:"assignFromArrayAcces", lval:runningTotalName, varHoldingArrayName:runningTotalName,index:indexExpressionLowered.resultVariableName})
						break
					case "functionCall":
						let paramExpressionsLowered = call.args.map( getBytecodeOfExpression)
						
						
						resultBytecode.push(...paramExpressionsLowered.flatMap(i=>i.bytecodeInstructions))
						
						resultBytecode.push({type:"assignFromFunctionCall", lval:runningTotalName, varHoldingFunctionName:runningTotalName, parameters:paramExpressionsLowered.map(i=>i.resultVariableName)})
						
						break
					default:
						throw new Error("Internal compiler error, invalid AST a")
				}
			}
			
			return {
				bytecodeInstructions: resultBytecode,
				resultVariableName: runningTotalName,
			}
		case "string":
			throw new Error("not supported yet")
			break
		case "integer":
			let name = getNewUniqueIdentifier()
			return {
				bytecodeInstructions: [{type:"assignFromLiteral", lval:name, rval:expressionAst.contents}],
				resultVariableName: name,
			}
			break
		case "identifier":
			return {
				bytecodeInstructions: [], // the variable already contains its own value, so we don't have to do anything
				resultVariableName: new String(expressionAst.contents),//TODO see if this works, i dont know if it is a string or array or what
			}
			break
		default:
			throw new Error("Internal compiler error: invalid AST")
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









