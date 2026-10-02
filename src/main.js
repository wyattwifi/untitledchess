

import { compileChessCode, runChessCode} from "./chessLang/main.js"



// some program written in chessLang
import sampleChesslangCode from "./main.chessLang?raw"



runChessCode(compileChessCode(sampleChesslangCode))

// have the state be a list of piece datas (and other info, like whose turn it is) where each piece data is the name, current location, etc