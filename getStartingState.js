



// this file, unlike what the title says, takes an AST of chessLang and turns it into chessLang bytecode.
// I am doing bytecode instead of just interepreting the AST because I need to do the stack and instruction pointer myself to easily handle duplicating programs


//AST is Abstract Syntax Tree. There are things about it on the internet for making your own coding language

class AFunction{
	constructor( name, params, statements){
		this.name = name
		this.paramNames = paramNames
		this.statements = statements
	}
}


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


function astToByetcode( ast){
	// this does it for the whole thing
	return ast.map( astToByetcodeForFunction)
	
}

function astToByetcodeForFunction( functionAst ){
	// this does it just for the contents of a function, not the whole thing
	
	let statements = functionAst.statements
	
	for( let i = 0; i < statements.length; i++){
		
		if( statements[i].type == "assignment"){
			
		}
		if( statements[i].type == "if"){
			
		}
		if( statements[i].type == "while"){
			
		}
		
		
	}
}



function getBytecodeOfExpression( expressionAst){
	// takes an expression ast and returns both a sequence of bytecode instructions and the name of the variable that will have the value of that expression after those bytecode instructions are run
	
	return {
		bytecodeInstructions: [],
		resultVariableName: a,
	}
}


let counter = 0
function getNewUniqueIdentifier(){
	return "abc" + (counter++)
}

















