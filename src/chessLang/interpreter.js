

import {InternalCompilerError} from "./parseChessLang.js"
import {getStartingState} from "./getStartingState.js"



class ChessLangStandardLibraryError extends Error{
	constructor(message){
		super("ChessLangStandardLibraryError:" + message)
	}
}


let BUILT_IN_API = [
	{
		name:"print",
		argTypes:["string"],
		effect:function(a){
			console.log(a)
		}
	},
	{
		name:"length",
		effect:function(a){
			return a.length
		}
	},
	{
		name:"range",
		effect:function(a){
			let result = []
			for( let i = 0; i < a; i++){
				result.push(i)
			}
			return result
		}
	},
	// {
	// 	name:"getState",
	// 	effect:function(){
	// 		let result = []
	// 		for( let i = 0; i < 100; i++){
	// 			result.push({x:11,y:10})
	// 		}
	// 		return result
	// 	}
	// },
	{
		name:"uiUpdateState",
		effect:function(){
			console.log(globalStateVariable)
		}
	},
	{
		name:"getUserChoice",
		effect:function( userID, numOfOptions){
			if( numOfOptions <= 0){
				throw new ChessLangStandardLibraryError("That isn't much of a choice, is it?")
			}
			let result = Number(prompt("Player " + userID +": Make a choice 0 (inclusive) to " + numOfOptions + "(exclusive):"))
			while( !(result >= 0 && result < numOfOptions) ){
				result = Number(prompt("Try again to follow the instructions. Player " + userID +": Make a choice 0 (inclusive) to " + numOfOptions + "(exclusive):"))
			}
			return result
		}
	},
]


// supported bytecode operations for now
// assign( lval variable, rval variable, array access (based on a variable), function call( variable parameters), or literal value, maybe anything im forgetting too)
//{type:"assignFromVariable", lval:stringName, rval:variableName }
//{type:"assignFromArrayAcces", lval:stringName, nameOfVarHoldingArray:string,index:variableName}
//{type:"assignFromFunctionCall", lval:stringName, varHoldingFunctionName:string,parameters:[variableNames]}
//{type:"assignFromLiteral", lval:stringName, rval:integer}
//{type:"assignFromLiteralString", lval:varName, rval:string}
// {type:"assignMath", lval:stringName, lOperand:variableName, operation:stringSymbol, rOperand:variableName}
// {type:"jumpIfNotZero",condition:variableNameString,destination:integer} jumpIf(variable, destination)// jump if it is not 0, only jumps within functions
// {type:"jumpIfZero",condition:variableNameString,destination:integer} jumpIf(variable, destination)// jump if it is  0, only jumps within functions
// {type:"unconditionalJump", destination:integer}
// {type:"nop"} - No OPeration

//WIP
//TODO i forgot i need to support setting arrays too, not just reading from them


let globalStateVariable = getStartingState()


export function interpretChessLang( bytecode){
	// the parameter is an array of objects of the format {name, [paramNames],statements:[bytecode instructions]}
	
	
	
	let stack = []
	
	function jumpToFunction( functionName, parameterValues){
		
		
		let localVariables = [] // indexed by strings of the name
		
		let a = getBytecodeWrapperOfFunction( functionName)
		
		if( parameterValues.length != a.paramNames.length){ // check to see that it has the expected number of parameters
			throw new Error("passed wrong number of parameters to a function")
		}
		
		// add the parameters to the local variables
		for( let i = 0; i < a.paramNames.length; i++){
			localVariables[a.paramNames[i]] = parameterValues[i]
		}
		
		localVariables["state"] = globalStateVariable // there is not a built-in way to handle global variables, so we just set it here
		
		stack.push({
			functionName:functionName,
			 instructionPointer: 0,
			 localVariables: localVariables,
		})
	}
	
	jumpToFunction("main", []) // start running the program at "main"
	
	
	while(true){//TODO do this better. For now, it just throws an error when the end of the program is reached
		
		let thisFrame = stack[stack.length - 1] // the top function call in the stack
		let instruction = getBytecodeWrapperOfFunction( thisFrame.functionName).statements[ thisFrame.instructionPointer] // look at the top frame in the stack to see the name of the function we are supposed to be in. Then, use that to get the bytecode stuff for that function, including the list of instructions. Then, look at the frame to see which instruction we are on, and get that from the bytecode
		
		
		switch (instruction.type){
			case "assignFromVariable":{
				let localVars = thisFrame.localVariables
				localVars[instruction.lval] = localVars[instruction.rval]
				thisFrame.instructionPointer++
				break}
			case "assignFromArrayAcces":{
				let localVars = thisFrame.localVariables
				let indexVariableName = instruction.index
				let indexValue = localVars[indexVariableName]
				let theArrayItself = localVars[instruction.nameOfVarHoldingArray]
				localVars[instruction.lval] = theArrayItself[indexValue]
				thisFrame.instructionPointer++
				break}
				break
			case "assignFromLiteral":{
				let localVars = thisFrame.localVariables
				localVars[instruction.lval] = instruction.rval
				thisFrame.instructionPointer++
				break}
			case "nop":{
				thisFrame.instructionPointer++
				break}
			case "assignFromLiteralString":{
				let localVars = thisFrame.localVariables
				localVars[instruction.lval] = instruction.rval
				thisFrame.instructionPointer++
				break}
			case "assignFromFunctionCall":{
				let localVars = thisFrame.localVariables
				
				let isDoneAlready = false
				
				//WARNING as a temporary fix, this will call the variable itself or the value it holds, whichever is available
				
				
				// first, we need to check if it is one of the built-in API functions
				for( let i = 0; i < BUILT_IN_API.length; i++){
					if(BUILT_IN_API[i].name == localVars[instruction.varHoldingFunctionName]){
						localVars[instruction.lval] = BUILT_IN_API[i].effect(...instruction.parameters.map(i=>localVars[i]))
						thisFrame.instructionPointer++ // we need to do this now because there is not all that interesting instruction pointer stack stuff as with a normal function call. instead it is just like a normal statement
						isDoneAlready = true
					}
				}
				for( let i = 0; i < BUILT_IN_API.length; i++){
					if(BUILT_IN_API[i].name == instruction.varHoldingFunctionName){
						localVars[instruction.lval] = BUILT_IN_API[i].effect(...instruction.parameters.map(i=>localVars[i]))
						thisFrame.instructionPointer++ // we need to do this now because there is not all that interesting instruction pointer stack stuff as with a normal function call. instead it is just like a normal statement
						isDoneAlready = true
					}
				}
				
				if( isDoneAlready){
					break
				}
				
				// now we know that it is not a built in api function
				
				if( localVars[instruction.varHoldingFunctionName]){
					
					jumpToFunction(localVars[instruction.varHoldingFunctionName], instruction.parameters.map(i=>localVars[i]))// jumpToFunction expects the literal values of the parameters, while the bytecode instruction gives the variable names
				} else {
					jumpToFunction(instruction.varHoldingFunctionName, instruction.parameters.map(i=>localVars[i]))
				}
				
				// setting the variable to the return value will be handled when the function returns
				// incrementing the instructionPointer will be handled when the function returns
				break}
			case "assignMath":{
				let localVars = thisFrame.localVariables
				switch( instruction.operation){
					case "+":
						localVars[instruction.lval] = localVars[instruction.lOperand] + localVars[instruction.rOperand]
						break
					case "-":
						localVars[instruction.lval] = localVars[instruction.lOperand] - localVars[instruction.rOperand]
						break
					case "TESTLESSTHAN":
						localVars[instruction.lval] = localVars[instruction.lOperand] < localVars[instruction.rOperand]
						break
					default:
						throw new Error("invalid opcode math operation: " + instruction.operation)
					
				}
				
				thisFrame.instructionPointer++
				break}
			case "jumpIfNotZero":{
				// we jump to the location in the current function if the variable is not 0
				// it simply sets the instructionPointer
				// note that we should not increment the instructionPointer in this case
				// instruction format: {type:"jumpIf",condition:nameString,destination:integer}
				if( thisFrame.localVariables[instruction.condition]){
					thisFrame.instructionPointer = instruction.destination
				} else {
					// if we did not jump then we still need to increment the instruction pointer
					thisFrame.instructionPointer++
				}
				break}
			case "unconditionalJump":{
				// it simply sets the instructionPointer
				// note that we should not increment the instructionPointer in this case
				thisFrame.instructionPointer = instruction.destination
				
				break}
			case "jumpIfZero":{
				// we jump to the location in the current function if the variable is not 0
				// it simply sets the instructionPointer
				// note that we should not increment the instructionPointer in this case
				// instruction format: {type:"jumpIf",condition:nameString,destination:integer}
				if( !thisFrame.localVariables[instruction.condition]){
					thisFrame.instructionPointer = instruction.destination
				} else {
					// if we did not jump then we still need to increment the instruction pointer
					thisFrame.instructionPointer++
				}
				break}
			default:
				throw new InternalCompilerError("invalid opcode instruction: " + JSON.stringify(instruction))
		}
		
		
		// if this returns "finished running program", the whole thing should exit
		//check to see if we got to the end of the function (and return if needed)
		function returnIfReachedEnd(){
			
			let thisFrame = stack[stack.length - 1] // the top function call in the stack NOTE we need to get this fresh each time we check if a return is needed because we might have just returned from a function and be in a different frame then before
			
			let functionBytecode = getBytecodeWrapperOfFunction( thisFrame.functionName)
			
			if( functionBytecode.statements.length == thisFrame.instructionPointer){ // if we just went off the end of the list of statements
				// we should return from the function
				// that also includes storing the function return value in the proper variable and incrementing the instructionPointer
				// note that incrementing instructionPointer when we return may lead us to return from another function, so we need to account for that
				
				// first, check if there is even another function to return to. If not, we are done
				if( stack.length == 1){
					return "finished running program" //this tells the calling function that the program is done running
				}
				
				// for now, just have the return value be whatever value is stored in the variable named "r"
				//WARNING if "r" is not defined it will run into trouble maybe
				let returnValue = thisFrame.localVariables["r"]
				
				stack.pop()
				
				// now, finish off the instruction that we return to
				
				let newFrame = stack[stack.length - 1]
				
				let localVars = newFrame.localVariables
				let instructionWeReturnTo = getBytecodeWrapperOfFunction( newFrame.functionName).statements[ newFrame.instructionPointer]
				
				
				localVars[instructionWeReturnTo.lval] = returnValue
				
				newFrame.instructionPointer++
				
				if( returnIfReachedEnd() == "finished running program"){ // we need to call this again since we just incremented the instructionPointer again
					return "finished running program" // propogate up the result
				}
			}
		}
		
		if( returnIfReachedEnd() == "finished running program"){
			return
		}
		
		
		
	}
	
	function getBytecodeWrapperOfFunction( functionName){
		for( let i = 0; i < bytecode.length; i++){
			if( bytecode[i].name == functionName){
				return bytecode[i]
			}
		}
		console.log( stack, bytecode)
		throw new Error("error function " + functionName + " does not exist")
	}
	
	
}


