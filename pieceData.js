

// name is plain text
// cost i'll need to think about
// action is a piece of JS that gets run, given loc and state (and enviroment I think?)
// actions return an array of possible states
// on each turn run through all the persons pieces, concat their outputs, and have the user pick one
// that is simple

// for now, have effects take effect anytime. Most effects will only happen if the piece is on the board, but the logic to check that is in the efffect code

const RAW_PIECE_DATA = [
	{
		name:"White King",
		cost:3,
		action:'[ ...scope.leaperMove( scope, state, loc, 0, 1), ...scope.leaperMove( scope, state, loc, 1, 1) ]',
		effect:'',
	},
	{
		name:"Black King",
		cost:3,
		action:'[ ...scope.leaperMove( scope, state, loc, 0, 1), ...scope.leaperMove( scope, state, loc, 1, 1) ]',
		effect:'',
	},
	{
		name:"Wazir",
		cost:3,
		action:'scope.leaperMove( scope, state, loc, 1, 0)',
		effect:'',
	},
	{
		name:"Dababa",
		cost:3,
		action:'scope.leaperMove( scope, state, loc, 2, 0)',
		effect:'',
	},
	{
		name:"03",
		cost:3,
		action:'scope.leaperMove( scope, state, loc, 3, 0)',
		effect:'',
	},
	{
		name:"Dusk",
		cost:3,
		action:'scope.leaperMove( scope, state, loc, 4, 0)',
		effect:'',
	},
	{
		name:"7",
		cost:3,
		action:'scope.leaperMove( scope, state, loc, 5, 0)',
		effect:'',
	},
	{
		name:"Wheel",
		cost:3,
		action:'scope.leaperMove( scope, state, loc, 6, 0)',
		effect:'',
	},
	{
		name:"Sliced Bread",
		cost:3,
		action:'scope.leaperMove( scope, state, loc, 7, 0)',
		effect:'',
	},
	{
		name:"Knight",
		cost:3,
		action:'scope.leaperMove( scope, state, loc, 2, 1)',
		effect:'',
	},
	{
		name:"Flamingo",
		cost:3,
		action:'scope.leaperMove( scope, state, loc, 6, 1)',
		effect:'',
	},/*
	{
		name:"Queen",
		cost:7,
		action:'leaperMove',
		effect:'',
	},
	{
		name:"Rook",
		cost:7,
		action:'leaperMove',
		effect:'',
	},
	{
		name:"Bishop",
		cost:7,
		action:'leaperMove',
		effect:'',
	},*/
]
