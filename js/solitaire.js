/**
 * JQcards - Solitaire
 * solitaire.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['canvas', 'deck', 'stack', 'browse', 'column', 'aces', 'card'], function(Canvas, Deck, Stack, Browse, Column, Aces, Card) {

    // Create new Solitaire Class
    var Solitaire = Canvas.extend({

        // Initialize
        init: function(options) {
            var that = this;

            // Default settings
            var defaults = {
                tile: {
                    size: '7x5',
                    width: 71,
                    height: 96,
                    x_space: 30,
                    y_space: 30
                },
                el: 'solitaire',
                cards_dir: 'assets/cards/default/',
                themes_dir: 'assets/themes/default/',
            };

            // Construct final settings
            var settings = $.extend({}, defaults, options);

            // Extend parent settings
            that._super(settings);
            return;
        },

        // Events
        events: {
            'click #btn-start': 'start',
            'click #btn-restart': 'restart',
            'click #btn-undo': 'undoMove'
        },

        // Win condition
        winCondition: {
            'Aces': {
                count: 13,
                face: 'faceup'
            }
        },

        // Render canvas
        render: function() {
            var that = this;

            // Display intro
            that.loadTemplate('intro');
        },

        // Start canvas
        start: function() {
            var that = this;

            // Hide intro
            $('#intro').fadeOut('fast', function() {

                // Create slots
                that.renderSlots({
                    'Stack': { slot: Stack, tile: '0-0' },
                    'Browse': { slot: Browse, tile: '1-0' },
                    'Aces': { slot: Aces, tile: ['3-0', '4-0', '5-0', '6-0'] },
                    'Column': { slot: Column, tile: ['0-1', '1-1', '2-1', '3-1', '4-1', '5-1', '6-1'] }
                });

                // Render cards
                that.renderCards({
                    'Stack': { create: Card },
                    'Column': { pick: [1, 2, 3, 4, 5, 6, 7], from: 'Stack' }
                });
            });
        },

        // After start
        afterStart: function() {
            var that = this;

            // Flip last cards in column
            that.flipLast('Column');

            // Setup browse slot
            that.setBrowse({ 
                from: 'Stack', 
                to: 'Browse', 
                size: 3 
            });

            // Setup checkin slots
            that.setCheckin({
                'Spades': 'Aces0',
                'Hearts': 'Aces1',
                'Clubs': 'Aces2',
                'Diamonds': 'Aces3'
            });

            // Display system btns
            that.loadTemplate('system');
        }
    });

    // Return class
    return Solitaire;
});