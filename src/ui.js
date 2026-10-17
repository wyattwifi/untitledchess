


const theCanvas = document.createElement("canvas")

const margins = {left:0,right:0, top:0,bottom:0}// the area within the canvas outside of the board
const BOARD_SIZE_IN_SQUARES = 8
const SQUARE_SIZE = 80


const MARKET_LOCATION = {x:BOARD_SIZE_IN_SQUARES * SQUARE_SIZE, y:0, width: 200, height: 800}

theCanvas.width = SQUARE_SIZE * BOARD_SIZE_IN_SQUARES + margins.left + margins.right + MARKET_LOCATION.width
theCanvas.height = SQUARE_SIZE * BOARD_SIZE_IN_SQUARES + margins.top + margins.bottom

let drawing = theCanvas.getContext("2d")
window.addEventListener("load",()=>{
	document.body.appendChild( theCanvas)
})


let lastGottenHint
export function uiHint( message){
	console.warn("depricated")
	// For now, it is always an array of possible board states
	lastGottenHint = message
}


// this returns an array of objects of the form {startLocX:int, startLocY: int, endLocX:int, endLocY: int}
function getPossibilities(){
	let result = []
	for( let i = 0; i < lastGottenHint.length; i++){
		result.push({startLocX:lastGottenHint[i].startLoc.x, startLocY: lastGottenHint[i].startLoc.y, endLocX:lastGottenHint[i].endLoc.x, endLocY: lastGottenHint[i].endLoc.y})
	}
	return result
}



export async function uiGetUserChoice( userID, title, explanationOfOptions){
	
	let numOfOptions = explanationOfOptions.length
	lastGottenHint = explanationOfOptions
	
	if( title == "Pick an action"){
		
		whatWaitingFor = "action"
		displayText("Make a move")
		return await waitForInput()
	}
	if( title == "Market"){
		
		whatWaitingFor = "market"
		displayText("Pick something to buy")
		return await waitForInput()
	}
	throw "error UI does not support this yet"
	
	let result = Number(prompt("Player " + userID +": " + title +" Make a choice 0 (inclusive) to " + numOfOptions + "(exclusive):"))
	while( !(result >= 0 && result < numOfOptions) ){
		result = Number(prompt("Try again to follow the instructions. Player " + userID +": Make a choice 0 (inclusive) to " + numOfOptions + "(exclusive):"))
	}
	return result
	
}


let whatWaitingFor = null // possible values: "action", "market", "placeNewPiece"


// let getActionInputResolver = null

let promiseResolver = null
/*
function waitForActionChoiceInput() {
	return new Promise(resolve => {
		getActionInputResolver = resolve
	});
}
*/

function waitForInput() {
	return new Promise(resolve => {
		promiseResolver = resolve
	});
}



let lastGottenState

//TODO update this to the new format
export function uiUpdateState( state){
	lastGottenState = state
	
	
	// console.log(JSON.stringify(state))
	
	// the state object is not the most easily useable format for the sake of being very flexible
	// so, now, go through and generate the 8x8 grid we are used to from the state object
	let grid = []
	for( let i = 0; i < 8; i++){
		grid[i] = []
		for( let j = 0; j < 8; j++){
			grid[i][j] = ""
		}
	}
	
	let gridColors = []
	for( let i = 0; i < 8; i++){
		gridColors[i] = []
		for( let j = 0; j < 8; j++){
			gridColors[i][j] = ""
		}
	}
	
	for( let i = 0; i < state.pieces.length; i++){
		let data = state.pieces[i]
		
		if( data.position.onBoard){
			grid[data.position.x][data.position.y] = data.name
			gridColors[data.position.x][data.position.y] = data.position.color
		}
	}
	
	// console.log(grid)
	// clear the canvas with the classic checkerboard pattern
	for( let i = 0; i < 8; i++){
		for( let j = 0; j < 8; j++){
			if( (i + j) % 2 == 0){
				drawing.fillStyle = "tan"
			} else {
				drawing.fillStyle = "brown"
			}
			drawing.fillRect( i * SQUARE_SIZE + margins.left, j * SQUARE_SIZE + margins.top, SQUARE_SIZE, SQUARE_SIZE)
		}	
	}
	
	// highlight the selected square, if needed
	if( selectedSquare){
		
		drawing.fillStyle = "blue"
		drawing.fillRect( selectedSquare.x * SQUARE_SIZE + margins.left, 7 * SQUARE_SIZE - selectedSquare.y * SQUARE_SIZE + margins.top, SQUARE_SIZE, SQUARE_SIZE)
		
		// draw the icons marking where the piece can move to for all the places you are allowed to move to from here
		
		drawing.fillStyle = "grey"
		
		possibilities = getPossibilities()
		
		for( let i = 0; i < possibilities.length; i++){
			let p = possibilities[i]
			if( p.startLocX == selectedSquare.x && p.startLocY == selectedSquare.y ){
				drawing.fillRect( p.endLocX * SQUARE_SIZE + margins.left + 5, 7 * SQUARE_SIZE - p.endLocY * SQUARE_SIZE + margins.top + 5, SQUARE_SIZE - 10, SQUARE_SIZE - 10)
			}
		}
	}
	
	// draw the pieces
	for( let i = 0; i < 8; i++){
		for( let j = 0; j < 8; j++){
			
			if( gridColors[i][j]){
				drawing.fillStyle = "black"
			} else {
				drawing.fillStyle = "white"
			}
			drawing.fillText(grid[i][j], i * SQUARE_SIZE + margins.left, 7 * SQUARE_SIZE - j * SQUARE_SIZE + 15 + margins.top)
		}	
	}
	
	drawMarket(state)
	
	
}









let selectedSquare = undefined
// let isWhitesTurn = true

let possibilities = undefined

// this is the functino that handles clicks but is given just the square x and y,
function onClickInner( x, y){
	
	
	
	
	
	if(promiseResolver == null){ // if we are not currently looking to get a choice from the player...
		return // in that case do nothing
	}
	
	
	switch (whatWaitingFor){
		case "action":{
			
			
			// Convert pixels into square coordinates.
			let squareX = Math.floor(x / SQUARE_SIZE)
			let squareY = Math.floor(y / SQUARE_SIZE)
			
			// The chess game has y == 0 at the bottom, so flip the y-coordinate.
			squareY = 7 - squareY
			
			// Ignore input outside the board (including the market).
			if(
				squareX < 0 ||
				squareX >= BOARD_SIZE_IN_SQUARES ||
				squareY < 0 ||
				squareY >= BOARD_SIZE_IN_SQUARES
			){
				return
			}
			
			
			// if no square is selected yet, select it if allowed
			// otherwize, if the move from the selected square to this square is allowed, make the move and go on to the next turn
			
			if( selectedSquare){
				// something was selected already
				
				// see if it is a legal move to go from the selected square to the square that was just clicked
				let isAllowed = false
				possibilities = getPossibilities()
				
				for( let i = 0; i < possibilities.length; i++){
					let p = possibilities[i]
					if( p.startLocX == selectedSquare.x && p.startLocY == selectedSquare.y && p.endLocX == squareX && p.endLocY == squareY){
						isAllowed = true
						break
					}
				}
				
				if( isAllowed){
					// it is a legal move
					
					// now that we know the start and end locs of the move, we need to look through the hint that we got most recently to see where it was in the list, so we know what choice number to return to the game engine
					let resultChoiceNumber
					for( let i = 0; i < lastGottenHint.length; i++){
						if(
							selectedSquare.x == lastGottenHint[i].startLoc.x &&
							selectedSquare.y == lastGottenHint[i].startLoc.y &&
							squareX == lastGottenHint[i].endLoc.x &&
							squareY == lastGottenHint[i].endLoc.y
						){
							resultChoiceNumber = i
							break
							//TODO there can be multiple different choices, with different resulting states, all coming from the same start loc and end loc
						}
					}
					
					promiseResolver( resultChoiceNumber)
					promiseResolver = null // we are no longer looking for input
					whatWaitingFor = null
					
					selectedSquare = undefined
					
				} else {
					console.log("not allowed")
				}
				
			} else {
				// is that something that is allowed to be selected?
				
				let isAllowed = false
				possibilities = getPossibilities()
				
				for( let i = 0; i < possibilities.length; i++){
					let p = possibilities[i]
					if( p.startLocX == squareX && p.startLocY == squareY){
						isAllowed = true
						break
					}
				}
				
				
				// console.log(possibilities)
				if( isAllowed){
					selectedSquare = {x:squareX,y:squareY}
					uiUpdateState(lastGottenState)
				} else {
					console.log("not allowed")
				}
			}
			return
		}
		case "market":{
			
			x -= MARKET_LOCATION.x;
			y -= MARKET_LOCATION.y;
			
			if (
				x < 0 ||
				x > MARKET_LOCATION.width ||
				y < 0 ||
				y > MARKET_LOCATION.height
			) {
				return;
			}
			
			let slotNumber = Math.floor( y / MARKET_SLOT_HEIGHT)
			
			let options = getMarketSlotSrings()
			
			if( slotNumber < 0 || slotNumber >= options.length){
				return
			}
			
			
			promiseResolver(slotNumber)
			promiseResolver = null // we are no longer looking for input
			whatWaitingFor = null
			return
		}
		default:{
			throw "err0249"
		}
	}
	
	
}




// this is the direct callback of the onClick event on the canvas. It gets things ready for onClickInner. It converts screen pixel coordinates to game square coorditates

/*
 * Handles mouse clicks, touchscreen taps, and stylus input.
 * Converts screen coordinates into chessboard coordinates.
 */
function onClickOuter(e){
	// Prevent touch gestures such as scrolling while interacting with the board.
	e.preventDefault()
	
	const rect = theCanvas.getBoundingClientRect()
	
	// Convert displayed screen coordinates into canvas pixel coordinates.
	let x = (e.clientX - rect.left) * (theCanvas.width / rect.width)
	let y = (e.clientY - rect.top) * (theCanvas.height / rect.height)
	
	// Account for the margins.
	x -= margins.left
	y -= margins.top
	
	
	onClickInner(x, y)
}

// Pointer Events support touchscreen, mouse, and stylus.
theCanvas.style.touchAction = "none"
theCanvas.addEventListener("pointerdown", onClickOuter)




const MARKET_SLOT_HEIGHT = 20


function getMarketSlotSrings(){
	
	let state = lastGottenState
	
	let result = []
	
	for( let i = 0; i < state.pieces.length; i++){
		let data = state.pieces[i].position
		
		if( data.inMarket){ // it can be 0
			result[data.marketPosition] = state.pieces[i].name + ", cost " + state.pieces[i].cost
		}
	}
	
	result.push("Done")
	
	return result
}

function drawMarket( state){
	
	
	let market = getMarketSlotSrings()
	
	// clear the market
	drawing.fillStyle = "black"
	drawing.fillRect( MARKET_LOCATION.x, MARKET_LOCATION.y, MARKET_LOCATION.width, MARKET_LOCATION.height)
	
	// draw the pieces
	drawing.fillStyle = "white"
	for( let i = 0; i < market.length; i++){
			drawing.fillText(market[i], MARKET_LOCATION.x, MARKET_LOCATION.y + MARKET_SLOT_HEIGHT * i + 20)
	}
	
	
}






function displayText(message){
	document.getElementById("messageDisplayer").innerHTML = message
}

















