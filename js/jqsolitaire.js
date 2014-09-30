/**
 * JQsolitaire - Main Class
 * jqsolitaire.js
 * (c) 2010, Jimbo Quijano
 */

var JQsolitaire = Class.extend({

    // Initialize
    init: function(options) {
        var that = this;

        // Default settings
        var defaults = {};

        // Construct final settings
        that.settings = $.extend({}, defaults, options);
    },

    // Start game
    start: function() {
        var that = this;

        // Create new deck
        that.deck = new Slot({
            el: $('#deck')
        });

        // Create new stack
        that.stack = new Slot({
            el: $('#stack')
        });

        // Create new columns
        that.columns = [];
        for (var i = 0; i < 7; i++) {
            that.columns.push(new Slot({
                el: $('#col' + i),
                cascade: true
            }))
        };

        // Create new aces
        that.aces = [];
        for (var i = 0; i < 4; i++) {
            that.aces.push(new Slot({
                el: $('#aces' + i),
                cascade: false
            }))
        };

        // Populate table
        that.populate();
    },

    // Populate all cards
    populate: function() {
        var that = this;
        var count = 0;

        // Contruct cards
        for (var i = 1; i <= 13; i++) {
            for (var j = 1; j <= 4; j++) {

                // Create new card
                var card = new Card({
                    value: i,
                    suit: j
                });

                // Place to deck
                card.place({
                    slot: that.deck, 
                    face: 'facedown'
                });

                // Add card to deck
                that.deck.add(card);
            };
        };

        // Randomize deck
        that.deck.shuffle();

        // Stack cards
        that.stackCards(count);
    },

    // Place cards to stack
    stackCards: function(count) {
        var that = this;

        // Place cards to stack
        for (var h = 1; h <= 24; h++) {
            var card = that.deck.cards[count];

            // Move cards with callback
            if (h == 24) {
                card.move({
                    slot: that.stack, 
                    count: count,
                    callback: function(count) {
                        that.columnCards(count + 1);
                        that.displayAces();
                    }
                });
            }

            // Move cards
            else {
                card.move({
                    slot: that.stack, 
                    count: count,
                    basespeed: 25
                });
            }

            // Add card to stack
            that.stack.add(card);

            // Increase count
            count++;
        };
    },

    // Place cards to columns
    columnCards: function(count) {
        var that = this;

        // Place cards to columns
        for (var k = 1; k <= 7; k++) {
            for (var l = 1; l <= k; l++) {
                var col = that.columns[k - 1];
                var card = that.deck.cards[count];

                // Move and flip last card
                if (l == k) { 
                    card.move({
                        slot: col, 
                        count: count, 
                        face: 'faceup',
                        basespeed: 25
                    });
                } 

                // Move card
                else { 
                    card.move({
                        slot: col, 
                        count: count,
                        basespeed: 25
                    });
                }

                // Add card to slot
                col.add(card);

                // Increase count
                count++;
            }
        }
    },

    // Display aces
    displayAces: function() {
        var that = this;

        // Iterate each aces slot
        for (var i = 0; i < that.aces.length; i++) {
            var ace = that.aces[i];
            ace.settings.el.find('span').fadeIn();
        };
    }
});