/**
 * JQcards - Game
 * game.js
 * (c) 2014, Jimbo Quijano
 */

var Game;

// Load dependencies
define(['solitaire', 'deck', 'stack', 'browse', 'column', 'aces'], function(Solitaire, Deck, Stack, Browse, Column, Aces) {

	// Craete new game
	Game = new Solitaire;

	// Create new deck
    Game.deck = new Deck({
        canvas: Game,
        name: 'deck',
        position: {
            left: 3,
            top: 3
        }
    });

    // Create new stack
    Game.stack = new Stack({
        canvas: Game,
        name: 'stack',
        position: {
            left: 0,
            top: 0
        }
    });

    // Create new browse
    Game.browse = new Browse({
        canvas: Game,
        name: 'browse',
        position: {
            left: 1,
            top: 0
        }
    });

    // Create new columns
    Game.columns = [];
    for (var i = 0; i < 7; i++) {
        Game.columns.push(new Column({
            canvas: Game,
            name: 'col' + i,
            position: {
                left: i,
                top: 1
            }
        }));
    };

    // Create new aces
    Game.aces = [];
    for (var i = 0; i < 4; i++) {
        Game.aces.push(new Aces({
            canvas: Game,
            name: 'ace' + i,
            position: {
                left: 3 + i,
                top: 0
            }
        }));
    };

    // Set collisions and checkins
    Game.collisions = Game.columns;
    Game.checkins = Game.aces;

    // Populate cards to deck
    Game.deck.populate(Game.suits, Game.names);

	// Return game
	return Game;

});