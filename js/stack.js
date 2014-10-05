/**
 * JQcards - Stack
 * stack.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['slot'], function(Slot) {

    // Extend Stack to Slot
    var Stack = Slot.extend({

        // Open last 3 cards
        browse: function(slot) {
            var that = this;

            // Move last browsed to left
            if (that.browsed != undefined) {
                for (var i = 0; i < that.browsed.length; i++) {
                    var card = that.browsed[i];
                    card.el.animate({
                        left: slot.offset.left
                    });
                };
            }

            // Clear browsed cards
            that.browsed = [];

            // Retrieve last three cards from browse
            for (var i = 0; i < 3; i++) {
                var card = that.pickCard(that.cards.length - 1);
                
                // Add card to container
                that.browsed.push(card);
            };

            // Place cards to browse
            slot.addCards(that.browsed, function() {

                // Flip browsed cards
                for (var i = 0; i < that.browsed.length; i++) {
                    var card = that.browsed[i];
                    card.flip('faceup');
                };
                
                // Last stack cards
                that.last.el.click(function() {
                    that.browse(slot);
                });
            });
        },

        // Compute anim data
        computeAnim: function() {
            var that = this;

            // Compute data
            var zindex = that.cards.length;
            var timeout = (that.cards.length * that.anim.ease) * 2;
            var interval = that.anim.interval;
            var speed = that.anim.speed;

            // Return data
            return {
                zindex: zindex,
                interval: interval,
                timeout: timeout,
                speed: speed
            }
        },

        // Compute casecade data
        computeCascade: function() {
            var that = this;
            return that.offset;
        }
    });

    // Return class
    return Stack;
});