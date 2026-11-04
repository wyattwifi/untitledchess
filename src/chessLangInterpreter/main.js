

import {lexer} from "./lexer.js"
import {parse} from "./parseChessLang.js"
import {astToBytecode} from "./astToBytecode.js"
import {interpretChessLang} from "./interpreter.js"
import {desugarAST, rearrangeFunctions} from "./desugarAST.js"
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
	console.log( JSON.stringify(ast))
	ast = desugarAST( ast)
	
	// console.log(JSON.stringify(ast))
	verifyAllVarsDeclared(ast)
	
	// pruneAST(ast)
	
	//TODO make sure all vars declared before doing type stuff
	// inferTypes(ast)
	rearrangeFunctions(ast)
	
	
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





#TODO declarations without defaults not allowed yet
class Dog inherits Animal,Trustable:
	let weight = 100 #default initialization
	let name = "fido"
	private let ssn = 123456
	static let isLiked = True #classwide property
	def init( name):
		selfname = name
	def bark():
		print(selfname)
	private def leakSSN():
		print(selfssn)
	static def becomeWolves():
		staticisLiked = False


let hohoho = 37

def test():
	for i in range(10):
		#print(i)


def main2():
	#print(factorial(5))
	test()
	
	let c = [1,2,3]
	#c[2] = 4
	print(c[2])
	
	def abc():
		print("im imbedded")
		print( hohoho + 3)
	
	abc()
	
	print(hohoho)

main2()

def factorial(a):
	
	
	
	let j = "hohoho"
	let k = j
	
	
	if a:
		return a * factorial(a - 1)
	if !a:
		return 1
`





