"use strict";




/*
It is possible that a lot of this code is still usable, but I commented it all out while switching from js to chesslang




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
	drawBoard(state)
})

let selectedSquare = undefined
// let isWhitesTurn = true

let possibilities = undefined

// this is the functino that handles clicks but is given just the square x and y,
function onClickInner( squareX, squareY){
	
	// if no square is selected yet, select it if allowed
	// otherwize, if the move from the selected square to this square is allowed, make the move and go on to the next turn
	
	if( selectedSquare){
		// something was selected already
		
		// see if it is a legal move to go from the selected square to the square that was just clicked
		let isAllowed = false
		possibilities = getPossibilities(state)
		let theNewState = undefined
		
		for( let i = 0; i < possibilities.length; i++){
			let p = possibilities[i]
			if( p.startLocX == selectedSquare.x && p.startLocY == selectedSquare.y && p.endLocX == squareX && p.endLocY == squareY){
				isAllowed = true
				theNewState = p.state
				break
			}
		}
		
		if( isAllowed){
			// it is a legal move
			selectedSquare = undefined
			state = theNewState
			drawBoard(state)
		} else {
			console.log("not allowed")
		}
		
	} else {
		// is that something that is allowed to be selected?
		
		let isAllowed = false
		possibilities = getPossibilities(state)
		
		for( let i = 0; i < possibilities.length; i++){
			let p = possibilities[i]
			if( p.startLocX == squareX && p.startLocY == squareY){ //TODO make sure it is the color of the current player
				isAllowed = true
				break
			}
		}
		
		
		// console.log(possibilities)
		if( isAllowed){
			selectedSquare = {x:squareX,y:squareY}
			drawBoard(state)
		} else {
			console.log("not allowed")
		}
	}
	
	
}

// this is the direct callback of the onClick event on the canvas. It gets things ready for onClickInner. It converts screen pixel coordinates to game square coorditates
function onClickOuter( e){
	
	const rect = theCanvas.getBoundingClientRect();
	let x = event.clientX - rect.left;
	let y = event.clientY - rect.top;
	
	//account for the margin
	x -= margins.left
	y -= margins.top
	
	// change the scale, take off the fraction part and make it an int at the same time
	x = Math.floor(x / SQUARE_SIZE)
	y = Math.floor(y / SQUARE_SIZE)
	
	
	// throw away out of bound clicks
	if( x < 0 || x >= BOARD_SIZE_IN_SQUARES || y < 0 || y >= BOARD_SIZE_IN_SQUARES){
		return
	}
	
	// now, finally, call the function that this wraps
	onClickInner( x, y)
	
}
theCanvas.addEventListener( "click", onClickOuter)


function drawBoard( state){
	
	// the state object is not the most easily useable format for the sake of being very flexible
	// so, now, go through and generate the 8x8 grid we are used to from the state object
	let grid = []
	for( let i = 0; i < 8; i++){
		grid[i] = []
		for( let j = 0; j < 8; j++){
			grid[i][j] = ""
		}	
	}
	
	for( let i = 0; i < state.piecePositions.length; i++){
		let data = JSON.parse(state.piecePositions[i])
		
		if( data.onBoard){
			grid[data.x][data.y] = RAW_PIECE_DATA[i].name
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
		drawing.fillRect( selectedSquare.x * SQUARE_SIZE + margins.left, selectedSquare.y * SQUARE_SIZE + margins.top, SQUARE_SIZE, SQUARE_SIZE)
		
		// draw the icons marking where the piece can move to for all the places you are allowed to move to from here
		
		drawing.fillStyle = "grey"
		
		possibilities = getPossibilities(state)
		
		for( let i = 0; i < possibilities.length; i++){
			let p = possibilities[i]
			if( p.startLocX == selectedSquare.x && p.startLocY == selectedSquare.y ){
				drawing.fillRect( p.endLocX * SQUARE_SIZE + margins.left + 5, p.endLocY * SQUARE_SIZE + margins.top + 5, SQUARE_SIZE - 10, SQUARE_SIZE - 10)
			}
		}
	}
	
	// draw the pieces
	drawing.fillStyle = "white"
	for( let i = 0; i < 8; i++){
		for( let j = 0; j < 8; j++){
			drawing.fillText(grid[i][j], i * SQUARE_SIZE + margins.left, j * SQUARE_SIZE + 15 + margins.top)
		}	
	}
	drawMarket(state)
	
}




function drawMarket( state){
	
	let market = []
	
	for( let i = 0; i < state.piecePositions.length; i++){
		let data = JSON.parse(state.piecePositions[i])
		
		if( data.marketPosition !== undefined){ // it can be 0
			market[data.marketPosition] = RAW_PIECE_DATA[i]
		}
	}
	
	// clear the market
	drawing.fillStyle = "black"
	drawing.fillRect( MARKET_LOCATION.x, MARKET_LOCATION.y, MARKET_LOCATION.width, MARKET_LOCATION.height)
	
	// draw the pieces
	drawing.fillStyle = "white"
	for( let i = 0; i < market.length; i++){
			drawing.fillText(market[i].name + market[i].cost, MARKET_LOCATION.x, MARKET_LOCATION.y + 20 * i + 20)
	}
	
}

*/

