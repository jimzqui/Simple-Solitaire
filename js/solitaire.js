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
            var defaults = {
                canvas: 'solitaire',
                width: 677,
                height: 550,
                card: {
                    width: 71,
                    height: 96
                },
                slot: {
                    distance_x: 30,
                    distance_y: 50
                }
            };

            // Construct final settings
            that.settings = $.extend({}, defaults, options);

            // Create canvas and cards
            that.createCanvas();
            that.createCards();
        },

        // Create canvas
        createCanvas: function() {
            var that = this;

            // Create canvas
            var html = '<div id="' + that.settings.canvas + '"></div>';
            that.el = $(html).appendTo('body');

            // Style canvas
            that.el.css({
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: that.settings.width,
                height: that.settings.height,
                marginLeft: (that.settings.width / 2) * -1,
                marginTop: (that.settings.height / 2) * -1
            });

            // Canvas offset
            that.offset = that.el.offset();
        },

        // Create cards
        createCards: function() {
            var that = this;

            // Create container
            that._cards = [];

            // Contruct cards
            for (var i = 1; i <= 13; i++) {
                for (var j = 1; j <= 4; j++) {

                    // Create new card
                    var card = new Card({
                        value: i,
                        suit: j
                    }).create(that);

                    // Add card to container
                    that._cards.push(card);

                    // Listen for car move
                    that.listenCardMove(card);
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
                that.stack.reset(that.browse);
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

            // Fade in inner contents
            that.deck.inner.fadeIn();
            that.stack.inner.fadeIn();
        },

        // Compute slot positions
        computeOffset: function(x, y) {
            var that = this;

            // Compute data
            var size_x = x * that.settings.card.width;
            var dist_x = x * that.settings.slot.distance_x;
            var size_y = y * that.settings.card.height;
            var dist_y = y * that.settings.slot.distance_y;
            var pos_x = size_x + dist_x;
            var pos_y = size_y + dist_y;

            return {
                left: pos_x,
                top: pos_y
            }
        },

        // Add events to card
        listenCardMove: function(card) {
            var that = this;

            // Check if card is grabbed
            card.el.unbind('mousedown');
            card.el.mousedown(function(e) { 
                if (card.face == 'facedown') return;

                // Get mouse offset
                var x = e.pageX - card.offset.left;
                var y = e.pageY - card.offset.top;

                // Grab card
                card.grab(x, y, function(offset) {
                    for (var i = 0; i < that.columns.length; i++) {
                        var column = that.columns[i];
                        column.collide = that.getCollision(column, card, offset);
                    };
                });

                // Other cards
                if (card.last != true) {
                    var count = 1;
                    var column_active = that.columns[card.col_num];
                    for (var i = card.pos + 1; i < column_active.cards.length; i++) {
                        var card_active = column_active.cards[i];

                        // Grab card
                        card_active.grab(x, y - (count * 20));
                        count++;
                    };
                }
            });

            // Check if card is released
            card.el.unbind('mouseup');
            card.el.mouseup(function(e) { 
                if (card.face == 'facedown') return;

                // Implement current collisions
                for (var i = 0; i < that.columns.length; i++) {
                    var column = that.columns[i];
                    if (column.collide != null) {

                        // Switch card to different column
                        column.collide.card.switch(column.collide, function() {
                            column.collide = null;
                        });

                        // Other cards
                        if (card.last != true) {
                            var count = 1;
                            var column_active = that.columns[card.col_num];
                            for (var i = card.pos + 1; i < column_active.cards.length; i++) {
                                var card_active = column_active.cards[i];

                                // Switch other cards to different column
                                card_active.switch(column.collide);
                            };
                        }

                        return;
                    }
                };

                // Return all cards
                var column_active = that.columns[card.col_num];
                for (var i = card.pos; i < column_active.cards.length; i++) {
                    var card_active = column_active.cards[i];

                    // Return card
                    card_active.return();
                };
            });
        },

        // Get any card collision
        getCollision: function(slot, card, offset) {
            var that = this;

            // Something collided with the card
            if (card.isCollide(slot.last, offset) == true) {

                // Make sure not its own slot
                if (slot.col_num != card.col_num) {
                    return {
                        slot1: that.columns[card.pos],
                        slot2: slot,
                        card: card
                    };
                } 
            }

            return null;
        }
    });

    // Return class
    return Solitaire;
});