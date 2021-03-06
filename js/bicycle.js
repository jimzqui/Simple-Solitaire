/**
 * Quard - Bicycle
 * deck.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['quard'], function(Quard) {

    // Extend Bicycle to Quard.cardmap
    var Bicycle = Quard.cardmap.extend({

        // Map
        map: [
            ['1 Spades', '1 Hearts', '1 Clubs', '1 Diamonds'],
            ['2 Spades', '2 Hearts', '2 Clubs', '2 Diamonds'],
            ['3 Spades', '3 Hearts', '3 Clubs', '3 Diamonds'],
            ['4 Spades', '4 Hearts', '4 Clubs', '4 Diamonds'],
            ['5 Spades', '5 Hearts', '5 Clubs', '5 Diamonds'],
            ['6 Spades', '6 Hearts', '6 Clubs', '6 Diamonds'],
            ['7 Spades', '7 Hearts', '7 Clubs', '7 Diamonds'],
            ['8 Spades', '8 Hearts', '8 Clubs', '8 Diamonds'],
            ['9 Spades', '9 Hearts', '9 Clubs', '9 Diamonds'],
            ['10 Spades', '10 Hearts', '10 Clubs', '10 Diamonds'],
            ['11 Spades', '11 Hearts', '11 Clubs', '11 Diamonds'],
            ['12 Spades', '12 Hearts', '12 Clubs', '12 Diamonds'],
            ['13 Spades', '13 Hearts', '13 Clubs', '13 Diamonds'],
            ['red facedown', 'blue facedown', 'joker 1', 'joker 2']
        ],

        // Faceup
        faceup: {
            x: '0-3',
            y: '0-12'
        },

        // Facedown
        facedown: '0-13',

        // Skins
        skins: {
            current: 'default',
            dist: 'quard/cardsprites/',
            list: ['default']
        },

        // Initial slot
        slot: 'Deck'
        
    });

    // Return class
    return Bicycle;
});