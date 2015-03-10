/**
 * Quard - Deck
 * deck.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['quard'], function(Quard) {

    // Extend Deck to Quard.deck
    var Deck = Quard.slot.extend({

        // Settings
        settings: {
            cascade: {
                left: 0,
                top: 0,
                max: 0
            },
            anim: {
                interval: 150,
                speed: 500,
                swing: 20
            },
            animate: true
        }
        
    });

    // Return class
    return Deck;
});