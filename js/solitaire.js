/**
 * JQcards - Solitaire
 * solitaire.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['quard', 'stack', 'browse', 'aces', 'column', 'deck'], function(Quard, Stack, Browse, Aces, Column, Deck) {

    // Create new Solitaire Class
    var Solitaire = Quard.canvas.extend({

        // Settings
        settings: {
            tile: {
                size: '7x5',
                width: 71,
                height: 96,
                x_space: 30,
                y_space: 30
            },
            el: 'solitaire'
        },

        // File cache
        filecache: true,

        // Templates
        templates: {
            dist: 'quard/templates/',
            list: ['intro', 'system', 'win']
        },

        // Themes
        themes: {
            current: 'default',
            dist: 'quard/themes/',
            list: ['default', 'blue', 'red', 'pink', 'wildwest', 'wood']
        },

        // Events
        events: {
            'click .btn-start': 'start',
            'click .btn-restart': 'restart',
            'click .btn-undo': 'undoMove',
            'click .btn-themes': 'themesPane'
        },

        // Win condition
        winCondition: {
            'Aces': 'full faceup'
        },

        // Start game
        gameStart: function() {
            var that = this;

            // Show intro template
            var html = that.getTemplate('intro');
            $('body').append(html);
        },

        // Game ends
        gameWin: function(time, moves) {
            var that = this;

            // Hide system btns
            $('#system').fadeOut('fast', function() {

                // Hide columns
                $.each(that.slots, function(name, slot) {
                    if (slot.group == 'Column') {
                        slot.el.hide();
                    }
                });

                // Load win template
                var html = that.getTemplate('win', {
                    time: time,
                    moves: moves
                });

                // Display win template
                $('body').append(html);
            });
        },

        // Start canvas
        start: function() {
            var that = this;

            // Fadeout intro and start rendering stuffs
            $('#intro').fadeOut('fast', function() {
                $(this).remove();

                // Create slots
                that.renderSlots({
                    'Deck': { slot: Deck, tile: '3-3' },
                    'Stack': { slot: Stack, tile: '0-0' },
                    'Browse': { slot: Browse, tile: '1-0' },
                    'Aces': { slot: Aces, tile: ['3-0', '4-0', '5-0', '6-0'] },
                    'Column': { slot: Column, tile: ['0-1', '1-1', '2-1', '3-1', '4-1', '5-1', '6-1'] }
                });

                // Render cards
                that.renderCards('Deck', {
                    'Stack': 24,
                    'Column': [1, 2, 3, 4, 5, 6, 7]
                });

                // Hide deck slot
                that.slots['Deck'].el.hide();
            });
        },

        // Restart canvas
        restart: function() {
            var that = this;

            // Show columns again
            $.each(that.slots, function(name, slot) {
                if (slot.group == 'Column') {
                    slot.el.show();
                }
            });

            // Hide and remove win template
            if ($('#win').length == 0) {

                // Reset cards
                that.resetCards();
                that.stopTimer();
                return;
            }

            $('#win').fadeOut('fast', function() {
                $(this).remove();

                // Reset cards
                that.resetCards();
                that.stopTimer();
            });
        },

        // After cards are placed
        cardsRendered: function() {
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
            var html = that.getTemplate('system');

            if ($('#timer').length == 0) {
                $('body').append(html);
            }

            // Start timer
            that.startTimer('#timer');
        },

        // Card dropped event
        cardDropped: function(action, actors, origin) {
            var that = this;

            // Register move
            that.registerMove(action, actors, origin);
        },

        // Card dropped event
        cardFlipped: function(action, actors, origin) {
            var that = this;

            // Register move
            if (action = 'open') {
                that.registerMove(action, actors, origin);
            }
        },

        // Open themes pane
        themesPane: function() {
            var that = this;

            // Hide/display pane
            if ($('#themespane').is(':visible')) {
                $('#themespane').fadeOut();
            } else {
                $('#themespane').fadeIn();
            }

            // Change theme on item click
            $('.theme-item').click(function() {
                if ($(this).is('.current')) return;
                that.changeTheme($(this).data('theme'));

                // Update current item
                $('.theme-item').removeClass('current');
                $(this).addClass('current');
            });
        }
    });

    // Return class
    return Solitaire;
});