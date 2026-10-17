export const rawPieceData = [
{
	name: "White King",
	purchaseCostFunction: `havePlayerPay( playerID, 3)`,
	action: `
let choice = getUserChoice( userID, "Pick a move type",createArray("Move orthogonally","Move diagonally"))
if choice:
	doLeaperMove( userID, myPieceID, 1, 0)
if !choice:
	doLeaperMove( userID, myPieceID, 1, 1)
	`,
	effects: [],
},
{
	name: "Black King",
	purchaseCostFunction: `havePlayerPay( playerID, 3)`,
	action: `
let choice = getUserChoice( userID, "Pick a move type", createArray("Move orthogonally","Move diagonally"))
if choice:
	doLeaperMove( userID, myPieceID, 1, 0)
if !choice:
	doLeaperMove( userID, myPieceID, 1, 1)
`,
	effects: [],
},
{
	name: "Wazir",
	purchaseCostFunction: `havePlayerPay( playerID, 3)`,
	simpleRule:"ACTION: Move 1 space vertically or horizontally.",
	action: `doLeaperMove( userID, myPieceID, 1, 0)`,
	effects: [],
	/*effects: [ This is a test of the effect code
		{
			replacedFunction:"doLeaperMove",
			newFunction:"doRiderMove",
		},
	],*/
},
{
	name: "Dababa",
	purchaseCostFunction: `havePlayerPay( playerID, 3)`,
	simpleRule:"ACTION: Move 2 spaces vertically or horizontally, jumping over pieces.",
	action: `doLeaperMove( userID, myPieceID, 2, 0)`,
	effects: [],
},
{
	name: "03",
	purchaseCostFunction: `havePlayerPay( playerID, 3)`,
	simpleRule:"ACTION: Move 3 spaces vertically or horizontally, jumping over pieces.",
	action: `doLeaperMove( userID, myPieceID, 3, 0)`,
	effects: [],
},
{
	name: "Dusk",
	purchaseCostFunction: `havePlayerPay( playerID, 3)`,
	simpleRule:"ACTION: Move 4 spaces vertically or horizontally, jumping over pieces.",
	action: `doLeaperMove( userID, myPieceID, 4, 0)`,
	effects: [],
},
{
	name: "7",
	purchaseCostFunction: `havePlayerPay( playerID, 3)`,
	simpleRule:"ACTION: Move 5 spaces vertically or horizontally, jumping over pieces.",
	action: `doLeaperMove( userID, myPieceID, 5, 0)`,
	effects: [],
},
{
	name: "Wheel",
	purchaseCostFunction: `havePlayerPay( playerID, 3)`,
	simpleRule:"ACTION: Move 6 spaces vertically or horizontally, jumping over pieces.",
	action: `doLeaperMove( userID, myPieceID, 6, 0)`,
	effects: [],
},
{
	name: "Sliced Bread",
	purchaseCostFunction: `havePlayerPay( playerID, 3)`,
	simpleRule:"ACTION: Move 7 spaces vertically or horizontally, jumping over pieces.",
	action: `doLeaperMove( userID, myPieceID, 7, 0)`,
	effects: [],
},
{
	name: "Knight",
	purchaseCostFunction: `havePlayerPay( playerID, 3)`,
	simpleRule:"ACTION: Move 2 spaces vertically or horizontally and then 1 space in a direction perpendicular to that.",
	action: `doLeaperMove( userID, myPieceID, 2, 1)`,
	effects: [],
},
{
	name: "Flamingo",
	purchaseCostFunction: `havePlayerPay( playerID, 3)`,
	simpleRule:"ACTION: Move 6 spaces vertically or horizontally and then 1 space in a direction perpendicular to that.",
	action: `doLeaperMove( userID, myPieceID, 6, 1)`,
	effects: [],
},
{
	name: "Queen",
	purchaseCostFunction: `havePlayerPay( playerID, 7)`,
	simpleRule:"ACTION: Move any number of spaces vertically, horizontally, or diagonally.",
	action: `
let choice = getUserChoice( userID, "Pick a move type", createArray("Move orthogonally","Move diagonally"))
if choice:
	doRiderMove( userID, myPieceID, 1, 0)
if !choice:
	doRiderMove( userID, myPieceID, 1, 1)
`,
	effects: [],
},
{
	name: "Rook",
	purchaseCostFunction: `havePlayerPay( playerID, 5)`,
	simpleRule:"ACTION: Move any number of spaces vertically or horizontally.",
	action: `doRiderMove( userID, myPieceID, 1, 0)`,
	effects: [],
},
{
	name: "Bishop",
	purchaseCostFunction: `havePlayerPay( playerID, 3)`,
	simpleRule:"ACTION: Move any number of spaces diagonally.",
	action: `doRiderMove( userID, myPieceID, 1, 1)`,
	effects: [],
},
{
	name: "Disney Shadow",
	purchaseCostFunction: `havePlayerPay( playerID, 17)`,
	simpleRule:"ACTION: Move like a Queen or Knight, then capture all oponent pieces adjacent to this.",
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
			effects: [],
},
{
	name: "Barbarian",
	purchaseCostFunction: `havePlayerPay( playerID, 3)`,
	simpleRule:"ACTION: Move any odd number of squares vertically and then one horizontally.",
	action: `

#First, move any even number of spaces vertically

let choice = getUserChoice( userID, "Pick move up or down", createArray("Up","Down"))
let verticalDirection = "placeholder"
if choice:
	verticalDirection = 0 #North
if !choice:
	verticalDirection = 2 #south

let done = 0
let i = 0
for unused in range(100):
	if !done:
		done = getUserChoice( userID, "Continue moving?", createArray("Continue","or not")) == 1
	if !done: # We need to have a 2nd condition here (even though it is exacly the same as the last condition) because the player could stop moving without moving at all yet, and done would have just been set. We need to do this because 0 is an even number
		movePieceInDirection( myPieceID, verticalDirection)
		i = i + 1


if mod( i, 2):
	throwError("Tried to move off of the board") # I know thats not really what happened but for now the branching sim stuff only responds well to that string being thrown

#Now, move 1 space horizontally


let horizontalDirection = getUserChoiceOfArray( userID, createArray( 1, 3), createArray("East","West"), "Pick move left or right")
movePieceInDirection( myPieceID, horizontalDirection)


`,
	effects: [],
},
/*{
	name: "Battering Ram",
	cost: 6,
	simpleRule:"ACTION: Move (without capturing a piece $5 or more) like a Knight or a Queen.",
	action: `

Actually this would be a lot simpler as an effect instead of an action
#A lot of this is copy-pasted and then customized from the leaper and rider code


let choice = getUserChoice( userID, "Pick a move type", createArray("Move Knightly","Move Queenly"))
if !choice:
	let firstAmount = 2
	let secondAmount = 1
	let firstDirection = getUserChoiceOfArray( userID, getAllOrthogonalDirections(),createArray(0,1,2,3), "Pick a direction")
	let secondDirection = getUserChoiceOfArray( userID, getDirectionsPerpendicularToDirection( firstDirection),createArray(0,1), "Pick a secondary direction")
	# walk along the path, making sure that each space is either empty, itself (because when it moves in it will also move out), or (on the last space only) a capturable enemy piece

	for i in range(firstAmount):
		let location = getPieceLocation( theMovingPieceId)
		let newLocation = getLocOneSpaceInDirection( location, firstDirection)
		
		# if !isLocationEmpty( newLocation):#TODO what if it is being blocked by itself, or what if this is the last space in the path
		# 	# a piece is there. The only way this can move there is if that piece is itself, or if 
		# 	throwError("err")
		
		
		# TODO do this better
		if i == firstAmount - 1 & secondAmount == 0: #if it is the last square
			captureAllPiecesAtLoc(newLocation)
		
		movePiece( theMovingPieceId, newLocation)
			
	for unused in range(secondAmount):
		let location = getPieceLocation( theMovingPieceId)
		let newLocation = getLocOneSpaceInDirection( location, secondDirection)
# 		
# 		if !isLocationEmpty( newLocation):#TODO what if it is being blocked by itself
# 			# a piece is there. The only way this can move there is if that piece is itself, or if 
# 			throwError()
# 		
		# TODO make sure there is not a friendly piece there that should not be jumped on
		
		
		# TODO do this better
		if unused == secondAmount - 1: #if it is the last square
			captureAllPiecesAtLoc(newLocation)
		
		
		movePiece( theMovingPieceId, newLocation)
					
					
				
				
				


if choice:
	
	
	let firstAmount = 1
	let secondAmount = 1
	
	let firstDirection = getUserChoiceOfArray( userID, getAllOrthogonalDirections(),createArray(0,1,2,3), "Pick a direction")
	let secondDirection = getUserChoiceOfArray( userID, getDirectionsPerpendicularToDirection( firstDirection),createArray(0,1), "Pick a secondary direction")
	# walk along the path, making sure that each space is either empty, itself (because when it moves in it will also move out), or (on the last space only) a capturable enemy piece

	let done = 0 # this gets set to true/1 when a piece has been captured and it cant move any further
	
	for i in range(firstAmount):
		let location = getPieceLocation( theMovingPieceId)
		let newLocation = getLocOneSpaceInDirection( location, firstDirection)
		
		# if !isLocationEmpty( newLocation):#TODO what if it is being blocked by itself, or what if this is the last space in the path
		# 	# a piece is there. The only way this can move there is if that piece is itself, or if 
		# 	throwError("err")
		
		
		# TODO do this better
		if i == firstAmount - 1 & secondAmount == 0: #if it is the last square
			if length(getPiecesAtLoc(newLocation)):
				done = 1
			captureAllPiecesAtLoc(newLocation)
		
		movePiece( theMovingPieceId, newLocation)
			
	for unused in range(secondAmount):
		let location = getPieceLocation( theMovingPieceId)
		let newLocation = getLocOneSpaceInDirection( location, secondDirection)
# 		
# 		if !isLocationEmpty( newLocation):#TODO what if it is being blocked by itself
# 			# a piece is there. The only way this can move there is if that piece is itself, or if 
# 			throwError()
# 		
		# TODO make sure there is not a friendly piece there that should not be jumped on
		
		
		# TODO do this better
		if unused == secondAmount - 1: #if it is the last square
			if length(getPiecesAtLoc(newLocation)):
				done = 1
			captureAllPiecesAtLoc(newLocation)
		
		
		movePiece( theMovingPieceId, newLocation)
					
					
				
	for abc in range(1000):
		
		if getUserChoice( userID, "Continue moving?", createArray("Continue","or not")) == 0 | done:
			return 0
		
		for i in range(firstAmount):
			let location = getPieceLocation( theMovingPieceId)
			let newLocation = getLocOneSpaceInDirection( location, firstDirection)
			
			# if !isLocationEmpty( newLocation):#TODO what if it is being blocked by itself, or what if this is the last space in the path
			# 	# a piece is there. The only way this can move there is if that piece is itself, or if 
			# 	throwError("err")
			
			
			# TODO do this better
			if i == firstAmount - 1 & secondAmount == 0: #if it is the last square
				if length(getPiecesAtLoc(newLocation)):
					done = 1
				captureAllPiecesAtLoc(newLocation)
			
			movePiece( theMovingPieceId, newLocation)
				
		for unused in range(secondAmount):
			let location = getPieceLocation( theMovingPieceId)
			let newLocation = getLocOneSpaceInDirection( location, secondDirection)
	# 		
	# 		if !isLocationEmpty( newLocation):#TODO what if it is being blocked by itself
	# 			# a piece is there. The only way this can move there is if that piece is itself, or if 
	# 			throwError()
	# 		
			# TODO make sure there is not a friendly piece there that should not be jumped on
			
			
			# TODO do this better
			if unused == secondAmount - 1: #if it is the last square
				if length(getPiecesAtLoc(newLocation)):
					done = 1
				captureAllPiecesAtLoc(newLocation)
			
			
			movePiece( theMovingPieceId, newLocation)
						
						
					
					



`,
			effects: [],
},*/
]