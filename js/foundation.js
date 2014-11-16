/**
 * JQcards - Foundation
 * foundation.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['quard'], function(Quard) {

    // Extend Stack to Quard.slot
    var Foundation = Quard.slot.extend({

        // Settings
        settings: {
            cascade: {
                left: 0,
                top: 0,
                max: 0
            },
            anim: {
                interval: 150,
                speed: 300,
                swing: 15
            },
            animate: true
        },

        // Set check suits
        checkSuits: ['Spades', 'Hearts', 'Clubs', 'Diamonds'],

        // Drop events
        dropEvents: {
            'click card[last=true]': 'switch',
            'mousedown card[face=faceup]': 'grab'
        },

        // Drop condition
        dropCondition: {
            suit: 'foundation',
            order: 'asc'
        }

    });

    // Return class
    return Foundation;
});