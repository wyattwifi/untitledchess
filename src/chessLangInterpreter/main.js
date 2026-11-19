

import {lexer} from "./lexer.js"
import {parse} from "./parseChessLang.js"
import {astToBytecode} from "./astToBytecode.js"
import {interpretChessLang} from "./interpreter.js"
import {desugarAST} from "./desugaring/desugar-main.js"
import {rearrangeFunctions} from "./desugaring/desugar-functions.js"
import {verifyAST, removeVariableDeclarations, verifyAllVarsDeclared} from "./verifyAST.js"
import {inferTypes} from "./type-stuff.js"
import {checkTypes} from "./type-checker.js"
import {pruneAST} from "./pruneAST.js"

// returns the array of the bytecode
export function compileChessCode( sourceCodeString){
	
	
	sourceCodeString = simpleTestCode // temporary, for dev
	
	// let tokens = lexer(sampleChesslangCode)
	let tokens = lexer(sourceCodeString)
	// console.log( tokens)
	let ast = parse(tokens)
	ast = desugarAST( ast)
	// console.log( JSON.stringify(ast))
	
	// console.log(JSON.stringify(ast))
	// verifyAllVarsDeclared(ast)
	
	// pruneAST(ast)
	
	//TODO make sure all vars declared before doing type stuff
	inferTypes(ast)
	// console.log(safeStringify(ast))
	// checkTypes(ast)
	
	rearrangeFunctions(ast)
	
	console.log(structuredClone(ast))
	
	// console.log(JSON.stringify(ast))
	
	//WARNING verifyAST takes out all the variable declarations, needed for type stuff
	removeVariableDeclarations(ast)
	
	
	
	
	let bytecode = astToBytecode(ast)
	// console.log(JSON.stringify(bytecode))
	return bytecode
}


export function runChessCode( bytecode){
	interpretChessLang(bytecode)
}

let exampleClass = `
class Dog inherits Animal,Trustable:
	let weight = 100 #default initialization
	let name
	private let ssn
	static let isLiked = True #classwide property
	def init( name):
		self.name = name
	def bark():
		print(self.name + " says bark")
	private def leakSSN():
		print(self.ssn)
	static def becomeWolves():
		static.isLiked = False
		
`

let simpleTestCode = `

class Dog:
	let weight = 100 #default initialization
	let ssn = 123451234
	def init():
		self.weight = 200
	


def main2():
	
	let fido = Dog()
	print(fido.weight)
	

main2()

`



let simpleTestCodeOld = `

class Dog:
let weight = 100 #default initialization
let ssn = 123451234


let hohoho = 37

def test():
#for i in range(10):
#print(i)

let i = 0
let theArray = range(10) #[0,1,2,3,4,5,6,7,8,9]
while i < 10:
	let thing = theArray[i]
	print(thing)
	i = i + 1
	
	
	
	def main2():
	print(factorial(5))
	test()
	
	let c = [1,2,3]
	c[2] = 411
	print(c[2])
	
	def abc():
	#print("im imbedded")
	print( hohoho + 3)
	
	abc()
	
	print(hohoho)
	
	main2()
	
	def factorial(a):
	
	
	
	let j = "hohoho"
	let k = j
	
	
	if a == 1:
		return a * factorial(a - 1)
		if !(a == 1):
			return 1
			`


