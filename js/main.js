/**
 * JQcards - Main
 * main.js
 * (c) 2014, Jimbo Quijano
 */

// Set configs
require.config({
	noGlobal: true
});

var Game;

// Load dependencies
require(['solitaire'], function(Solitaire) {

	// Create new game
	Game = new Solitaire();

	// Start game
	Game.start();
});