








export class InternalCompilerError extends Error{
	constructor(message){
		super("Internal Compiler Error. User, this isn't your fault. Apparently the compiler is coded wrong. If you want it, here's the error message:" + message)
	}
}






// a scope identifier is an array of indexes of the statements for how you get to a scope

// ast is the ast
// fnToDo example: ( arrayOfStatements, scopeIdentifier) => {doTheThing()}
export function doForEachStatementArray(ast, fnToDo){
	doForEachStatementArrayHelper( ast, fnToDo, [])
}


function doForEachStatementArrayHelper(arrayOfStatements, fnToDo, myScopeIdentifier){
	
	
	for( let i = 0; i < arrayOfStatements.length; i++){
		let statement = arrayOfStatements[i]
		
		fnToDo(statement, myScopeIdentifier)
		
		// we have done the main thing, just do recursion if needed
		switch( statement.type){
			case "functionDefinition":
				doForEachStatementArrayHelper( statement.statements, fnToDo, clone(myScopeIdentifier).push(i))
				break
			case "for":
			case "if":
			case "while":
				doForEachStatementArrayHelper( statement.contents, fnToDo, clone(myScopeIdentifier).push(i))
				break
		}
	}
	
	
}

function clone(a){
	return structuredClone(a)
}







