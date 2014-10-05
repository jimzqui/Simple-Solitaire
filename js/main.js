/**
 * JQcards - Main
 * main.js
 * (c) 2014, Jimbo Quijano
 */

// Set configs
require.config({
	noGlobal: true
});

// Load game
require(['game'], function(Game){

	// Start game
	Game.start();
});