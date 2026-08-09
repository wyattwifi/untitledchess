



// this file, unlike what the title says, takes an AST of chessLang and turns it into chessLang bytecode.
// I am doing bytecode instead of just interepreting the AST because I need to do the stack and instruction pointer myself to easily handle duplicating programs


//AST is Abstract Syntax Tree. There are things about it on the internet for making your own coding language
/*
class AFunction{
	constructor( name, params, statements){
		this.name = name
		this.paramNames = paramNames
		this.statements = statements
	}
}*/


/* here are the possible bytecode operations:

there is a better thing in the interpreter file actually

// this is not nessisarily a good choice, just something for now
// note that in this whole thing, for now im not worrying about performance, just trying to get it to work

assign( lVal variable, rVal variable, array access (based on a variable), function call( variable parameters), or literal value, maybe anything im forgetting too)
assignMath( lVal variable, rVal variable operation variable those 3 in that order)
jumpIf(variable)// jump if it is not 0

basically it can be the same as the AST but you cant have multiple function calls on the same line maybe? this needs more thinking through

the compiled byetcode is a list of functions, wich is in turn a name, the param names, and an array of the byetcode statements

*/


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
}


function astToBytecode( ast){
	// this does it for the whole thing
	return ast.map( astToBytecodeForFunction)
	
}

function astToBytecodeForFunction( functionAst ){
	// this does it just for the contents of a function, not the whole thing
	
	let statements = functionAst.statements
	
	let resultCode = []
	
	for( let i = 0; i < statements.length; i++){
		
		let statement = statements[i]
		
		if( statement.type == "assignment"){
			// take {type:"assignment", lVal:tokens[0].contents, rVal: expression}
			// ...to {type:"assignFromVariable", lval:stringName, rval:variableName }
			
			let expressionLowered = getBytecodeOfExpression( statement.rVal)
			
			resultCode.push(...expressionLowered.bytecodeInstructions)
			
			resultCode.push({type:"assignFromVariable", lval:new String(statement.lVal), rval:expressionLowered.resultVariableName })//TODO don't know the format have in right format if not string or whatever
			
		}
		if( statements[i].type == "if"){
			//TODO
		}
		if( statements[i].type == "while"){
			//TODO
		}
		
		
	}
	return {
		name:functionAst.name,
		paramNames:functionAst.params.map(p=>p.contents),
		statements:resultCode
	}
}

//For now I am just trying to get it to work, not get it to work efficiently

function getBytecodeOfExpression( expressionAst){
	// takes an expression ast and returns both a sequence of bytecode instructions and the name of the variable that will have the value of that expression after those bytecode instructions are run
	
	let resultName = getNewUniqueIdentifier()
	
	
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
	
	return {
		bytecodeInstructions: [],
		resultVariableName: a,
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









