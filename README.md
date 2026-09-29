# untitledchess






This is a work in progress

This is the coded version of a chess variant game. In this chess game, there are many different pieces. There is a simple money system where people get a bit of money each turn and can buy new pieces from a market, which gets refilled from a deck.

This is a coded, digital version of that game (ideally, for now it is not there yet). Among the more obvious reasons why it would be nice to have a version of the game on the computer, there is another reason. If the rules are written in natural language, there can easily be abiguity, but a coding language doesn't have that problem. For example, a piece that makes all pieces next to it have no effect sounds intuitive enough, and so does a piece that mirrors the effect of any piece next to it. But it becomes unclear what happens when they are next to each other. If you code it in a coding language, it will give you an answer of what will happen (even if it was not what you think should happen, it is at least an answer). I think ideally this coded version would be the difinitive version of the rules, but then there would be a simplified, approximate version in natural language (eg English) too.

So, if you write the rules in a coding language, which language do you use? I am trying to make a coding language specifically for this game. (Why? I'll expmlain more later.)

In the piece rules, it seemed simpler to me to just write it in a way so that it gets the user choice and then branches based on that, instead of trying to keep track of all the different possibilites. (It seems like a good idea to keep the piece rules very sipmle, so many more can easily be added). However, some of those possibilites lead down paths that are not allowed, so you first need to simulate through all the possibilities, see which ones will end up legal, and only present those options to the player. Then, the simulation branches whenever the piece gets input from the user. That could be handled by just duplicating the program. I started writting the piece rules in Javascript, but I don't know of a javascript thing that will let you duplicate a program. Also, other benifits to having it be its own coding language are being able to control what the program can do a lot better



We want to be able to handle many possibilities of what a piece can do. Many (but not all) of these can be grouped into 2 types:
Action: a function that takes a board state and returns a new board state
Effect: a function that takes all the actions and returns all the new actions


It seems like a good-enough simplification to just say that all the effects are in the language just replacing calls to some function to calls to another function (eg capturePiece -> myCapturePiece to make some pieces reappear when captured). That can be handled automatically with it written in its own language, just whenever a function is called look at all the effects and see which function to actually call


As of writting, the coding language itself is mostly working, but hasn't been "chessified" yet. The UI is somewhat nonexistent








