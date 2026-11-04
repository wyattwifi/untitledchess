








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
		
		
		// we have done the main thing, just do recursion if needed
		switch( statement.type){
			case "functionDefinition":{
				let newScopeIdentifier = clone(myScopeIdentifier)
				newScopeIdentifier.push(i)
				doForEachStatementArrayHelper( statement.statements, fnToDo, newScopeIdentifier)
				break}
			case "for":
			case "if":
			case "while":{
				let newScopeIdentifier = clone(myScopeIdentifier)
				newScopeIdentifier.push(i)
				doForEachStatementArrayHelper( statement.contents, fnToDo, newScopeIdentifier)
				break}
		}
	}
	
	fnToDo(arrayOfStatements, myScopeIdentifier) //NOTE this does lower things first
	
}

// NOTE:scopeIdentifier is the scope that I am in, not the scope that I am
export function getScopeFromScopeIdentifier( ast, scopeIdentifier){ // ast can also be a statement array if this is calling itself recursively
	
	if( scopeIdentifier.length == 1){
		return ast[scopeIdentifier[0]]
	}
	
	let newScopeIdentifier = clone(scopeIdentifier)
	newScopeIdentifier.shift()
	
	switch( ast[scopeIdentifier[0]].type){
		case "functionDefinition":
			return getScopeFromScopeIdentifier( ast[scopeIdentifier[0]].statement, newScopeIdentifier)
		case "if":
		case "while":
		case "for":
			return getScopeFromScopeIdentifier( ast[scopeIdentifier[0]].contents, newScopeIdentifier)
		default:
			throw new InternalCompilerError("Invalid Scope identifier!")
	}
	
	
}


export function doForEachStatement( ast, fnToDo){
	doForEachStatementArray(ast,( arrayOfStatements, scopeIdentifier) => {
		for( let i = 0; i < arrayOfStatements.length; i++){
			fnToDo( arrayOfStatements[i], scopeIdentifier)
		}
	})
}

function clone(a){
	return structuredClone(a)
}







