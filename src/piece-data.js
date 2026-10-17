export const rawPieceData = [
{
	name: "White King",
	cost: 3,
	action: `
let choice = getUserChoice( userID, "Pick a move type",createArray("Move orthogonally","Move diagonally"))
if choice:
	doLeaperMove( userID, myPieceID, 1, 0)
if !choice:
	doLeaperMove( userID, myPieceID, 1, 1)
`,
	effect: ""
},
{
	name: "Black King",
	cost: 3,
	action: `
let choice = getUserChoice( userID, "Pick a move type", createArray("Move orthogonally","Move diagonally"))
if choice:
	doLeaperMove( userID, myPieceID, 1, 0)
if !choice:
	doLeaperMove( userID, myPieceID, 1, 1)
`,
	effect: ""
},
{
	name: "Wazir",
	cost: 3,
	action: `doLeaperMove( userID, myPieceID, 1, 0)`,
	effect: ""
},
{
	name: "Dababa",
	cost: 3,
	action: `doLeaperMove( userID, myPieceID, 2, 0)`,
	effect: ""
},
{
	name: "03",
	cost: 3,
	action: `doLeaperMove( userID, myPieceID, 3, 0)`,
	effect: ""
},
{
	name: "Dusk",
	cost: 3,
	action: `doLeaperMove( userID, myPieceID, 4, 0)`,
	effect: ""
},
{
	name: "7",
	cost: 3,
	action: `doLeaperMove( userID, myPieceID, 5, 0)`,
	effect: ""
},
{
	name: "Wheel",
	cost: 3,
	action: `doLeaperMove( userID, myPieceID, 6, 0)`,
	effect: ""
},
{
	name: "Sliced Bread",
	cost: 3,
	action: `doLeaperMove( userID, myPieceID, 7, 0)`,
	effect: ""
},
{
	name: "Knight",
	cost: 3,
	action: `doLeaperMove( userID, myPieceID, 2, 1)`,
	effect: ""
},
{
	name: "Flamingo",
	cost: 3,
	action: `doLeaperMove( userID, myPieceID, 6, 1)`,
	effect: ""
},
{
	name: "Queen",
	cost: 7,
	action: `
let choice = getUserChoice( userID, "Pick a move type", createArray("Move orthogonally","Move diagonally"))
if choice:
	doRiderMove( userID, myPieceID, 1, 0)
if !choice:
	doRiderMove( userID, myPieceID, 1, 1)
`,
	effect: ""
},
{
	name: "Rook",
	cost: 7,
	action: `doRiderMove( userID, myPieceID, 1, 0)`,
	effect: ""
},
{
	name: "Bishop",
	cost: 7,
	action: `doRiderMove( userID, myPieceID, 1, 1)`,
	effect: ""
},
{
	name: "Disney Shadow",
	cost: 17,
	action: `
let choice = getUserChoice( userID, "Pick a move type", createArray("Move Knightly","Move Queenly"))
if choice:
	doLeaperMove( userID, myPieceID, 2, 1)
if !choice:
	let choice2 = getUserChoice( userID, "Pick a move type", createArray("Move orthogonally","Move diagonally"))
	if choice2:
		doRiderMove( userID, myPieceID, 1, 0)
	if !choice2:
		doRiderMove( userID, myPieceID, 1, 1)
for loc in getAllAdjacentLocs(getPieceLocation(myPieceID)):
	#print(loc)
	captureAllPiecesAtLoc( loc)
`,
			effect: ""
},
]