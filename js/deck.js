/**
 * JQcards - Deck
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
        },

        // Card class
        cardclass: Quard.card,

        // Card map
        cardmap: {
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
            render: {
                start: '1 Spades',
                end: '13 Diamonds',
                back: 'red facedown'
            },
            sprite: 'quard/cardsprites/default.png'
        }
        
    });

    // Return class
    return Deck;
});