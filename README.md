# untitledchess






This is a work in progress

This is the coded version of a chess variant game. In this chess game, there are many different pieces. There is a simple money system where people get a bit of money each turn and can buy new pieces from a market, which gets refilled from a deck.

This is a coded, digital version of that game (ideally, for now it is not there yet). Among the more obvious reasons why it would be nice to have a version of the game on the computer, there is another reason. If the rules are written in natural language, there can easily be abiguity, but a coding language doesn't have that problem. For example, a piece that makes all pieces next to it have no effect sounds intuitive enough, and so does a piece that mirrors the effect of any piece next to it. But it becomes unclear what happens when they are next to each other. If you code it in a coding language, it will give you an answer of what will happen (even if it was not what you think should happen, it is at least an answer). I think ideally this coded version would be the difinitive version of the rules, but then there would be a simplified, approximate version in natural language (eg English) too.

So, if you write the rules in a coding language, which language do you use? I am trying to make a coding language specifically for this game. (Why? I'll expmlain more later.)

Most of the current code is for a previous attempt where I tried doing it in javascript instead of the custom language


Part of the language is the built-in, always there, "state" variable.

Types: boolean, pieceHandle, playerID, integer, string, objects, arrays, maybe that's it??

When writting code in UntitledChessLang, try to break up the steps into the steps that people think of it as, and have each of those steps be its own function. That way effects can work more intuitively


Also, one of the rules of this chess game (unless someone else says no, I just made this up) is that you are allowed to do somethnig different than what the rules say as long as it is functionally the same.


The API of built-in functions for the language.
simulateAllChoicesUpToTurnBoundary()
uiUpdateState()
endTurnUiUpdateState() // this is basically the same as UI update state but also signals the end of a turn. That is needed so that simulateAllChoicesUpToTurnBoundary knows where to start
That is all the things that can't be replicated and actually add new stuff. However, there is also then functions provided that the user could have made them themselves, they are just there for convenience. An example is string parsing
getUserChoice( userID, numOfOptions) there are probably only 2 user ids for the 2 players, but that is left unspecified. Assumably there is a one-to-one correspondence between user ids and real entities playing the game, but once again that is unspecified
throwError() // use this if this should not be reached. For example, if the user chooses to move a knight up 2 and then there are pieces on the right and left of it, throw an error. That is why all the possibilities need simulated beforehand so that it can know to then not let the user choose to move it up. For simplicity, in the piece description let it move up and throw an error if it gets stuck, and then simulate it so you know to avoid any errors
endGame(resultString)


The Program:
def doTurn:
    
    simulateAllChoicesUpToTurnBoundary() // returns a tree. Each node can be a user choice that has one child node for each choice, a state node that may
    
    uiUpdateState() // takes the current state variable and prints it to the console
    
    doTurn()



doTurn()


In the piece rules, it seemed simpler to me to just write it in a way so that it gets the user choice and then branches based on that, instead of trying to keep track of all the different possibilites. (It seems like a good idea to keep the piece rules very sipmle, so many more can easily be added). However, some of those possibilites lead down paths that are not allowed, so you first need to simulate through all the possibilities, see which ones will end up legal, and only present those options to the player. Then, the simulation branches whenever the piece gets input from the user. That could be handled by just duplicating the program. I started writting the piece rules in Javascript, but I don't know of a javascript thing that will let you duplicate a program. Also, other benifits to having it be its own coding language are being able to control what the program can do a lot better



We want to be able to handle many possibilities of what a piece can do. Many (but not all) of these can be grouped into 2 types:
Action: a function that takes a board state and returns a new board state
Effect: a function that takes all the actions and returns all the new actions


It seems like a good-enough simplification to just say that all the effects are in the language just replacing calls to some function to calls to another function (eg capturePiece -> myCapturePiece to make some pieces reappear when captured). That can be handled automatically with it written in its own language, just whenever a function is called look at all the effects and see which function to actually call









