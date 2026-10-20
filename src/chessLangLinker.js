



import {getStartingState} from "./getStartingState.js"

// some program written in chessLang
import sampleChesslangCode from "./chessLangCode/main.chessLang?raw"
import piecesChesslangCode from "./chessLangCode/pieces.chessLang?raw"
import utilChesslangCode from "./chessLangCode/util.chessLang?raw"

export function getStringOfAllChesslangCodeCombined(){
	
	// there is a lot of ChessLang code found in various different places. This combines them all together into one big string
	// there are the various files within the chessLangCode directory, and then there is also the piece actions, costs, and effects that are found in the raw piece data
	
	
	
	let actionFunctionsString = ""
	let purchaseCostFunctionStrings = ""
	let state = getStartingState() // this should be a pure function, so it is okay to call it elsewhere too

	for( let i = 0; i < state.pieces.length; i++){
		// we need to add one level of indentation to each action string
		let originalString = state.pieces[i].actionString
		let lines = originalString.split("\n")
		lines = lines.map( l => "\t" + l )
		let newString = lines.join("\n")
		
		actionFunctionsString = actionFunctionsString + "def doActionOfPieceWithID" + i + "( userID, myPieceID ):\n" + newString + "\n"
		
		
		// we need to add one level of indentation to each action string
		let originalCostString = state.pieces[i].purchaseCostString
		lines = originalCostString.split("\n")
		lines = lines.map( l => "\t" + l )
		let newCostString = lines.join("\n")
		
		purchaseCostFunctionStrings = purchaseCostFunctionStrings + "def doPurchaseCostOfPieceWithID" + i + "( playerID, myPieceID ):\n" + newCostString + "\n"
	}

	let totalChessCodeString = sampleChesslangCode + "\n" + actionFunctionsString + "\n" + purchaseCostFunctionStrings + "\n" + piecesChesslangCode + "\n" + utilChesslangCode
	
	return totalChessCodeString
}


