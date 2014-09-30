/**
 * JQblackjack - Slot Class
 * slot.js
 * (c) 2010, Jimbo Quijano
 */

var Slot = Class.extend({

    // Initialize
    init: function(options) {
        var that = this;

        // Default settings
        var defaults = {
            cascade: false
        };

        // Slot info
        that.status = null;
        that.count = 0;
        that.cards = [];

        // Construct final settings
        that.settings = $.extend({}, defaults, options);
    },

    // Pick card from slot
    pick: function() {
        var that = this;

        // Randomize
        var rand = Math.floor((Math.random() * that.cards.length));

        // Get card
        var card = that.cards[rand];
        that.remove(rand);

        // Return card
        return card;
    },

    // add card to slot
    add: function(card) {
        var that = this;

        // Push to slot
        that.cards.push(card);

        // Return card
        return that;
    },

    // Remove card from slot
    remove: function(rand) {
        var that = this;

        // Remove card from slot
        that.cards.splice(rand, 1);

        // Return card
        return that;
    },

    // Shuffle cards
    shuffle: function() {
        var that = this;
        var currentIndex = that.cards.length, temporaryValue, randomIndex ;

        // While there remain elements to shuffle
        while (0 !== currentIndex) {

            // Pick a remaining element
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = that.cards[currentIndex];
            that.cards[currentIndex] = that.cards[randomIndex];
            that.cards[randomIndex] = temporaryValue;

            // Update zindex
            that.cards[currentIndex].el.css({
                zIndex: currentIndex * -1
            });
        }
    }
});