/**
 * JQcards - Stack
 * stack.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['quard'], function(Quard) {

    // Extend Stack to Quard.slot
    var Stack = Quard.slot.extend({

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
            altanim: {
                interval: 0,
                speed: 200,
                swing: 0
            },
            animate: true
        },

        // Drop events
        dropEvents: {
            'click card[last=true]': 'browse'
        }
        
    });

    // Return class
    return Stack;
});