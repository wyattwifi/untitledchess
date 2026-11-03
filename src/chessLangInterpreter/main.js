

import {lexer} from "./lexer.js"
import {parse} from "./parseChessLang.js"
import {astToBytecode} from "./astToBytecode.js"
import {interpretChessLang} from "./interpreter.js"
import {desugarAST} from "./desugarAST.js"
import {verifyAST, removeVariableDeclarations, verifyAllVarsDeclared} from "./verifyAST.js"
import {inferTypes} from "./type-stuff.js"
import {pruneAST} from "./pruneAST.js"

// returns the array of the bytecode
export function compileChessCode( sourceCodeString){
	
	
	sourceCodeString = simpleTestCode // temporary, for dev
	
	// let tokens = lexer(sampleChesslangCode)
	let tokens = lexer(sourceCodeString)
	// console.log( tokens)
	let ast = parse(tokens)
	// console.log( JSON.stringify(ast))
	ast = desugarAST( ast)
	
	verifyAllVarsDeclared(ast)
	
	// pruneAST(ast)
	
	//TODO make sure all vars declared before doing type stuff
	inferTypes(ast)
	
	console.log(JSON.stringify(ast))
	
	//WARNING verifyAST takes out all the variable declarations, needed for type stuff
	removeVariableDeclarations(ast)
	
	
	
	
	let bytecode = astToBytecode(ast)
	// console.log(JSON.stringify(bytecode))
	return bytecode
}


export function runChessCode( bytecode){
	interpretChessLang(bytecode)
}



// made by AI and not yet tested
let testCode = `
functiondef empty():

functiondef add(a, b):
	let result = a + b
	return result

functiondef calculate(a, b, c):
	let x = 10
	let y = -20
	let z = x + y

	z = z + a
	z = z - b
	z = z + c

	return z

functiondef firstElement(items):
	return items[0]

functiondef sum(items):
	let result = 0

	for item in items:
	result = result + item

	return result

functiondef doubleAll(items):
	let result = 0

	for item in items:
	let doubled = item + item
	result = result + doubled

	return result

functiondef testIf(value):
	let result = 0

	if value:
		result = value + 1

	return result

functiondef testNested(items):
	let result = 0

	for item in items:
		if item:
			let x = item + 1
			result = result + x

	return result

functiondef testCalls(a, b):
	let x = add(a, b)
	let y = add(x, 10)
	let z = add(add(1, 2), add(3, 4))

	return z

functiondef testArrays(items):
	let a = items[0]
	let b = items[1]
	let c = items[2]

	let result = a + b
	result = result + c

	return result

functiondef main():
	let numbers = range(10)
	let numbers2 = range(1, 5)

	let a = add(10, 20)
	let b = calculate(1, 2, 3)
	let c = firstElement(numbers)
	let d = sum(numbers)
	let e = doubleAll(numbers)
	let f = testIf(10)
	let g = testNested(numbers)
	let h = testCalls(a, b)
	let i = testArrays(numbers2)

	print(a)
	print(b)
	print(c)
	print(d)
	print(e)
	print(f)
	print(g)
	print(h)
	print(i)

	print("hello")

	return i
`

let simpleTestCode = `

let hohoho = 37

def test():
	for i in range(10):
		#print(i)


def main():
	#print(factorial(5))
	test()
	
	let c = [1,2,3]
	#c[2] = 4
	print(c[2])
	
	print(hohoho)

def factorial(a):
	
	
	
	let j = "hohoho"
	let k = j
	
	
	if a:
		return a * factorial(a - 1)
	if !a:
		return 1
`





