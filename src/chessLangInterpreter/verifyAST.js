




import {InternalCompilerError, doForEachStatementArray} from "./compiler-utils.js"



export function verifyAST( ast){
	verifyAllVarsDeclared(ast)
	removeVariableDeclarations(ast)
}


export function verifyAllVarsDeclared( ast){
	
	
	function isVarDeclared( nameIn){
		
		// there are a few special cases. State is a special global variable. Also, to simpify the grammar, functioncalls that are on their own line get turned into assignments into the special variable named "bitBucket"
		if( nameIn == "state" || nameIn == "bitBucket"){
			return true
		}
		
		for( let scope of scopes){
			for( let name of scope){
				if( name == nameIn){
					return true
				}
			}
		}
		return false
		// throw ("var" + nameIn + "not declared")
	}
	
	function declareVar( name){
		
		if( name === undefined || typeof name != "string"){
			throw new InternalCompilerError("Gave the wrong args to declareVar")
		}
		
		// first, we need to make sure that the name is not already declared
		//NOTE, maybe it would be better to allow overriding a variable with the same name from a lower scope, but then the interpreter wolud need to be adjusted to account for that too.
		
		if( isVarDeclared(name)){
			throw "tried to declare " + name + " twice!"
		}
		
		scopes[scopes.length - 1].push(name)
	}
	
	
	
	let scopes = []
	
	function verifyForStatementArray( arrayOfStatements, varsToDeclareRightOffTheBat = []){
		
		scopes.push([])
		
		for( let name of varsToDeclareRightOffTheBat){
			declareVar(name)
		}
		
		for( let i = 0; i < arrayOfStatements.length; i++){
			let statement = arrayOfStatements[i]
			switch( arrayOfStatements[i].type){
				case "assignment":
					verifyForExpression(statement.lVal)
					verifyForExpression(statement.rVal)
					break
				case "returnStatement":
					verifyForExpression(statement.value)
					break
				
				case "declaration":
					declareVar( statement.name)
					break
				case "standaloneFuncall":
					verifyForExpression(statement.expression)
					break
					
				// now, we need to take care of non-lowest-level statements too
				case "for":
					verifyForStatementArray( statement.contents, [statement.loopVariableName])
					break
				case "if":
				case "while":
					verifyForStatementArray( statement.contents)
					break
				case "functionDefinition":
					verifyForStatementArray( statement.statements, statement.params)
					break
				case "classDefinition":
					for( let method of statement.methods){
						verifyForStatementArray( method.statements, ["self", ...method.params])
					}
					break
				default:
					throw "still need to account for " + JSON.stringify(arrayOfStatements[i])
			}
		}
		scopes.pop()
	}
	
	function verifyForExpression( expression){
		if( expression === undefined){
			throw new InternalCompilerError("Tried to verify an expression that is undefined")
		}
		
		
		switch( expression.op){
			
			case "variable":
				if(!isVarDeclared(expression.contents)){
					throw "Variable " + expression.contents + " not declared!"
				}
				break
			case "functionCall":
				// verifyForExpression( expression.theFunction) TODO support in a bit
				for( let arg of expression.args){
					verifyForExpression( arg)
				}
				break
			case "arrayAccess":
				verifyForExpression( expression.array)
				verifyForExpression( expression.index)
				break
			case "UNARYMINUS":
			case "NOT":
				verifyForExpression( expression.operand)
				break
			case "number":
			case "stringLiteral":
				break
			case "memberAccess":
				// member access
				verifyForExpression( expression.object)
				//NOTE this does not verify that members are declared
				break
			case "PLUS":
			case "MINUS":
			case "ASTERISK":
			case "SLASH":
			case "TESTEQUAL":
			case "TESTGREATERTHAN":
			case "TESTLESSTHAN":
			case "TESTGREATERTHANOREQUALTO":
			case "TESTLESSTHANOREQUALTO":
				verifyForExpression( expression.left)
				verifyForExpression( expression.right)
				break
			case "arrayDeclaration":
				for( let element of expression.elements){
					verifyForExpression( element)
				}
				break
			default:
				throw new InternalCompilerError("Expression OP not supported. Here is the expression: " + JSON.stringify(expression))
		}
		
		
		
		
	}
	
	verifyForStatementArray(ast)
}





export function removeVariableDeclarations( ast){
	// at first, the AST only has Assignements and combined DeclarationAssignments.
	// This desugars the DeclarationAssignments into Declarations and Assignments
	
	doForEachStatementArray(ast, ( arrayOfStatements, scopeIdentifier) => {
		
		for( let i = 0; i < arrayOfStatements.length; i++){
			
			if( arrayOfStatements[i].type == "declaration"){
				
				arrayOfStatements.splice( i, 1)
				i-- // to account for the element being removed
			}
		}
	})
	
}




