



export function compilerWarn( message){
	// this is for warnings come across during compilation
	console.warn("Compiler warning message: " +message) //TODO do this better
}




export class InternalCompilerError extends Error{
	constructor(message){
		super("Internal Compiler Error. User, this isn't your fault. Apparently the compiler is coded wrong. If you want it, here's the error message:" + message)
	}
}


// a node identifier is an array of indexes for how to get to a node from the root node. So, the root node is []



// a scope identifier is an array of indexes of the statements for how you get to a scope

// ast is the ast
// fnToDo example: ( arrayOfStatements, nodeIdentifier) => {doTheThing()} NOTE nodeIdentifier is the identifier of the node containing the array, not the item of the array
export function doForEachStatementArray(ast, fnToDo){
	doForEachStatementArrayHelper( ast, fnToDo, [])
}


// myNodeIdentifier is the nodeIdentifier of the statement containing that array of statements
function doForEachStatementArrayHelper(arrayOfStatements, fnToDo, myNodeIdentifier){
	
	
	for( let i = 0; i < arrayOfStatements.length; i++){
		let statement = arrayOfStatements[i]
		
		
		// we have done the main thing, just do recursion if needed
		switch( statement.type){
			case "functionDefinition":{
				let newNodeIdentifier = clone(myNodeIdentifier)
				newNodeIdentifier.push(i)
				doForEachStatementArrayHelper( statement.statements, fnToDo, newNodeIdentifier)
				break}
			case "for":
			case "if":
			case "while":{
				let newNodeIdentifier = clone(myNodeIdentifier)
				newNodeIdentifier.push(i)
				doForEachStatementArrayHelper( statement.contents, fnToDo, newNodeIdentifier)
				break}
		}
	}
	
	fnToDo(arrayOfStatements, myNodeIdentifier) //NOTE this does lower things first
	
}

// NOTE:scopeIdentifier is the scope that I am in, not the scope that I am, except for when it is the scope that I am
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


// this only can find statement nodes, not expressions
export function getNodeFromNodeIdentifier( ast, nodeIdentifier){
	
	nodeIdentifier = structuredClone(nodeIdentifier)
	let currentNode = ast
	let isCurrentNodeTheEntireAST = true
	
	
	while( nodeIdentifier.length){
		
		// if the current node is the entire ast, then it does not have a type property
		if( isCurrentNodeTheEntireAST){
			currentNode = currentNode[nodeIdentifier[0]]
			nodeIdentifier.shift()// remove the element at the start
			isCurrentNodeTheEntireAST = false
			continue
		}
		
		switch( currentNode.type){
			case "functionDefinition":{
				currentNode = currentNode.statements[nodeIdentifier[0]]
				nodeIdentifier.shift()// remove the element at the start
				break}
			case "if":
			case "while":
			case "for":{
				currentNode = currentNode.contents[nodeIdentifier[0]]
				nodeIdentifier.shift()// remove the element at the start
				break}
			default:
				throw new InternalCompilerError("Invalid Node identifier!")
		}
	}
	
	return currentNode
}


// while traversing the AST sometimes you need to make changes, but changing it while traversing it can lead to issues. This supplies as one of the parameters of fnToDo a function to make a change to the AST. It takes the nodeIdentifier of the node to replace and an array of nodes to replace it with. To add a new node without deleting any, just include the old node right back in the array again. To delete a node without adding anything, just pass an empty array
// fnToDo has type (statement, nodeIdentifier, fnToReplaceNode)
// fnToReplaceNode takes a nodeIdentifier and an array of new nodes
// this keeps the changes you make with fnToReplaceNode untill it is done going through the whole AST
export function doForEachStatement( ast, fnToDo){
	
	let changesToMake = []
	
	doForEachStatementArray(ast, (arrayOfStatements, nodeIdentifier) => {
		for(let i = 0; i < arrayOfStatements.length; i++) {
			
			let statementIdentifier = structuredClone(nodeIdentifier)
			statementIdentifier.push(i)
			
			fnToDo(
				arrayOfStatements[i],
		  statementIdentifier,
		  (nodeIdentifierToReplace, nodesToAdd) => {
			  
			  changesToMake.push({
				  nodeIdentifierToReplace: structuredClone(nodeIdentifierToReplace),
								 nodesToAdd: [...nodesToAdd]
			  })
		  }
			)
		}
	})
	
	// Sort deepest nodes first, then highest indexes first.
	// that should keep the nodeIdentifiers from being messed up
	changesToMake.sort((a, b) => {
		let aID = a.nodeIdentifierToReplace
		let bID = b.nodeIdentifierToReplace
		
		// Deeper nodes first.
		if(aID.length != bID.length) {
			return bID.length - aID.length
		}
		
		// At the same depth, later nodes first.
		for(let i = 0; i < aID.length; i++) {
			if(aID[i] != bID[i]) {
				return bID[i] - aID[i]
			}
		}
		
		return 0
	})
	
	// Apply the changes.
	for(let change of changesToMake) {
		
		let identifier = change.nodeIdentifierToReplace
		
		if(identifier.length == 0) {
			throw new InternalCompilerError(
				"Cannot replace the entire AST with doForEachStatement!"
			)
		}
		
		let parentIdentifier = identifier.slice(0, -1)
		let index = identifier[identifier.length - 1]
		
		let parentArray = getStatementsInNode(parentIdentifier, ast)
		
		if(index < 0 || index >= parentArray.length) {
			throw new InternalCompilerError(
				"Invalid node identifier while applying AST changes!"
			)
		}
		
		parentArray.splice(index, 1, ...change.nodesToAdd)
	}
}


// fnToDo is (statementArray, scopeIdentifier) => {doTheThing()}
export function doForThisScopeArrayAndAllScopeArraysUnderIt( ast, scopeIdentifier, fnToDo){
	
	let myArrayOfStatements = []
	if( scopeIdentifier.length){
		let scope = getScopeFromScopeIdentifier( ast, scopeIdentifier)
		switch( scope.type){
			case "functionDefinition":
				myArrayOfStatements = scope.statements
				break
			case "if":
			case "while":
			case "for":
				myArrayOfStatements = scope.contents
				break
			default:
				throw new InternalCompilerError("Invalid Scope identifier!")
		}
		
	} else {
		// it is on the bottom level
		myArrayOfStatements = ast
	}
	
	
	// now myArrayOfStatements is set
	
	fnToDo(myArrayOfStatements, scopeIdentifier)
	
	let arrayOfStatements = myArrayOfStatements
	// now, do the recursion
	for( let i = 0; i < arrayOfStatements.length; i++){
		let statement = arrayOfStatements[i]
		
		
		// we have done the main thing, just do recursion if needed
		switch( statement.type){
			case "functionDefinition":
			case "for":
			case "if":
			case "while":{
				let newScopeIdentifier = clone(scopeIdentifier)
				newScopeIdentifier.push(i)
				doForThisScopeArrayAndAllScopeArraysUnderIt( ast, newScopeIdentifier, fnToDo)
				break}
		}
	}
	
	
}



export function doForEachExpression( ast, fnToDo){
	doForEachStatement(ast,( statement, nodeIdentifier) => {
		
		let myNodeIdentifier = structuredClone(nodeIdentifier)
		
		switch( statement.type){
			case "assignment":
				helperDoForExpressionRecursively( statement.lVal, fnToDo, myNodeIdentifier)
				helperDoForExpressionRecursively( statement.rVal, fnToDo, myNodeIdentifier)
				
				break
			case "returnStatement":
				helperDoForExpressionRecursively( statement.value, fnToDo, myNodeIdentifier)
				break
				
			case "declaration":
			case "functionDefinition":
			case "classDefinition":
				break
			case "standaloneFuncall":
				helperDoForExpressionRecursively( statement.expression, fnToDo, myNodeIdentifier)
				break
				
			case "for":{
				helperDoForExpressionRecursively( statement.iterable, fnToDo, myNodeIdentifier)
				break}
				
			case "if":
			case "while":{
				helperDoForExpressionRecursively( statement.condition, fnToDo, myNodeIdentifier)
				break}
			default:
				throw "still need to account for " + JSON.stringify(arrayOfStatements[i])
		}
	})
	function helperDoForExpressionRecursively( expression, fnToDo, nodeIdentifier){
		
		fnToDo(expression, nodeIdentifier)
		
		switch( expression.op){
			
			case "variable":
			case "createNewObject":
				return
			case "functionCall":
				
				helperDoForExpressionRecursively( expression.theFunction, fnToDo, nodeIdentifier)
				expression.args.map(arg=> helperDoForExpressionRecursively( arg, fnToDo, nodeIdentifier))
				
				
				return
			case "arrayAccess":
				helperDoForExpressionRecursively( expression.array, fnToDo, nodeIdentifier)
				helperDoForExpressionRecursively( expression.index, fnToDo, nodeIdentifier)
				return
			case "arrayDeclaration":
				
				for( let element of expression.elements){
					helperDoForExpressionRecursively( element, fnToDo, nodeIdentifier)
				}
				
				break
			case "UNARYMINUS":
			case "NOT":
				helperDoForExpressionRecursively( expression.operand, fnToDo, nodeIdentifier)
				return
			case "number":
			case "stringLiteral":
			case "createPointerToFunction":
				return
			case "memberAccess":
				helperDoForExpressionRecursively( expression.object, fnToDo, nodeIdentifier)
				// expression.member is a string, not an expression
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
				helperDoForExpressionRecursively( expression.left, fnToDo, nodeIdentifier)
				helperDoForExpressionRecursively( expression.right, fnToDo, nodeIdentifier)
				return
			default:
				throw new InternalCompilerError("Expression OP not supported. Here is the expression: " + JSON.stringify(expression))
		}
	}
}

function clone(a){
	return structuredClone(a)
}

/*
TODO broken for now
export function getParentNode( nodeIdentifier){
	nodeIdentifier = structuredClone(nodeIdentifier)
	nodeIdentifier.pop()
	return getNodeFromNodeIdentifier(nodeIdentifier)
}*/


// this returns the node of the function that this is in. If it is in a nested function, this returns the most-nested function that contains this
// this returns null if it is not in any function
export function getFunctionThisIsIn( nodeIdentifier, ast){
	nodeIdentifier = structuredClone(nodeIdentifier)
	nodeIdentifier.pop()
	let node = getNodeFromNodeIdentifier( ast, nodeIdentifier) // start it off with the node of the parent
	
	if( !nodeIdentifier.length){return null} // add a first check to see if the parent is the whole AST before we read the type of the parent
	while( node.type != "functionDefinition"){
		nodeIdentifier.pop()
		node = getNodeFromNodeIdentifier( ast, nodeIdentifier)
		
		//check to make sure we have not gotten to the top without reaching any function
		if( !nodeIdentifier.length){return null}
	}
	
	// now, do a final check
	if( node.type != "functionDefinition"){
		throw new InternalCompilerError("Given invalid Node Identifier!")
	}
	return node
}

// if, for, while, fundef, the whole ast all contain arrays of statements. This takes on of those nodes and returns the array of statements
export function getStatementsInNode( nodeIdentifier, ast){
	if( nodeIdentifier.length == 0){ // it is the node identifier of the entire AST
		return ast
	}
	let node = getNodeFromNodeIdentifier( ast, nodeIdentifier)
	switch( node.type){
		case "functionDefinition":
			return node.statements
		case "if":
		case "while":
		case "for":
			return node.contents
		default:
			throw new InternalCompilerError("Invalid node given!")
	}
	
}



