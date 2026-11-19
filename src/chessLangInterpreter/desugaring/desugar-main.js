


import {
	putMethodsAndPropertiesInProperPlace,
	desugarStaticMembers,
	giveClassesIDs,
	handleObjectConstructors,
} from "./desugar-classes.js"

import {
	desugarFunctionsIntoVariables,
	pointVariablesToSymbols,
} from "./desugar-misc.js"

import {
	desugarDeclarationAssignments,
	desugarForLoops,
} from "./desugar-general-statements.js"



export function desugarAST( ast){
	putMethodsAndPropertiesInProperPlace(ast)
	
	// Extract static members while class metadata is still available.
	desugarStaticMembers(ast)
	giveClassesIDs(ast)
	handleObjectConstructors(ast)
	
	desugarFunctionsIntoVariables(ast)
	desugarForLoops(ast) // we need to do this before desugaring declarationAssignments because this adds new declarationAssignments
	desugarDeclarationAssignments(ast)
	pointVariablesToSymbols(ast)
	return ast
}







