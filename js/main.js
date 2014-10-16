/**
 * JQcards - Main
 * main.js
 * (c) 2014, Jimbo Quijano
 */

// Set configs
require.config({
	noGlobal: true
});

var App;

// Load dependencies
require(['solitaire'], function(Solitaire) {

	// Create new app
	App = new Solitaire();

	// Undo button
	$('#undo').click(function() {
		App.undoMove();
	});
});