# UntitledChessLang




Currently, the language is similar to Python but with some differences
Unless specified, it is Python syntax. You can learn Python basics here: https://www.w3schools.com/python/default.asp
Here are the differences from Python.

| Instead of | use |
| --------------- | --------------- |
| `and` | `&` |
| `or` | `\|` |
| `not` | `!` |
| `True` | `1` |
| `False` | `0` |
Also, you need to declare variables before you use them with the keyword `let`, like in Javascript. Also, you cannot have code outside of a function.
Also, you do not need to use `pass`, you can just leave it blank. Also, as of now you cannot chain comparisions. There are probably other differences between this and Python too that I dont know of or am forgetting.




TODO - support being able to declare arrays. Currently you can get a new array with `range(length)`, but you cannot just have in the code something like `let a = [ 1, 2, 3]`




This is a work in progress. If something doesn't look right, you are probably right. If you don't breath too deeply, it might not fall over.

This is the coded version of a chess variant game. In this chess game, there are many different pieces. There is a simple money system where people get a bit of money each turn and can buy new pieces from a market, which gets refilled from a deck.


If the rules are written in natural language, there can easily be abiguity, but a coding language doesn't have that problem. For example, a piece that makes all pieces next to it have no effect sounds intuitive enough, and so does a piece that mirrors the effect of any piece next to it. But it becomes unclear what happens when they are next to each other. If you code it in a coding language, it will give you an answer of what will happen (even if it was not what you think should happen, it is at least an answer). I think ideally this coded version would be the difinitive version of the rules, but then there would be a simplified, approximate version in natural language (eg English) too.



Part of the language is the built-in, always there, "state" variable.

Types: boolean, pieceHandle, playerID, integer, string, objects, arrays, maybe that's it??
TODO - support types


When writting code in UntitledChessLang, try to break up the steps into the steps that people think of it as, and have each of those steps be its own function. That way effects can work more intuitively




The API of built-in functions for the language.
TODO this does not actually reflect what is currently supported
simulateAllChoicesUpToTurnBoundary()
uiUpdateState()
endTurnUiUpdateState() // this is basically the same as UI update state but also signals the end of a turn. That is needed so that simulateAllChoicesUpToTurnBoundary knows where to start
getUserChoice( userID, numOfOptions) there are probably only 2 user ids for the 2 players, but that is left unspecified. Assumably there is a one-to-one correspondence between user ids and real entities playing the game, but once again that is unspecified
throwError() // use this if this should not be reached. For example, if the user chooses to move a knight up 2 and then there are pieces on the right and left of it, throw an error. That is why all the possibilities need simulated beforehand so that it can know to then not let the user choose to move it up. For simplicity, in the piece description let it move up and throw an error if it gets stuck, and then simulate it so you know to avoid any errors
endGame(resultString)
uiHint(message) - this is a function that sends some information to the user interface. Its specifics are intentionally unpsecified. For example, it could let the user see which outcomes will result from the different options available. In this current implementation, it does that. Calling this function should have no effect on the game code program-thing (except for effects that it might indirectly have on the renuslts of getUserChoice (through prompting the user to make a certain choice))

That is all the things that can't be replicated and actually add new stuff. However, there is also then functions provided that the user could have made them themselves, they are just there for convenience. An example is string parsing


In the piece rules, it seemed simpler to me to just write it in a way so that it gets the user choice and then branches based on that, instead of trying to keep track of all the different possibilites. (It seems like a good idea to keep the piece rules very sipmle, so many more can easily be added). However, some of those possibilites lead down paths that are not allowed, so you first need to simulate through all the possibilities, see which ones will end up legal, and only present those options to the player. Then, the simulation branches whenever the piece gets input from the user. That could be handled by just duplicating the program. I started writting the piece rules in Javascript, but I don't know of a javascript thing that will let you duplicate a program. Also, other benifits to having it be its own coding language are being able to control what the program can do a lot better



We want to be able to handle many possibilities of what a piece can do. Many (but not all) of these can be grouped into 2 types:
Action: a function that takes a board state and returns a new board state
Effect: a function that takes all the actions and returns all the new actions


It seems like a good-enough simplification to just say that all the effects are in the language just replacing calls to some function to calls to another function (eg capturePiece -> myCapturePiece to make some pieces reappear when captured). That can be handled automatically with it written in its own language, just whenever a function is called look at all the effects and see which function to actually call. That is one reason to make a coding language specifically for this rather than using an existing language.









