

import {InternalCompilerError} from "./compiler-utils.js"
import {getStartingState} from "../getStartingState.js"

import {uiUpdateState, uiHint, uiGetUserChoice} from "./../ui.js"

class ChessLangStandardLibraryError extends Error{
	constructor(message){
		super("ChessLangStandardLibraryError:" + message)
	}
}

//TODO chessLang does not support assigning to arrays


function fixStateRefrences(thread){
	for( let i = 0; i < thread.stack.length; i++){
		let frame = thread.stack[i]
		frame.localVariables["state"] = thread.state
	}
}


export let BUILT_IN_API = [
	{
		name:"print",
		argTypes:["string"],
		effect: async function(a){
			console.warn( "Print function used for debugging: " + a)
			console.warn( "Or, if this is more helpful,: " + JSON.stringify(a))
		}
	},
	{
		name:"length",
		effect: async function(a){
			return a.length
		}
	},
	{
		name:"mod",
		effect: async function(a, b){
			return a % b
		}
	},
	{
		name:"range",
		effect: async function(a){
			let result = []
			for( let i = 0; i < a; i++){
				result.push(i)
			}
			return result
		}
	},
	{
		name:"createLoc",
		effect: async function(x,y){
			return {x:x, y:y}
		}
	},
	{
		name:"throwError",
		effect: async function(message){
			throw new Error(message)
		}
	},
	{
		name:"createArray",
		effect: async function( ...values){
			return values
		}
	},
	{
		name:"setState",
		effect: async function( newState){
			currentRunningUniverse.state = newState
			fixStateRefrences(currentRunningUniverse)
		}
	},
	{
		name:"endGame",
		effect: async function( message){
			console.log(message)
			let p = document.createElement("p")
			p.innerHTML = message
			document.body.appendChild(p)
		}
	},
	{
		name:"createEmptyArray",
		effect: async function( unused){
			return []
		}
	},
	{
		name:"assignArray",
		effect: async function( array, index, value){
			array[index] = value
		}
	},
	{
		name:"uiUpdateState",
		effect: async function(){
			if( currentRunningUniverse.amIASim){return}
			uiUpdateState(currentRunningUniverse.state)
		}
	},
	{
		name:"uiHint",
		effect: async function(message){
			if( currentRunningUniverse.amIASim){
				// if it is a sim, this is the starting loc or ending loc of the move. This is helpful for a computer UI
				if( message.startLoc){
					currentRunningUniverse.state.startLoc = message.startLoc
				} else if( message.endLoc){
					currentRunningUniverse.state.endLoc = message.endLoc
				} else {
					throw "err1213243"
				}
				return
			}
			// otherwise, if it is not in a sim, it shows all the possible moves
			uiHint(message)
		}
	},
	{
		name:"simulateAllChoicesInFunction",
		effect: async function( functionToCall, ...parameters){
			
			let results = []
			
			let a = new Universe( currentRunningUniverse.bytecode, structuredClone(currentRunningUniverse.state))
			
			
			
			currentSimThreads = [a]
			a.idNum = Math.random()
			a.jumpToFunction(functionToCall, parameters)
			
			fixStateRefrences(a)
			
			while(currentSimThreads.length > 0){
				
				let t = currentSimThreads[0]
				
				try{ // since it can throw for moving off the board or something - TODO do this better
					await t.runCourse()
					
					results.push(t.state)
				} catch(e){
					if(e.message != "Tried to move off of the board"){
						throw e
					}
					results.push("err")
				}
				// remove the thread from the list of simThreads. We cannot just pop off the last one, since 
				currentSimThreads.shift() //WARNING this might not work since running the thread can add new threads
			}
			
			return results
			//TODO get working
		}
	},
	{
		name:"getUserChoice",
		effect:async function( userID, title, explanationOfOptions){
			
			let numOfOptions = explanationOfOptions.length
			
			if( currentRunningUniverse.amIASim){
				
				let copies = []
				for( let i = 0; i < numOfOptions - 1; i++){
					// let newThread = structuredClone(currentRunningUniverse)
					let newThread = new Universe( currentRunningUniverse.bytecode, structuredClone(currentRunningUniverse.state))
					newThread.stack = structuredClone(currentRunningUniverse.stack)
					currentSimThreads.push(newThread)
					
					fixStateRefrences(newThread)
					
					// now we need to run the rest of the instruction, since it is not mid-instruction currently
					let t = newThread // for easy typing
					t.idNum = Math.random()
					// we need to do this current instruction now so it gets the correct return value of getUserChoice, instead of it not being run yet and being run again later, making an infinite loop
					let thisFrame = t.stack[t.stack.length - 1]
					let instruction = t.getBytecodeWrapperOfFunction( thisFrame.functionName).statements[ thisFrame.instructionPointer]
					let localVars = thisFrame.localVariables
					
					this.setVariable( instruction.lval, i + 1)					
					thisFrame.instructionPointer++
					
					if( t.returnIfReachedEnd() == "finished running program"){
						throw "Ran into erro the program finished with getUserChoice. Internal error"
					}
					
				}
				// simulate input - the original thread gets 0, the other threads get the other numbers
				return 0
			}
			if( numOfOptions <= 0){
				throw new ChessLangStandardLibraryError("That isn't much of a choice, is it?")
			}
			return await uiGetUserChoice( userID, title, explanationOfOptions)
		}
	},
]

let currentSimThreads = []

// supported bytecode operations for now
// assign( lval variable, rval variable, array access (based on a variable), function call( variable parameters), or literal value, maybe anything im forgetting too)
//{type:"assignFromVariable", lval:stringName, rval:variableName }
//{type:"assignFromArrayAcces", lval:stringName, nameOfVarHoldingArray:string,index:variableName}
//{type:"assignFromMemberAcces", lval:stringName, nameOfVarHoldingObject:string,memberStringName:stringName}
//{type:"assignFromFunctionCall", lval:stringName, varHoldingFunctionName:string,parameters:[variableNames]}
//{type:"assignFromLiteral", lval:stringName, rval:integer}
//{type:"assignFromLiteralString", lval:varName, rval:string}
// {type:"assignMath", lval:stringName, lOperand:variableName, operation:stringSymbol, rOperand:variableName}
// {type:"jumpIfNotZero",condition:variableNameString,destination:integer} jumpIf(variable, destination)// jump if it is not 0, only jumps within functions
// {type:"jumpIfZero",condition:variableNameString,destination:integer} jumpIf(variable, destination)// jump if it is  0, only jumps within functions
// {type:"unconditionalJump", destination:integer}
// {type:"nop"} - No OPeration
//{type:"return",value:variableName}
// {type:"malloc", amount:intAmount, placeToStoreAddress:nameOfLocalVar}
// {type:"assignToHeap", localVarHoldingAddress:localVarHoldingAddress, localVarHoldingValue:stuffToGetElement.resultVariableName}
// {type:"assignFromHeap", lvalLocalVarName:stringOfVarName, localVarHoldingAddress:stringOfVarName}


//WIP
//TODO i forgot i need to support setting arrays too, not just reading from them. Hence it needs references, because array can be in arrays


// let globalStateVariable = getStartingState()

let currentRunningUniverse = null

// let simThreads = []


// if a thread is simulated, when it gets to getUserChoice, it turns into 2 duplicate threads. Every thread just goes along, getting an int each time it calls getUserChoice, and eventually returns its state

// the state of a universe/thread object is entirely captured by the game state, if it is a simulation, and the stack ( the bytecode should be the same for all universe/thread objects)
class Universe{
	constructor( bytecode, state){
		this.stack = []
		this.state = state
		this.bytecode = bytecode
		this.ifSimChoicesMade = []
		this.amIASim = true // if not this needs to be overwritten manually
		
		this.heap = [] // TODO make this work with universe cloning, and TODO have actual memory management
		this.heapEnd = 0
	}
	
	jumpToFunction( functionName, parameterValues){
		// functionName is a string of the function name
		// parameterValues is an array of plain values of the parameters (eg ints themselves)
		
		
		// first, we need to see if there is an effect in effect that overrides what function gets called
		for( let i = 0; i < this.state.pieces.length; i++){
			let piece = this.state.pieces[i]
			if( piece.position["onBoard"]){
				if( piece.effects.length){
					if( functionName == piece.effects[0].replacedFunction){
						functionName = piece.effects[0].newFunction
					}
				}
			}
		}
		
		
		let localVariables = [] // indexed by strings of the name
		
		let a = this.getBytecodeWrapperOfFunction( functionName)
		
		if( parameterValues.length != a.paramNames.length){ // check to see that it has the expected number of parameters
			console.log(this.stack)
			console.log(this.bytecode)
			throw new Error("passed wrong number of parameters to a function. The function you tried to call is " + functionName + " with parameters " + parameterValues)
		}
		
		
		// check to see that all parameters are defined
		for( let param of parameterValues){
			if( param === undefined){
				console.log(this.stack)
				console.log(this.bytecode)
				throw "Error, param undefined"
			}
		}
		
		// add the parameters to the local variables
		for( let i = 0; i < a.paramNames.length; i++){
			localVariables[a.paramNames[i]] = parameterValues[i]
		}
		
		localVariables["state"] = this.state // there is not a built-in way to handle global variables, so we just set it here
		
		
		
		
		
		
		
		this.stack.push({
			functionName:functionName,
			 instructionPointer: 0,
			 localVariables: localVariables,
		})
	}
	async beASim( functionToStartWith, arrayOfParameters){
		this.jumpToFunction(functionToStartWith, arrayOfParameters)
		await this.runCourse()
		return this.state
	}
	
	async runCourse(){
		
		
		
		// this.jumpToFunction("main", []) // start running the program at "main" - actually this needs to get called before
		
		
		while(true){
			
			currentRunningUniverse = this
			
			let thisFrame = this.stack[this.stack.length - 1] // the top function call in the stack
			let instruction = this.getBytecodeWrapperOfFunction( thisFrame.functionName).statements[ thisFrame.instructionPointer] // look at the top frame in the stack to see the name of the function we are supposed to be in. Then, use that to get the bytecode stuff for that function, including the list of instructions. Then, look at the frame to see which instruction we are on, and get that from the bytecode
			//let localVars = thisFrame.localVariables
			
			switch (instruction.type){
				case "assignFromVariable":{
					
					
					// Currently, the only lval that this accepts is an expression of a variable
					//TODO do this better
					let lval = instruction.lval.contents
					if( lval === undefined || instruction.lval.op != "variable"){
						throw new InternalCompilerError("Invalid Assignment LVal!")
					}
					
					this.setVariable(lval, this.getVariable(instruction.rval))
					thisFrame.instructionPointer++
					break}
				case "assignToHeap":{
					let address = this.getVariable(instruction.localVarHoldingAddress)
					this.heap[address] = this.getVariable(instruction.localVarHoldingValue)
					thisFrame.instructionPointer++
					break}
				case "assignFromHeap":{
					// {type:"assignFromHeap", lvalLocalVarName:stringOfVarName, localVarHoldingAddress:stringOfVarName}
					let address = this.getVariable(instruction.localVarHoldingAddress)
					
					this.setVariable( instruction.lvalLocalVarName, this.heap[address])
					thisFrame.instructionPointer++
					break}
				
				//{type:"assignFromMemberAcces", lval:stringName, nameOfVarHoldingObject:string,memberStringName:stringName}
				case "assignFromMemberAcces":
					// note, this is similar to assignFromArrayAcces
					throw "TODO"
// 					let localVars = thisFrame.localVariables
// 					let objectValue = localVars[nameOfVarHoldingObject]
// 					
// 					this.setVariable( instruction.lval, theArrayItself[indexValue])// 					thisFrame.instructionPointer++
// 					break}
// 					
				
				case "assignFromLiteral":{
					this.setVariable(instruction.lval, instruction.rval)
					thisFrame.instructionPointer++
					break}
				case "nop":{
					thisFrame.instructionPointer++
					break}
				case "assignFromLiteralString":{
					this.setVariable(instruction.lval, instruction.rval)
					thisFrame.instructionPointer++
					break}
				case "malloc":{
					
					// {type:"malloc", amount:intAmount, placeToStoreAddress:nameOfLocalVar}
					//TODO have actual memory management
					this.setVariable( instruction.placeToStoreAddress, this.heapEnd)
					this.heapEnd += instruction.amount
					thisFrame.instructionPointer++
					break}
				case "assignFromFunctionCall":{
					
					let isDoneAlready = false
					
					//WARNING as a temporary fix, this will call the variable itself or the value it holds, whichever is available
					
					
					// first, we need to check if it is one of the built-in API functions
					for( let i = 0; i < BUILT_IN_API.length; i++){
						if(BUILT_IN_API[i].name == this.getVariable(instruction.varHoldingFunctionName)){
							this.setVariable( instruction.lval, await BUILT_IN_API[i].effect(...instruction.parameters.map(i=>this.getVariable(i))))
							thisFrame.instructionPointer++ // we need to do this now because there is not all that interesting instruction pointer stack stuff as with a normal function call. instead it is just like a normal statement
							isDoneAlready = true
						}
					}
					for( let i = 0; i < BUILT_IN_API.length; i++){
						if(BUILT_IN_API[i].name == instruction.varHoldingFunctionName){
							this.setVariable( instruction.lval, await BUILT_IN_API[i].effect(...instruction.parameters.map(i=>this.getVariable(i))))
							thisFrame.instructionPointer++ // we need to do this now because there is not all that interesting instruction pointer stack stuff as with a normal function call. instead it is just like a normal statement
							isDoneAlready = true
						}
					}
					
					if( isDoneAlready){
						break
					}
					
					// now we know that it is not a built in api function
					
					if( this.getVariable( instruction.varHoldingFunctionName)){
						
						this.jumpToFunction(this.getVariable(instruction.varHoldingFunctionName), instruction.parameters.map(i=>this.getVariable(i)))// jumpToFunction expects the literal values of the parameters, while the bytecode instruction gives the variable names
					} else {
						this.jumpToFunction(instruction.varHoldingFunctionName, instruction.parameters.map(i=>this.getVariable(i)))
					}
					
					// setting the variable to the return value will be handled when the function returns
					// incrementing the instructionPointer will be handled when the function returns
					break}
				case "assignMath":{
					let localVars = thisFrame.localVariables
					switch( instruction.operation){
						case "+":
							this.setVariable( instruction.lval, this.getVariable( instruction.lOperand) + this.getVariable( instruction.rOperand))
							break
						case "-":
							this.setVariable( instruction.lval, this.getVariable( instruction.lOperand) - this.getVariable( instruction.rOperand))
							break
						case "TESTLESSTHAN":
							this.setVariable( instruction.lval, this.getVariable( instruction.lOperand) < this.getVariable( instruction.rOperand))
							break
						case "TESTGREATERTHAN":
							this.setVariable( instruction.lval, this.getVariable( instruction.lOperand) > this.getVariable( instruction.rOperand))
							break
						case "TESTLESSTHANOREQUALTO":
							this.setVariable( instruction.lval, this.getVariable( instruction.lOperand) <= this.getVariable( instruction.rOperand))
							break
						case "TESTGREATERTHANOREQUALTO":
							this.setVariable( instruction.lval, this.getVariable( instruction.lOperand) >= this.getVariable( instruction.rOperand))
							break
						case "OR":
							this.setVariable( instruction.lval, this.getVariable( instruction.lOperand) || this.getVariable( instruction.rOperand))
							break
						case "AND":
							this.setVariable( instruction.lval, this.getVariable( instruction.lOperand) && this.getVariable( instruction.rOperand))
							break
						case "TESTEQUAL":
							this.setVariable( instruction.lval, this.getVariable( instruction.lOperand) == this.getVariable( instruction.rOperand))
							break
						case "ASTERISK":
							this.setVariable( instruction.lval, this.getVariable( instruction.lOperand) * this.getVariable( instruction.rOperand))
							break
						case "SLASH":
							this.setVariable( instruction.lval, this.getVariable( instruction.lOperand) / this.getVariable( instruction.rOperand))
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
							if( this.getVariable( instruction.condition)){
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
							if( !this.getVariable(instruction.condition)){
								thisFrame.instructionPointer = instruction.destination
							} else {
								// if we did not jump then we still need to increment the instruction pointer
								thisFrame.instructionPointer++
							}
							break}
						case "return":{
							this.setVariable( "r", this.getVariable(instruction.value))
							thisFrame.instructionPointer = this.getBytecodeWrapperOfFunction( thisFrame.functionName).statements.length
							break}
						default:
							throw new InternalCompilerError("invalid opcode instruction: " + JSON.stringify(instruction))
			}
			
			
			// if this returns "finished running program", the whole thing should exit
			//check to see if we got to the end of the function (and return if needed)
			
			
			if( this.returnIfReachedEnd() == "finished running program"){
				return
			}
			
			
			
		}
		
	}
	
	// these are needed because it can be setting a variable from a lower scope
	setVariable( name, value){
		let thisFrame = this.stack[this.stack.length - 1]
		let localVars = thisFrame.localVariables
		localVars[name] = value
		//TODO what if it is from a lower scope
	}
	getVariable( name){
		// if it is in the current scope, return that
		let thisFrame = this.stack[this.stack.length - 1]
		let localVars = thisFrame.localVariables
		if( localVars[name] !== undefined){
			return localVars[name]
		}
		
		let accessibleScopes = this.getBytecodeWrapperOfFunction( thisFrame.functionName).accessibleScopes
		
		// now, it must be in an outer scope that this has access to. So, we just go down the stack, making sure it has access
		for( let i = this.stack.length - 1; i >= 0; i--){
			let thatFrame = this.stack[i]
			if( accessibleScopes.includes(thatFrame.functionName) && thatFrame.localVariables[name] !== undefined){
				return thatFrame.localVariables[name]
			}
		}
		
		// we could not find it anywhere
		return undefined
		
	}
	
	returnIfReachedEnd(){
		
		let thisFrame = this.stack[this.stack.length - 1] // the top function call in the stack NOTE we need to get this fresh each time we check if a return is needed because we might have just returned from a function and be in a different frame then before
		
		let functionBytecode = this.getBytecodeWrapperOfFunction( thisFrame.functionName)
		
		if( functionBytecode.statements.length == thisFrame.instructionPointer){ // if we just went off the end of the list of statements
			// we should return from the function
			// that also includes storing the function return value in the proper variable and incrementing the instructionPointer
			// note that incrementing instructionPointer when we return may lead us to return from another function, so we need to account for that
			
			// first, check if there is even another function to return to. If not, we are done
			if( this.stack.length == 1){
				return "finished running program" //this tells the calling function that the program is done running
			}
			
			// for now, just have the return value be whatever value is stored in the variable named "r"
			//WARNING if "r" is not defined it will run into trouble maybe
			let returnValue = thisFrame.localVariables["r"]
			
			this.stack.pop()
			
			// now, finish off the instruction that we return to
			
			let newFrame = this.stack[this.stack.length - 1]
			
			let localVars = newFrame.localVariables
			let instructionWeReturnTo = this.getBytecodeWrapperOfFunction( newFrame.functionName).statements[ newFrame.instructionPointer]
			
			
			this.setVariable( instructionWeReturnTo.lval, returnValue)			
			newFrame.instructionPointer++
			
			if( this.returnIfReachedEnd() == "finished running program"){ // we need to call this again since we just incremented the instructionPointer again
				return "finished running program" // propogate up the result
			}
		}
	}
	
	getBytecodeWrapperOfFunction( functionName){
		for( let i = 0; i < this.bytecode.length; i++){
			if( this.bytecode[i].name == functionName){
				return this.bytecode[i]
			}
		}
		console.log( this.stack, this.bytecode)
		throw new Error("error function " + functionName + " does not exist")
	}
}


export async function interpretChessLang( bytecode){
	// the parameter is an array of objects of the format {name, [paramNames],statements:[bytecode instructions]}
	
	let a = new Universe( bytecode, getStartingState())
	a.amIASim = false
	await a.beASim("__main",[])
	
	
}













