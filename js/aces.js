/**
 * JQcards - Aces
 * aces.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['slot'], function(Slot) {

    // Extend Stack to Slot
    var Aces = Slot.extend({

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
                    speed: 300,
                    ease: 15
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

            return that;
        },

        // Check if card is allowed
        checkinCard: function(card) {
            var that = this;

            // If allowed, place card
            if (card.num - 1 == that.cards.length) {
                var card = card.slot.pickCard(card.index);
                card.el.animate({ zIndex: 999 + that.slotindex }, 0);
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

        // Compute cascade data
        computeCascade: function() {
            var that = this;
            var adjust_left = (that.cards.length - 1) * that.cascade.left;
            var adjust_top = (that.cards.length - 1) * that.cascade.top;

            return {
                left: that.offset.left + adjust_left,
                top: that.offset.top + adjust_top
            };
        }
    });

    // Return class
    return Aces;
});