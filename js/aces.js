/**
 * JQcards - Aces
 * aces.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['slot'], function(Slot) {

    // Extend Stack to Slot
    var Aces = Slot.extend({

        // Check if card is allowed
        checkinCard: function(card) {
            var that = this;

            // If allowed, place card
            if (card.num - 1 == that.cards.length) {
                var card = card.slot.pickCard(card.index);
                card.el.css({ zIndex: 999 });
                that.addCard(card);
                card.move(that);
            }
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
    return Aces;
});