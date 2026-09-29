

import { compileChessCode, runChessCode} from "./chessLang/main.js"



// some program written in chessLang
let sampleChesslangCode = `
def getUserChoiceOfArray( arrayIn, playerID):
return arrayIn[getUserChoice( playerID, arrayIn["length"])]



def canPieceMoveThroughLocation( piece, location):


def getForwardDirection( piece):
#this returns the direction that is forward for a piece. This varies piece-to-piece because the different colors head in opposite directions

def jumpForwardOne( piece):
# this is a very simple piece that just jumps forward one space, capturing if able

let location = getPieceLocation( piece)
let newLocation = getLocationInDirectionFromLocation( location, getForwardDirection(piece))
let canMove = canPieceMoveToLocation(newLocation)
if canMove:
	movePiece( piece, newLocation)
	
	if !canMove:
		throwError()
		
		
		
		#TODO this function is incomplete
		# this assumes that the piece is on the board
def doLeaperMove( theMovingPiece, firstAmount, secondAmount):

let firstDirection = getUserChoiceOfArray(getTheFourPerpendicularDirections())
let secondDirection = getUserChoiceOfArray(getThePerpendicularDirections( firstDirection))
# walk along the path, making sure that each space is either empty, itself (because when it moves in it will also move out), or (on the last space only) a capturable enemy piece

for unused in range(firstAmount):
	let location = getPieceLocation( theMovingPiece)
	let newLocation = getLocationInDirectionFromLocation( location, firstDirection)
	if !isLocationEmpty( newLocation):#TODO what if it is being blocked by itself
		throwError()
		
		movePiece( theMovingPiece, newLocation)
		firstAmount = firstAmount - 1
		
		for unused in range(secondAmount):
			let location = getPieceLocation( theMovingPiece)
			let newLocation = getLocationInDirectionFromLocation( location, secondDirection)
			if !isLocationEmpty( newLocation):#TODO what if it is being blocked by itself
				# a piece is there. The only way this can move there is if that piece is itself, or if 
				throwError()
				
				movePiece( theMovingPiece, newLocation)
				firstAmount = firstAmount - 1
				
				
				
				
				
def doTurn():
	simulateAllChoicesUpToTurnBoundary() # returns a tree. Each node can be a user choice that has one child node for each choice, a state node that may
	uiUpdateState() # takes the current state variable and prints it to the console
	#TODO there is not a thing stopping it, it just infitite loops currently
	doTurn()


def main():
	doTurn()

`

runChessCode(compileChessCode(sampleChesslangCode))

