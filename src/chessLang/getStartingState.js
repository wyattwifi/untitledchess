



export function getStartingState(){
	return {
		pieces:[
			{name:"whiteKing", position:{onBoard:1, color:0, x:4, y:4}},
			{name:"blackKing", position:{onBoard:1, color:1, x:0, y:7}},
			{name:"Wazir", position:{onBoard:0, color:1, x:2, y:7}},
			{name:"knight", position:{onBoard:1, color:0, x:3, y:7}},
		],
		isItWhitesTurn:true,
	}
}

//STUFF ORIGINALLY FROM GETSTARTINGSTATE.JS

/*

This commented-out section is from when I was trying to do it with JS and is now obsolete but might be handy for something still

//NOTE this function is NOT deterministic, it uses randomness to shuffle the cards
function getStartingState(){
	
	
	
	// INITIALIZE STATE
	let state = {
		piecePositions:[],
		tokens:[],
		whiteTurn:true,
		coinPositions:[],
	}
	
	
	
	
	function deepCopy( obj){
		return JSON.parse(JSON.stringify(obj))
	}
	
	
	// now, the 2 kings start on the board an all the rest of the cards start in the deck. 0 will be the bottom card of the deck. The last 8 cards in the deck will still be counted as in the deck but will actually be part of the market. TODO The code needs updated to reflect these things
	
	
	
	function shuffle(array) {
		let currentIndex = array.length;

		// While there remain elements to shuffle...
		while (currentIndex != 0) {

			// Pick a remaining element...
			let randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
		}
	}


	//TODO take out king from stack properly
	
	let piecesBesideKings = RAW_PIECE_DATA.filter( e => e.name != "White King" && e.name != "Black King")
	
	let positions = []
	for( let i = 0; i < piecesBesideKings.length; i++){
		positions[i] = i
	}
	
	shuffle( positions)
	

	const MARKET_SIZE = 2
	for( let i = 0; i < piecesBesideKings.length; i++){
		let position = positions[i]
		// the [i + 2] is because the kings are at the first
		if( position >= piecesBesideKings.length - MARKET_SIZE){//TODO see if i did the math right
			state.piecePositions[i + 2] = JSON.stringify({marketPosition:position - (piecesBesideKings.length - MARKET_SIZE)})
		} else {
			state.piecePositions[i + 2] = JSON.stringify({stackPosition:position})
		}
		
	}
	
	// now all the other pieces are taken care of, take care of the kings
	state.piecePositions[0] = JSON.stringify({onBoard:true, x:0, y:0, color:"white"})
	state.piecePositions[1] = JSON.stringify({onBoard:true, x:0, y:7, color:"black"})
	
	
	return state

}

*/




//STUFF ORIGINALLY FROM INDEX.HTML

/*
const CONGLOMERATE_STARTING_STATE = `

MISC_GETS_PUT_HERE
UTILS_GETS_PUT_HERE
PIECE_DATA_GETS_PUT_HERE


`

// takes state
// returns state or a string of the ending result of the game
function overarchingConstantFunctionNewTest( state){
	
	{
		
		STATE_STUFFbreak_GETS_PUT_HERE
		MISC_GETS_breakPUT_HERE
		UTILS_GETS_PUTbreak_HERE
		PIECE_DATA_GETS_PUTbreak_HERE
		
		for( let i = 0; i < RAW_PIECE_DATA.length; i++){
			RAW_PIECE_DATA[i].effect
		}
		
		let possibilities = []
		for( let i = 0; i < state.piecePositions.length; i++){
			if( isPieceOnBoard(i, state)){
				console.log()
				let loc = pieceIDToLoc( i, state)
				possibilities.push( ...eval("(function(){return RAW_PIECE_DATA[i].action})()"))
			}
		}
		console.log(possibilities)
		
		
		}
		
	}
	
	let codeToRun ="{" + CONGLOMERATE_STARTING_STATE + ";"
	
	codeToRun += "let state = " + JSON.stringify(state) + ";"
	
	
	codeToRun += `
	for( let i = 0; i < RAW_PIECE_DATA.length; i++){
		eval(RAW_PIECE_DATA[i].effect)
	}
	
	let possibilities = []
	for( let i = 0; i < state.piecePositions.length; i++){
		if( isPieceOnBoard(i, state)){
			console.log()
			let loc = pieceIDToLoc( i, state)
			possibilities.push( ...eval("(function(){return RAW_PIECE_DATA[i].action})()"))
// 			console.log( eval("(function(){return "+RAW_PIECE_DATA[i].action + "})()"))
		}
	}
	console.log(possibilities)
	
	
	}
	`
	
// 	new Function(codeToRun)()
	console.log(eval(codeToRun))
	
	
	if(Math.random() < 1/6){
		return "Stalemate"
	}
	
	return state
	
}


// takes state
// returns all the possible states, but a bit more too. It returns an array of {state,startLocX,startLocY, endLocX, endLocY}. The start and end locs are so the UI can know where the person clicks to make that happen
function overarchingConstantFunction( state){
	
	
	let codeToRun ="(function(){" + CONGLOMERATE_STARTING_STATE + ";"
	
	codeToRun += "let state = " + JSON.stringify(state) + ";"
	
	
	codeToRun += `
	let scope = getDefaultScope()
	
	scope = applyEffects(scope)
	
	
	let possibilities = []
	for( let i = 0; i < state.piecePositions.length; i++){
		if( scope.isPieceOnBoard( scope, state, i)){
			
			let loc = scope.pieceIDToLoc( scope, state, i)
			possibilities.push( ...eval(RAW_PIECE_DATA[i].action))
			
		}
	}
	
	return possibilities
	})()
	`
	
	possibilities = eval(codeToRun)
	
	
	
	return possibilities
	
}


// MAIN THING

let state = getStartingState()
/*

while(true){
	let possibilities = overarchingConstantFunction(state)
	let result = possibilities[0].state
	if( result.piecePositions ){ // check if it returned a state
		state = result
		printState( state)
	} else {
		printResult( result)
		break
	}
}* /

let getPossibilities = overarchingConstantFunction

function printState( state){
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
	console.log(grid)
}

function printResult( state){
	console.log(state)
}
*/




//ORIGINAL CONTENTS OF UTILS.JS
/*
function deepCopy( obj){
	return JSON.parse(JSON.stringify(obj))
}*/



//ORIGINAL CONTENTS OF MISC.JS
/*
let externalScope = {
	getUserChoice(playerNum,range),
	uiHint(string)
}

This stuff is from the JS version instead of the chesslang version, so I think it is obsolete but I am keeping it as reference for now


// pass the scope to everything since it could be overwritten in a way that uses the scope
// when the perameter comes to you, copy it if you will change it at all

		// scope = deepCopy(scope)
		// state = deepCopy(state)
function getDefaultScope(){
	
	return {
		getTheFourPerpendicularDirs: function(scope, state){
			return [DIRECTIONS.NORTH, DIRECTIONS.SOUTH, DIRECTIONS.EAST, DIRECTIONS.WEST]
		},
		dirToOffset:function( scope, state, dir){
			const offsets = {
				[DIRECTIONS.NORTH]:      { x: 0,  y: 1 },
				[DIRECTIONS.SOUTH]:      { x: 0,  y: -1 },
				[DIRECTIONS.EAST]:       { x: 1,  y: 0 },
				[DIRECTIONS.WEST]:       { x: -1, y: 0 },
				[DIRECTIONS.NORTH_EAST]: { x: 1,  y: 1 },
				[DIRECTIONS.NORTH_WEST]: { x: -1, y: 1 },
				[DIRECTIONS.SOUTH_EAST]: { x: 1,  y: -1 },
				[DIRECTIONS.SOUTH_WEST]: { x: -1, y: -1 },
			};

			return offsets[dir] ?? { x: 0, y: 0 };
		},

		getLocInDir:function( scope, state, direction, startLoc ){
			
			
			direction = deepCopy(direction)
			

			let offset = scope.dirToOffset( scope, state, direction)

			let newLoc = {
				x: startLoc.x + offset.x,
				y: startLoc.y + offset.y,
			}

			return newLoc

		},

		isLocOutOfBounds:function( scope, state, loc){
			if( loc.x < 0){ return true}
			if( loc.x >= 8){ return true}
			if( loc.y < 0){ return true}
			if( loc.y >= 8){ return true}
			return false
		},



		//TODO take care of state copies being deep copies everywhere

		getOppositeColor:function( scope, state, color){
			if( color == "white"){ return "black"}
			if( color == "black"){ return "white"}
			throw "err"
		},

		// in other words, do they both exist and are in opposite colors
		arePiecesOpposing:function( scope, state, loc1, loc2){
			if( scope.isLocEmpty( scope, state, loc1) || scope.isLocEmpty( scope, state, loc2)){ return false}
			if( scope.getLocColor( scope, state, loc1) == scope.getLocColor( scope, state, loc2)){ return false}
			return true
		},

		
		
		// this takes the starting state, the starting loc, and the direction and returns the new state
		move1InDir:function( scope, state, direction, startLoc, canCaptureAtAll){

			let newLoc = scope.getLocInDir( scope, state, direction, startLoc)

			state = deepCopy(state)
			let didCapture = false

			if( scope.isLocEmpty( scope, state, newLoc)){
				state = scope.teleportPiece( scope, state, startLoc, endLoc)
			} else {
				if( scope.canCapture( scope, state, capturerLoc, captureeLoc) && canCaptureAtAll){
					scope.capturePiece( scope, state, newLoc)
					didCapture = true
					state = scope.teleportPiece( scope, state, startLoc, endLoc)
				} else {
					throw "this should not be reachable"
				}
			}


			return {
				captured: didCapture,
				newState: state,
			}

		},


		canMove1InDir:function( scope, state, direction, startLoc, canCaptureAtAll){

			let newLoc = scope.getLocInDir( scope, state, direction, startLoc)

			return scope.isLocEmpty( scope, state, newLoc) || (scope.canCapture( scope, state, startLoc, newLoc) && canCaptureAtAll)
		},

		locEqual:function( scope, state, loc1, loc2){
			return loc1.x == loc2.x && loc1.y == loc2.y
		},

		// returns all the possible states, but a bit more too. It returns an array of {state,startLocX,startLocY, endLocX, endLocY}. The start and end locs are so the UI can know where the person clicks to make that happen
		leaperMove:function( scope, state, startLoc, firstAmount, secondAmount){

			// for now have  canJump, canCapture, both be true

			// eg a knight is 2,1
			//2,1 and 1,2 have the same effect, normally TODO have them be the same even with effects
			

			// the first one goes in any of the 4 orth directions, and the second one goes either of the 2 directions perpendicular to that, for 8 total possibilities

			let results = []

			for( const dir1 of scope.getTheFourPerpendicularDirs( scope, state)){
				for( const dir2 of scope.getPerpendicularDirs( scope, state, dir1)){

					let myState = deepCopy(state)


					let locsInPath = []
					let loc = startLoc

					for( let i = 0; i < firstAmount; i++){
						loc = scope.getLocInDir( scope, myState, dir1, loc)

						locsInPath.push( loc)
					}
					for( let i = 0; i < secondAmount; i++){
						loc = scope.getLocInDir( scope, myState, dir2, loc)
						locsInPath.push( loc)
					}

					let endLoc = locsInPath[locsInPath.length - 1]



					let blocked = false

					for( let loc of locsInPath ){

						if( scope.isLocOutOfBounds( scope, state, loc)){ blocked = true}

						if( scope.locEqual( scope, state, endLoc, loc)){ continue}
						if( !scope.isLocEmpty( scope, state, loc)){ blocked = true}
					}


					// to make it be able to pass through pieces like knight, set blocked to false right here (before checking against attacking friends), except dont because it currently does off the board check too



					if( !scope.isLocEmpty( scope, state, endLoc) && !scope.arePiecesOpposing( scope, state, startLoc, endLoc)){ // it cannot capture its friend, that piece then counts as blocking
						blocked = true
					}



					if( !blocked){
						let newState = deepCopy(state)
						if( !scope.isLocEmpty( scope, state, endLoc)){
							newState = scope.capturePiece( scope, newState, endLoc)
						}
						newState = scope.teleportPiece( scope, newState, startLoc, endLoc)

						results.push({state:newState, startLocX: startLoc.x, startLocY: startLoc.y, endLocX: endLoc.x, endLocY: endLoc.y })
					}




				}
			}



			return results
		},
		getPerpendicularDirs: function( scope, state, dir) {
		
			switch (dir) {
				case DIRECTIONS.NORTH:
				case DIRECTIONS.SOUTH:
					return [DIRECTIONS.EAST, DIRECTIONS.WEST];

				case DIRECTIONS.EAST:
				case DIRECTIONS.WEST:
					return [DIRECTIONS.NORTH, DIRECTIONS.SOUTH];

				case DIRECTIONS.NORTH_EAST:
				case DIRECTIONS.SOUTH_WEST:
					return [DIRECTIONS.NORTH_WEST, DIRECTIONS.SOUTH_EAST];

				case DIRECTIONS.NORTH_WEST:
				case DIRECTIONS.SOUTH_EAST:
					return [DIRECTIONS.NORTH_EAST, DIRECTIONS.SOUTH_WEST];

				default:
					throw new Error("Invalid direction: " + dir);
			}
		},
		
		isLocEmpty:function( scope, state, loc){
			
			for( let i = 0; i < state.piecePositions.length; i++){
				let data = JSON.parse( state.piecePositions[i])
				if( data.onBoard && data.x == loc.x && data.y == loc.y){
					return false
				}
			}
			return true
		},
		
		


		locToPieceID: function( scope, state, loc){
			
			for( let i = 0; i < state.piecePositions.length; i++){
				let data = JSON.parse( state.piecePositions[i])
				if( data.onBoard && data.x == loc.x && data.y == loc.y){
					return i
				}
			}
			throw "shouldnt reach here"
		},


		getLocColor: function( scope, state, loc){
			
			for( let i = 0; i < state.piecePositions.length; i++){
				let data = JSON.parse( state.piecePositions[i])
				if( data.onBoard && data.x == loc.x && data.y == loc.y){
					return data.color
				}
			}
		},



		capturePiece: function( scope, state, loc){
			
			state = deepCopy(state)
			
			let pieceID = scope.locToPieceID( scope, state, loc)
			
			state.piecePositions[pieceID] = JSON.stringify({inPrison: scope.getOppositeColor( scope, state, scope.getLocColor( scope, state, loc))})
			
			return state
		},


		isPieceOnBoard: function( scope, state, pieceID){
			
			return JSON.parse(state.piecePositions[pieceID]).onBoard == true
		},


		pieceIDToLoc: function( scope, state, pieceID){
			return {
				x: JSON.parse(state.piecePositions[pieceID]).x,
				y: JSON.parse(state.piecePositions[pieceID]).y,
			}
		},


		// isLocEmpty used to be part of state stuff

		// returns the new state
		// assumes the old space is empty
		teleportPiece: function( scope, state, startLoc, endLoc){
			
			let id = scope.locToPieceID( scope, state, startLoc)
			
			state = deepCopy(state)
			
			state.piecePositions[id] = JSON.stringify({
				onBoard:true,
				x:endLoc.x,
				y:endLoc.y,
				color: JSON.parse(state.piecePositions[id]).color,
			})
			return state
		},

	}

}


/*

	here is an example of a state object

	let state = {
		piecePositions:[],
		tokens:[],
		whiteTurn:true,
		coinPositions:[]
	}* /

	// piecePositions possibilities:
	//onBoard:true,x:5,y:5,color:"white"



// coordinates start at 0,0 in the bottom left corner of the board

const DIRECTIONS = {
  NORTH_WEST: "northwest",
  NORTH: "north",
  NORTH_EAST: "northeast",
  WEST: "west",
  EAST: "east",
  SOUTH_WEST: "southwest",
  SOUTH: "south",
  SOUTH_EAST: "southeast"
}



class Loc{
	constructor(x,y){
		this.x = x
		this.y = y
	}
}


// returns the scope with all effects applied
function applyEffects( defaultScope){
	//TODO actually do it
	for( let i = 0; i < RAW_PIECE_DATA.length; i++){
		eval(RAW_PIECE_DATA[i].effect)
	}
}

*/







