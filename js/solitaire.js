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
                el: 'solitaire',
                width: 677,
                height: 550
            };

            // Construct final settings
            var settings = $.extend({}, defaults, options);

            // Extend parent settings
            that._super(settings);
            return;
        },

        // Render canvas
        render: function() {
            var that = this;

            // Create slots
            that.renderSlots({
                'Deck': { slot: Deck, tile: '3-3' },
                'Stack': { slot: Stack, tile: '0-0' },
                'Browse': { slot: Browse, tile: '1-0' },
                'Aces': { slot: Aces, tile: ['3-0', '4-0', '5-0', '6-0'] },
                'Column': { slot: Column, tile: ['0-1', '1-1', '2-1', '3-1', '4-1', '5-1', '6-1'] }
            });

            // Render cards
            that.renderCards({
                'Deck': { create: Card },
                'Stack': { pick: 24, from: 'Deck' }, 
                'Column': { pick: [1, 2, 3, 4, 5, 6, 7], from: 'Deck' }
            });
        },

        // After render of cards
        afterRender: function() {
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
        }
    });

    // Return class
    return Solitaire;
});