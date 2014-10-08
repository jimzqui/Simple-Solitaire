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
        name: 'deck',
        animate: false,
        offset: Game.computeOffset(3, 3)
    }).create(Game);

    // Create new stack
    Game.stack = new Stack({
        name: 'stack',
        offset: Game.computeOffset(0, 0)
    }).create(Game);

    // Create new browse
    Game.browse = new Browse({
        name: 'browse',
        offset: Game.computeOffset(1, 0),
        anim: {
        	interval: 150,
        	speed: 200,
        	ease: 15
        }
    }).create(Game);

    // Create new columns
    Game.columns = [];
    for (var i = 0; i < 7; i++) {
        Game.columns.push(new Column({
            name: 'col' + i,
            slotindex: i,
            offset: Game.computeOffset(i, 1),
        }).create(Game))
    };

    // Create new aces
    Game.aces = [];
    for (var i = 0; i < 4; i++) {
        Game.aces.push(new Aces({
            name: 'ace' + i,
        	slotindex: i,
            offset: Game.computeOffset(3 + i, 0),
            anim: {
                interval: 150,
                speed: 300,
                ease: 15
            }
        }).create(Game))
    };

	// Return game
	return Game;

});