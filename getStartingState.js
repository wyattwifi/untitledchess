






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















