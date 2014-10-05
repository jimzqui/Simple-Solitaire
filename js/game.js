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
        animate: false,
        offset: {
        	top: 450,
        	left: 303
        }
    });

    // Create new stack
    Game.stack = new Stack({
        offset: {
        	top: 0,
        	left: 0
        }
    });

    // Create new browse
    Game.browse = new Browse({
        anim: {
        	interval: 150,
        	speed: 200,
        	ease: 15
        },
        offset: {
        	top: 0,
        	left: 101
        }
    });

    // Create new columns
    Game.columns = [];
    for (var i = 0; i < 7; i++) {
        Game.columns.push(new Column({
        	zindex: i + 1,
            offset: {
	        	top: 146,
	        	left: (i * 71) + (i * 30)
	        }
        }))
    };

    // Create new aces
    Game.aces = [];
    for (var i = 0; i < 4; i++) {
        Game.aces.push(new Aces({
            offset: {
	        	top: 0,
	        	left: (i * 71) + (i * 30) + 303
	        }
        }))
    };

	// Return game
	return Game;

});