/**
 * JQcards - Game
 * game.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['solitaire', 'deck', 'stack', 'browse', 'column', 'aces'], function(Solitaire, Deck, Stack, Browse, Column, Aces) {

	// Craete new game
	var Game = new Solitaire;

	// Create new deck
    Game.deck = new Deck({
        name: 'deck'
    }).create(3, 3);

    // Create new stack
    Game.stack = new Stack({
        name: 'stack'
    }).create(0, 0);

    // Create new browse
    Game.browse = new Browse({
        name: 'browse'
    }).create(1, 0);

    // Create new columns
    Game.columns = [];
    for (var i = 0; i < 7; i++) {
        Game.columns.push(new Column({
            name: 'col' + i,
            slotindex: i,
        }).create(i, 1))
    };

    // Create new aces
    Game.aces = [];
    for (var i = 0; i < 4; i++) {
        Game.aces.push(new Aces({
            name: 'ace' + i,
        	slotindex: i,
        }).create(3 + i, 0))
    };

	// Return game
	return Game;

});