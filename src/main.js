

import { compileChessCode, runChessCode} from "./chessLang/main.js"


import {getStartingState} from "./chessLang/getStartingState.js"

// some program written in chessLang
import sampleChesslangCode from "./main.chessLang?raw"
/*
let stringsOfChessPieceActionsContents = [
	"doLeaperMove( userID,myPieceID,1,0)",
	"doLeaperMove( userID,myPieceID,1,0)",
	"doLeaperMove( userID,myPieceID,1,0)",
	"doLeaperMove( userID,myPieceID,1,0)",
	"doLeaperMove( userID,myPieceID,1,0)",
]*/
let actionFunctionsString = ""
let state = getStartingState() // this should be a pure function, so it is okay to call it elsewhere too
for( let i = 0; i < state.pieces.length; i++){
	actionFunctionsString = actionFunctionsString + "def doActionOfPieceWithID" + i + "( userID, myPieceID ):\n\t" + state.pieces[i].actionString + "\n"
}

let totalChessCodeString = sampleChesslangCode + "\n" + actionFunctionsString


runChessCode(compileChessCode(totalChessCodeString))

// have the state be a list of piece datas (and other info, like whose turn it is) where each piece data is the name, current location, etc