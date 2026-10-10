

import { compileChessCode, runChessCode} from "./chessLang/main.js"


import {getStartingState} from "./chessLang/getStartingState.js"

// some program written in chessLang
import sampleChesslangCode from "./main.chessLang?raw"


let actionFunctionsString = ""
let state = getStartingState() // this should be a pure function, so it is okay to call it elsewhere too

for( let i = 0; i < state.pieces.length; i++){
	// we need to add one level of indentation to each action string
	let originalString = state.pieces[i].actionString
	let lines = originalString.split("\n")
	lines = lines.map( l => "\t" + l )
	let newString = lines.join("\n")
	
	actionFunctionsString = actionFunctionsString + "def doActionOfPieceWithID" + i + "( userID, myPieceID ):\n" + newString + "\n"
}

let totalChessCodeString = sampleChesslangCode + "\n" + actionFunctionsString


runChessCode(compileChessCode(totalChessCodeString))

// have the state be a list of piece datas (and other info, like whose turn it is) where each piece data is the name, current location, etc