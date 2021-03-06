/**
 * Quard - Browse
 * browse.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['quard'], function(Quard) {

    // Extend Browse to Quard.slot
    var Browse = Quard.slot.extend({

        // Settings
        settings: {
            cascade: {
                left: 20,
                top: 0,
                max: 3
            },
            anim: {
                interval: 0,
                speed: 200,
                swing: 0
            },
            animate: true
        },

        // Drop events
        dropEvents: {
            'click card[last=true]': 'checkIn,switch',
            'mousedown card[last=true]': 'grab'
        }

    });

    // Return class
    return Browse;
});