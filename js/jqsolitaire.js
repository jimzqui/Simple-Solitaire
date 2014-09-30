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
        that.offtable = new Slot({
            el: $('#offtable')
        });

        // Create slots
        that.columns = [];
        for (var i = 0; i < 7; i++) {
            that.columns.push(new Slot({
                el: $('#col' + i),
                cascade: true
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
                card.place(that.offtable, 'facedown');
                card.move(that.deck, 'facedown', count);
                that.deck.add(card);

                // Increase count
                count++;
            };
        };

        // Contruct cards for columns
        for (var k = 1; k <= 7; k++) {
            for (var l = 1; l <= k; l++) {
                var col = that.columns[k - 1];
                var card = that.deck.pick();

                if (l == k) { var face = 'faceup'; } 
                else { var face = 'facedown'; }

                // Move card
                card.move(col, face, count);
                col.add(card);

                // Increase count
                count++;
            }
        }
    }
});