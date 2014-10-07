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

            // If still animating, return
            if (that.browsing == true) return;
            that.browsing = true;

            // Uncascade cards
            slot.uncascade();
            var browsed = [];

            // Retrieve last three cards from browse
            for (var i = 0; i < 3; i++) {
                var card = that.pickCard(that.cards.length - 1);
                
                // Add card to container
                if (card != undefined) {
                    card.el.unbind('click');
                    browsed.push(card);
                }
            };

            // Place cards to browse
            slot.addCards(browsed, function() {

                // Flip browsed cards
                for (var i = 0; i < browsed.length; i++) {
                    var card = browsed[i];
                    card.flip('faceup');
                };
                
                // Last stack cards
                that.last.el.unbind('click');
                that.last.el.click(function() {
                    that.browse(slot);
                });

                // If all cards are browsed
                that.el.unbind('click');
                that.el.click(function() {
                    if (that.cards.length == 0) {
                        that.reset(slot);
                    }
                });

                // Update browsing status
                that.browsing = false;
            });
        },

        // Reset stack cards
        reset: function(slot) {
            var that = this;

            // Uncascade cards
            slot.uncascade(function() {

                // Create container
                var cards = [];

                // Iterate all browsed cards
                for (var i = slot.cards.length - 1; i >= 0; i--) {
                    var card = slot.pickCard(i);
                    card.flip('facedown', 0);
                    cards.push(card);

                    // Unbind events
                    card.el.unbind('click');
                };

                // Place cards to stack
                that.addCards(cards);

                // Add event to last card
                that.last.el.unbind('click');
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
                zswitch: 0,
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