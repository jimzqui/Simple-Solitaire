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

            // Card suits
            var card_suits = ['Spades', 'Hearts', 'Clubs', 'Diamonds'];

            // Card names
            var card_names = ['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King'];

            // Default settings
            var defaults = {
                el: 'solitaire',
                width: 677,
                height: 550,
                card_suits: card_suits,
                card_names: card_names,
                cards: []
            };

            // Construct final settings
            var settings = $.extend({}, defaults, options);

            // Map settings to root
            $.each(settings, function(index, value) {
                that[index] = value;
            });

            // Create canvas
            that.create();
        },

        // Create canvas
        create: function() {
            var that = this;

            // Create canvas
            var html = '<div id="' + that.el + '"></div>';
            that.el = $(html).appendTo('body');

            // Style canvas
            that.el.css({
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: that.width,
                height: that.height,
                marginLeft: (that.width / 2) * -1,
                marginTop: (that.height / 2) * -1
            });

            // Canvas offset
            that.offset = that.el.offset();

            // Populate cards
            that.populate();
        },

        // Create cards
        populate: function() {
            var that = this;

            // Empty cards
            that.cards = [];

            // Contruct cards
            for (var i = 0; i < that.card_names.length; i++) {
                for (var j = 0; j < that.card_suits.length; j++) {

                    // Create new card
                    var card = new Card({
                        name: that.card_names[i],
                        suit: that.card_suits[j],
                        zindex: i + j,
                    });

                    // Add card to container
                    that.cards.push(card);
                };
            };
        },

        // Start game
        start: function() {
            var that = this;

            // Get cards
            var cards = that.cards;

            // Place cards to deck
            that.deck.addCards(cards, function() {
                that.deck.shuffle();
                that.populateStack();
            });
        },

        // Reset game
        restart: function() {
            var that = this;

            // Hide restart button
            that.deck.inner.hide();
            that.deck.animate = false;

            // Remove all card event
            for (var i = 0; i < that.cards.length; i++) {
                var card = that.cards[i];
                card.flip('facedown', 0);
                card.removeCollision();
                card.removeEvents();
            };

            // Transfer cards to deck
            that.stack.transfer(that.deck);
            that.browse.transfer(that.deck);
            that.stack.status = null;
            that.browse.status = null;

            // Transfer ace cards to deck
            for (var j = 0; j < 4; j++) {
                var ace = that.aces[j];
                ace.transfer(that.deck);
                ace.status = null;
            };

            // Transfer col cards to deck
            for (var k = 0; k < 7; k++) {
                var column = that.columns[k];
                column.transfer(that.deck);
                column.status = null;
            };

            // Repopulate slots
            that.deck.shuffle();
            that.populateStack();
        },

        // Place cards to stack
        populateStack: function() {
            var that = this;

            // Get cards
            var cards = that.deck.pickCards(24);

            // Place cards to stack
            that.stack.addCards(cards, function() {
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
                column.status = 'placed';

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
                        ace.inner.fadeIn();
                    }, timeout);
                })(timeout, ace);
            };

            // Iterate each columns slot
            for (var i = 0; i < that.columns.length; i++) {
                var column = that.columns[i];
                var timeout = i * column.anim.interval;

                (function(timeout, column) {
                    setTimeout(function() {
                        column.inner.fadeIn();
                    }, timeout);
                })(timeout, column);
            };

            // Fade in inner contents
            that.deck.inner.fadeIn();
            that.stack.inner.fadeIn();

            // Check for deck click
            that.deck.el.css({ cursor: 'pointer '});
            that.deck.el.unbind('click');
            that.deck.el.click(function() {
                that.restart();
            });

            // Add events to each cards
            for (var j = 0; j < that.cards.length; j++) {
                var card = that.cards[j];
                card.addCollision(that.columns);
                card.addEvents(that.aces);
            };

            // Reset stack cards
            that.stack.reset(that.browse);
        }
    });

    // Return class
    return Solitaire;
});