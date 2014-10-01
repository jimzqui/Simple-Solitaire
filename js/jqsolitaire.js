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
            el: $('#deck'),
            animate: false
        });

        // Create new stack
        that.stack = new Slot({
            el: $('#stack')
        });

        // Create new browse
        that.browse = new Slot({
            el: $('#browse')
        });

        // Create new columns
        that.columns = [];
        for (var i = 0; i < 7; i++) {
            that.columns.push(new Slot({
                el: $('#col' + i),
                cascade: true,
                zindex: i + 1
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

        // Create container
        var deck_cards = [];

        // Contruct cards
        for (var i = 1; i <= 13; i++) {
            for (var j = 1; j <= 4; j++) {

                // Create new card
                var card = new Card({
                    value: i,
                    suit: j
                });

                // Add card to container
                deck_cards.push(card);
            };
        };

        // Place cards to deck
        that.deck.addCards(deck_cards, function() {

            // Shuffle deck
            that.deck.shuffle();

            // Stack cards
            that.placeStackCards();
        });
    },

    // Place cards to stack
    placeStackCards: function() {
        var that = this;

        // Create container
        var stack_cards = [];

        // Pick cards
        for (var i = 1; i <= 24; i++) {

            // Get random card from deck
            var card = that.deck.pickCard();

            // Add card to container
            stack_cards.push(card);
        };

        // Place cards to stack
        that.stack.addCards(stack_cards, function() {

            // Column Cards
            that.placeColumnCards(1);
        });
    },

    // Place cards to columns
    placeColumnCards: function(index) {
        var that = this;

        // Create container
        var slot_cards = [];

        // Pick cards
        for (var j = 1; j <= index; j++) {
            var column = that.columns[index - 1];
            var card = that.deck.pickCard();

            // Add card to container
            slot_cards.push(card);
        }

        // Place cards to column
        column.addCards(slot_cards, function() {
            if (index == 7) {
                that.displayAcesBlock();
                that.flipLastCards();
            } else {
                that.placeColumnCards(index + 1);
            }
        });
    },

    // Flip last cards
    flipLastCards: function() {
        var that = this;

        // Iterate each column
        for (var i = 0; i < that.columns.length; i++) {
            var column = that.columns[i];
            var card = column.cards[column.cards.length - 1];
            var timeout = i * column.anim_interval;

            (function(timeout, card) {
                setTimeout(function() {
                    card.flip('faceup');
                }, timeout);
            })(timeout, card);
        };
    },

    // Display aces
    displayAcesBlock: function() {
        var that = this;

        // Iterate each aces slot
        for (var i = 0; i < that.aces.length; i++) {
            var ace = that.aces[i];
            var timeout = i * ace.anim_interval;

            (function(timeout, ace) {
                setTimeout(function() {
                    ace.el.find('span').fadeIn();
                }, timeout);
            })(timeout, ace);
        };
    }
});