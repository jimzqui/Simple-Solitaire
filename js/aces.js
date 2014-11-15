/**
 * JQcards - Aces
 * aces.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['quard'], function(Quard) {

    // Extend Stack to Quard.slot
    var Aces = Quard.slot.extend({

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

        // Drop events
        dropEvents: {
            'mousedown card[face=faceup]': 'grab'
        },

        // Drop condition
        dropCondition: {
            suit: 'checkin',
            order: 'asc'
        }

    });

    // Return class
    return Aces;
});