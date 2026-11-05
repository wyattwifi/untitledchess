



export function compilerWarn( message){
	// this is for warnings come across during compilation
	console.warn("Compiler warning message: " +message) //TODO do this better
}




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
// this returns the statement containing the scope, not just the array
export function getScopeFromScopeIdentifier( ast, scopeIdentifier){ // ast can also be a statement array if this is calling itself recursively
	//NOTE this function is sloppy about the use of the word "ast"
	if( scopeIdentifier.length == 1){
		return ast[scopeIdentifier[0]]
	}
	
	let newScopeIdentifier = clone(scopeIdentifier)
	newScopeIdentifier.shift()
	
	switch( ast[scopeIdentifier[0]].type){
		case "functionDefinition":
			return getScopeFromScopeIdentifier( ast[scopeIdentifier[0]].statements, newScopeIdentifier)
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

export function doForEachExpression( ast, fnToDo){
	doForEachStatementArray(ast,( arrayOfStatements, scopeIdentifier) => {
		for( let i = 0; i < arrayOfStatements.length; i++){
			let statement = arrayOfStatements[i]
			switch( arrayOfStatements[i].type){
				case "assignment":
					helperDoForExpressionRecursively( statement.lVal, fnToDo, scopeIdentifier)
					helperDoForExpressionRecursively( statement.rVal, fnToDo, scopeIdentifier)
					
					break
				case "returnStatement":
					helperDoForExpressionRecursively( statement.value, fnToDo, scopeIdentifier)
					break
					
				case "declaration":
				case "functionDefinition":
				case "classDefinition":
					break
				case "standaloneFuncall":
					helperDoForExpressionRecursively( statement.expression, fnToDo, scopeIdentifier)
					break
					
				case "for":{
					helperDoForExpressionRecursively( statement.iterable, fnToDo, scopeIdentifier)
					break}
					
				case "if":
				case "while":{
					helperDoForExpressionRecursively( statement.condition, fnToDo, scopeIdentifier)
					break}
				default:
					throw "still need to account for " + JSON.stringify(arrayOfStatements[i])
			}
			fnToDo( arrayOfStatements[i], scopeIdentifier)
		}
	})
	function helperDoForExpressionRecursively( expression, fnToDo, scopeIdentifier){
		
		fnToDo(expression, scopeIdentifier)
		
		switch( expression.op){
			
			case "variable":
				return
			case "functionCall":
				
				expression.args.map(arg=> helperDoForExpressionRecursively( arg, fnToDo, scopeIdentifier))
				
				
				return
			case "arrayAccess":
				helperDoForExpressionRecursively( expression.array, fnToDo, scopeIdentifier)
				helperDoForExpressionRecursively( expression.index, fnToDo, scopeIdentifier)
				return
			case "arrayDeclaration":
				
				for( let element of expression.elements){
					helperDoForExpressionRecursively( element, fnToDo, scopeIdentifier)
				}
				
				break
			case "UNARYMINUS":
			case "NOT":
				helperDoForExpressionRecursively( expression.operand, fnToDo, scopeIdentifier)
				return
			case "number":
			case "stringLiteral":
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
				helperDoForExpressionRecursively( expression.left, fnToDo, scopeIdentifier)
				helperDoForExpressionRecursively( expression.right, fnToDo, scopeIdentifier)
				return
			default:
				throw new InternalCompilerError("Expression OP not supported. Here is the expression: " + JSON.stringify(expression))
		}
	}
}

function clone(a){
	return structuredClone(a)
}







