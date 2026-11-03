




import {InternalCompilerError} from "./compiler-utils.js"


export function makeNote(message){
	console.warn("NOTE:" + message)
}


export function pruneAST( ast){
	pruneUncalledFunctions(ast)
}




export function pruneUncalledFunctions( ast){
	
	//TODO this does not support storing functions in variables
	
	
	
	// first, we just go through the full ast and see all the functions that are called.
	// we start with main and do a pass to add any functions that it calls. When there is a pass that doesn't add stuff, we are done
	let calledFunctions = ["main"]
	
	
	// this is a hack because this doesnt yet support functions stored in variables or arrays
	for( let i = 0; i < 20; i++){
		calledFunctions.push("doActionOfPieceWithID" + i)
		calledFunctions.push("doPurchaseCostOfPieceWithID" + i)
	}
	
	
	function noteCall(nameOfCalledFunction){
		if( !calledFunctions.includes(nameOfCalledFunction)){
			calledFunctions.push(nameOfCalledFunction)
		}
	}
	
	function doForStatementArray( arrayOfStatements ){
		
		
		
		for( let i = 0; i < arrayOfStatements.length; i++){
			let statement = arrayOfStatements[i]
			switch( arrayOfStatements[i].type){
				case "assignment":
					doForExpression(statement.lVal)
					doForExpression(statement.rVal)
					break
				case "returnStatement":
					doForExpression(statement.value)
					break
					
				case "standaloneFuncall":
					doForExpression(statement.expression)
					break
					
					// now, we need to take care of non-lowest-level statements too
				case "for":
					doForStatementArray( statement.contents)
					doForExpression(statement.iterable)
					break
				case "declaration":
					break
				case "if":
					doForStatementArray( statement.contents)
					doForExpression(statement.condition)
					break
				case "while":
					doForStatementArray( statement.contents)
					doForExpression(statement.condition)
					break
				default:
					throw "still need to account for " + JSON.stringify(arrayOfStatements[i])
			}
		}
	}
	
	function doForExpression( expression){
		if( expression === undefined){
			throw new InternalCompilerError("Tried to verify an expression that is undefined")
		}
		
		
		switch( expression.op){
			
			case "functionCall":
				if( expression.theFunction.op == "variable"){
					
					noteCall(expression.theFunction.contents)//WARNING this does not handle functions in arrays etc
				} else {
					console.warn("not supported yet")//TODO
				}
				break
			case "arrayAccess":
				doForExpression( expression.array)
				doForExpression( expression.index)
				break
			case "UNARYMINUS":
			case "NOT":
				doForExpression( expression.operand)
				break
			case "variable":
			case "number":
			case "stringLiteral":
				break
			case "memberAccess":
				doForExpression( expression.object)
				break
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
				doForExpression( expression.left)
				doForExpression( expression.right)
				break
			case "arrayDeclaration":
				throw "TODO implement"
				break
			default:
				throw new InternalCompilerError("Expression OP not supported. Here is the expression: " + JSON.stringify(expression))
		}
		
		
		
		
	}
	/*
	for( let fundef of ast){
		doForStatementArray(fundef.statements, fundef.params)
	}*/
	
	// we do it over and over untill it stops finding new functions
	let functionsLastPass = -1 // this is not accurate, but we do it so that it will run at least once
	
	while( functionsLastPass < calledFunctions.length){
		functionsLastPass = calledFunctions.length
		for( let fundef of ast){
			if( calledFunctions.includes(fundef.name)){
				
				doForStatementArray(fundef.statements, fundef.params)
			}
		}
	}
	
	
	
	let thingsToDelete = ast.filter(fundef=>!calledFunctions.includes(fundef.name))
	
	console.log(thingsToDelete)
	
	
	
	// now, we just delete any unused ones
	//TODO finish implementing TODO support functions in vars arrays etc
	
}

