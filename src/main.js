

import { compileChessCode, runChessCode} from "./chessLangInterpreter/main.js"


import {getStringOfAllChesslangCodeCombined} from "./chessLangLinker.js"

let totalChessCodeString = getStringOfAllChesslangCodeCombined()


runChessCode(compileChessCode(totalChessCodeString))

// have the state be a list of piece datas (and other info, like whose turn it is) where each piece data is the name, current location, etc