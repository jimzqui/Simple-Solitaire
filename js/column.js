/**
 * Quard - Column
 * column.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['quard'], function(Quard) {

    // Extend Column to Quard.slot
    var Column = Quard.slot.extend({

        // Settings
        settings: {
            cascade: {
                left: 0,
                top: 20,
                max: 0
            },
            anim: {
                interval: 150,
                speed: 500,
                swing: 20
            },
            animAlt: {
                interval: 0,
                speed: 200,
                swing: 0
            },
            animate: true
        },

        // Drop events
        dropEvents: {
            'click card[last=true]': 'checkIn',
            'click card[face=faceup]': 'switch',
            'mousedown card[face=faceup]': 'grab'
        },

        // Drop condition
        dropCondition: {
            suit: 'alternate',
            order: 'desc'
        }

    });

    // Return class
    return Column;
});