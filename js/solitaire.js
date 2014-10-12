/**
 * JQcards - Solitaire
 * solitaire.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['canvas', 'deck', 'stack', 'browse', 'column', 'aces'], function(Canvas, Deck, Stack, Browse, Column, Aces) {

    // Create new Solitaire Class
    var Solitaire = Canvas.extend({

        // Initialize
        init: function(options) {
            var that = this;

            // Default settings
            var defaults = {
                el: 'solitaire',
                width: 677,
                height: 550,
                checkins: [],
                collisions: [],
                suits: ['Spades', 'Hearts', 'Clubs', 'Diamonds'],
                names: ['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King']
            };

            // Construct final settings
            var settings = $.extend({}, defaults, options);

            // Map settings to root
            $.each(settings, function(index, value) {
                that[index] = value;
            });

            // Create canvas
            that._create();
            return;
        },

        // Start game
        start: function() {
            var that = this;

            // Place cards to slots
            that.createSlots();
            that.setDefaults();
            that.populateCards();
        },

        // Reset game
        restart: function() {
            var that = this;

            // Hide restart button
            that.deck.inner.hide();
            that.deck.animate = false;

            // Transfer cards to deck
            that.stack.transfer(that.deck);
            that.browse.transfer(that.deck);

            // Transfer ace cards to deck
            for (var j = 0; j < 4; j++) {
                var ace = that.aces[j];
                ace.transfer(that.deck);
            };

            // Transfer col cards to deck
            for (var k = 0; k < 7; k++) {
                var column = that.columns[k];
                column.anim.speed = 500;
                column.anim.interval = 150;
                column.anim.ease = 20;
                column.transfer(that.deck);
            };

            // Repopulate cards
            that.deck.facedown();
            that.populateCards();
        },

        // Populate cards to slots
        populateCards: function() {
            var that = this;

            // Create slots
            var slots = [];
            
            // Push stack to list
            that.stack.pickcount = 24;
            slots.push(that.stack);

            // Push columns to list
            for (var i = 0; i < that.columns.length; i++) {
                var column = that.columns[i];
                column.pickcount = i + 1;
                slots.push(column);
            };

            // Populate cards
            that.render(slots, function() {
                that.flipLast();
            });
        },

        // Flip last cards
        flipLast: function() {
            var that = this;

            // Flip every last cards in column slots
            for (var i = 0; i < that.columns.length; i++) {
                var column = that.columns[i];
                var timeout = i * column.anim.interval;
                (function(timeout, column) {
                    setTimeout(function() {
                        column.flipLast();
                        column.anim.speed = 'fast';
                        column.anim.interval = 0;
                        column.anim.ease = 0;
                    }, timeout);
                })(timeout, column);
            };

            // Fade in deck
            that.deck.inner.fadeIn();
        },

        // Create slots
        createSlots: function() {
            var that = this;

            // Create new deck
            that.deck = new Deck({
                canvas: that,
                name: 'deck',
                position: {
                    left: 3,
                    top: 3
                }
            });

            // Create new stack
            that.stack = new Stack({
                canvas: that,
                name: 'stack',
                position: {
                    left: 0,
                    top: 0
                }
            });

            // Create new browse
            that.browse = new Browse({
                canvas: that,
                name: 'browse',
                position: {
                    left: 1,
                    top: 0
                }
            });

            // Create new columns
            that.columns = [];
            for (var i = 0; i < 7; i++) {
                that.columns.push(new Column({
                    canvas: that,
                    name: 'col' + i,
                    position: {
                        left: i,
                        top: 1
                    }
                }));
            };

            // Create new aces
            that.aces = [];
            for (var i = 0; i < 4; i++) {
                that.aces.push(new Aces({
                    canvas: that,
                    name: 'ace' + i,
                    position: {
                        left: 3 + i,
                        top: 0
                    }
                }));
            };
        },

        // Set defaults
        setDefaults: function() {
            var that = this;

            // Populate cards to deck
            that.deck.populate(that.suits, that.names);
            that.deck.inner.hide();
            that.deck.shuffle();

            // Set collisions & checkins
            that.collisions = that.columns;
            that.checkins = that.aces;
        }
    });

    // Return class
    return Solitaire;
});