
// the file names are really messed up for now, this is a start on the actual interpreter





// supported bytecode operations for now
// assign( lval variable, rval variable, array access (based on a variable), function call( variable parameters), or literal value, maybe anything im forgetting too)
//{type:"assignFromVariable", lval:stringName, rval:variableName }
//{type:"assignFromArrayAcces", lval:stringName, arrayName:string,index:variableName}
//{type:"assignFromFunctionCall", lval:stringName, functionName:string,parameters:[variableNames]}
//{type:"assignFromLiteral", lval:stringName, rval:integer}
// {type:"assignMath", lval:stringName, lOperand:variableName, operation:stringSymbol, rOperand:variableName}
// {type:"jumpIf",condition:nameString,destination:integer} jumpIf(variable, destination)// jump if it is not 0

//WIP
//TODO i forgot i need to support setting arrays too, not just reading from them


function interpretChessLang( bytecode){
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
			localVariables[a.paramNames] = parameterValues[i]
		}
		
		stack.push({
			functionName:functionName,
			 instructionPointer: 0,
			 localVariables: localVariables,
		})
	}
	
	jumpToFunction("main") // start running the program at "main"
	
	
	while(true){//TODO
		
		let thisFrame = stack[stack.length - 1] // the top function call in the stack
		let instruction = getBytecodeWrapperOfFunction( thisFrame.functionName).statements[ thisFrame.instructionPointer] // look at the top frame in the stack to see the name of the function we are supposed to be in. Then, use that to get the bytecode stuff for that function, including the list of instructions. Then, look at the frame to see which instruction we are on, and get that from the bytecode
		
		switch (instruction.type){
			case "assignFromVariable":
				let localVars = thisFrame.localVariables
				localVars[instruction.lval] = localVars[instruction.rval]
				thisFrame.instructionPointer++
				break
			case "assignFromArrayAcces":
				//TODO
				break
			case "assignFromFunctionCall":
				let localVars = thisFrame.localVariables
				jumpToFunction(instruction.functionName, instruction.parameters.map(i=>localVars[i]))// jumpToFunction expects the literal values of the parameters, while the bytecode instruction gives the variable names
				// setting the variable to the return value will be handled when the function returns
				// incrementing the instructionPointer will be handled when the function returns
				break
			case "assignMath":
				let localVars = thisFrame.localVariables
				switch( instruction.operation){
					case "+":
						localVars[instruction.lval] = localVars[instruction.lOperand] + localVars[instruction.rOperand]
						break
					case "-":
						localVars[instruction.lval] = localVars[instruction.lOperand] - localVars[instruction.rOperand]
						break
					default:
						throw new Error("invalid opcode math operation")
					
				}
				
				thisFrame.instructionPointer++
				break
			case "jumpIf":
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
				break
			default:
				throw new Error("invalid opcode instruction")
		}
		
		
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
					throw "finished running program" //TODO do this better
				}
				
				// for now, just have the return value be whatever value is stored in the variable named "r"
				//WARNING if "r" is not defined it will run into trouble maybe
				let returnValue = thisFrame.localVariables["r"]
				
				stack.pop()
				
				// now, finish off the instruction that we return to
				
				let newFrame = stack[stack.length - 1]
				
				let localVars = newFrame.localVariables
				let instructionWeReturnTo = getBytecodeWrapperOfFunction( newFrame.functionName).statements[ newFrame.instructionPointer]
				
				
				localVars[instruction.lval] = returnValue
				
				newFrame.instructionPointer++
				
				returnIfReachedEnd() // we need to call this again since we just incremented the instructionPointer again
			}
		}
		
		returnIfReachedEnd()
		
		
		
	}
	
	function getBytecodeWrapperOfFunction( functionName){
		for( let i = 0; i < bytecode.length; i++){
			if( bytecode[i].name == functionName){
				return bytecode[i]
			}
		}
		throw new Error("error")
	}
	
	
}


