



// this file, unlike what the title says, takes an AST of chessLang and turns it into chessLang bytecode.
// I am doing bytecode instead of just interepreting the AST because I need to do the stack and instruction pointer myself to easily handle duplicating programs




class AFunction{
	constructor( name, params, statements){
		this.name = name
		this.paramNames = paramNames
		this.statements = statements
	}
}


/* here are the possible bytecode operations:

assign( lVal variable, rVal variable, array access, function call, or literal value, maybe anything im forgetting too)
assignMath( lVal variable, rVal variable operation variable those 3 in that order)
jumpIf(variable)// jump if it is not 0

basically it can be the same as the AST but you cant have multiple function calls on the same line maybe? this needs more thinking through

the compiled byetcode is a list of functions, wich is in turn a name, the param names, and an array of the byetcode statements

*/


class Frame{
	constructor(){
		this.functionName = ""
		this.instructionPointer = 0
		this.localVariables = [] // use key
	}
}

class Thread{
	constructor(){
		this.stack = []// array of Frame objects
	}
}


function astToByetcode( ast){
	// this does it for the whole thing
	
	
}

function astToByetcode(){
	// this does it just for the contents of a function, not the whole thing
	
}

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













