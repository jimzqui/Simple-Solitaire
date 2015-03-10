/**
 * Quard - Main
 * main.js
 * (c) 2014, Jimbo Quijano
 */

// Set configs
require.config({
	baseUrl: 'js',
	paths: {
		'jquery': 'vendor/jquery.min',
		'quard': 'vendor/quard'
	},
	noGlobal: true,
	urlArgs: "bust=" + Math.random()
});

var Game;

// Load dependencies
require(['klondike'], function(Klondike) {

	// Create new game
	Game = new Klondike();
});