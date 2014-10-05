/**
 * JQcards - Solitaire
 * solitaire.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['card', 'class'], function(Card, Class) {

    // Create new Solitaire Class
    var Solitaire = Class.extend({

        // Initialize
        init: function(options) {
            var that = this;

            // Default settings
            var defaults = {};

            // Construct final settings
            that.settings = $.extend({}, defaults, options);

            // Create container
            that._cards = [];

            // Contruct cards
            for (var i = 1; i <= 13; i++) {
                for (var j = 1; j <= 4; j++) {

                    // Create new card
                    var card = new Card({
                        value: i,
                        suit: j
                    });

                    // Add card to container
                    that._cards.push(card);
                };
            };
        },

        // Start game
        start: function() {
            var that = this;

            // Deck cards
            that.populateDeck();
        },

        // Place cards to slot
        placeCards: function(slot, cards, callback) {
            var that = this;

            // Place cards to slot
            slot.addCards(cards, function() {
                if (callback) callback();
            });
        },

        // Place cards to deck
        populateDeck: function() {
            var that = this;

            // Get cards
            var cards = that._cards;

            // Place cards to deck
            that.placeCards(that.deck, cards, function() {

                // Shuffle slot
                that.deck.shuffle();

                // Stack cards
                that.populateStack();
            });
        },

        // Place cards to stack
        populateStack: function() {
            var that = this;

            // Get cards
            var cards = that.deck.pickCards(24);

            // Place cards to stack
            that.placeCards(that.stack, cards, function() {

                // Stack cards
                that.populateColumns(1);
            });
        },

        // Place cards to columns
        populateColumns: function(i) {
            var that = this;

            // Get cards
            var cards = that.deck.pickCards(i);

            // Place cards to column
            that.columns[i - 1].addCards(cards, function() {
                if (i == 7) {
                    that.flipLast();
                    that.showInner();
                    that.listenCards();
                } else {
                    that.populateColumns(i + 1);
                }
            });
        },

        // Flip cards in column
        flipLast: function() {
            var that = this;

            // Iterate each column
            for (var i = 0; i < that.columns.length; i++) {
                var column = that.columns[i];
                var card = column.cards[column.cards.length - 1];
                var timeout = i * column.anim.interval;

                (function(timeout, card) {
                    setTimeout(function() {
                        card.flip('faceup');
                    }, timeout);
                })(timeout, card);
            };
        },

        // Display inner contents
        showInner: function() {
            var that = this;

            // Iterate each aces slot
            for (var i = 0; i < that.aces.length; i++) {
                var ace = that.aces[i];
                var timeout = i * ace.anim.interval;

                (function(timeout, ace) {
                    setTimeout(function() {
                        ace.el.find('span').fadeIn();
                    }, timeout);
                })(timeout, ace);
            };

            // Fade in inner contents
            that.deck.el.find('span').fadeIn();
            that.stack.el.find('span').fadeIn();
        },

        // Listen for card events
        listenCards: function() {
            var that = this;

            // Last stack cards
            that.stack.last.el.click(function() {
                that.stack.browse(that.browse);
            });
        }
    });

    // Return class
    return Solitaire;
});