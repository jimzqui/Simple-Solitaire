/**
 * JQcards - Main
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

var App;

// Load dependencies
require(['solitaire'], function(Solitaire) {

	// Create new app
	App = new Solitaire();
});