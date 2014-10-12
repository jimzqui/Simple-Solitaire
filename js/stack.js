/**
 * JQcards - Stack
 * stack.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['slot'], function(Slot) {

    // Extend Stack to Slot
    var Stack = Slot.extend({

        // Initialize
        init: function(options) {
            var that = this;

            // Default settings
            var defaults = {
                cascade: {
                    left: 0,
                    top: 0
                },
                anim: {
                    interval: 150,
                    speed: 500,
                    ease: 20
                },
                last: null,
                status: null,
                animate: true,
                width: 71,
                height: 96,
                cards: []
            };

            // Construct settings
            var settings = $.extend({}, defaults, options);

            // Map settings to root
            $.each(settings, function(index, value) {
                that[index] = value;
            });

            // Create slot
            that._create();
            return that;
        },

        // Events
        events: {
            'click card last:true': 'browse',
            'click this': 'reset'
        },

        // Open last 3 cards
        browse: function(e) {
            var that = this;

            // If still animating, return
            if (that.browsing == true) return;
            that.browsing = true;

            // Uncascade cards
            that.canvas.browse.uncascade();
            var browsed = [];

            // Retrieve last three cards from browse
            for (var i = 0; i < 3; i++) {
                var card = that.pickCard(that.cards.length - 1);
                
                // Add card to container
                if (card != undefined) {
                    browsed.push(card);
                }
            };

            // Place cards to browse
            that.canvas.browse.addCards(browsed, function() {

                // Flip browsed cards
                for (var i = 0; i < browsed.length; i++) {
                    var card = browsed[i];
                    card.flip();
                };

                // Update browsing status
                that.browsing = false;
            });
        },

        // Reset stack cards
        reset: function(e) {
            var that = this;

            // Change anim
            that.anim = {
                interval: 0,
                speed: 200,
                ease: 0
            };

            // Create container
            var cards = [];

            // Iterate all browsed cards
            for (var i = that.canvas.browse.cards.length - 1; i >= 0; i--) {
                var card = that.canvas.browse.pickCard(i);
                cards.push(card);
                card.flip(25);
            };

            // Place cards to stack
            that.addCards(cards, function() {

                // Put back anim
                that.anim = {
                    interval: 150,
                    speed: 500,
                    ease: 20
                };
            });
        }
    });

    // Return class
    return Stack;
});