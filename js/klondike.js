/**
 * JQcards - Klondike
 * klondike.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['quard', 'stack', 'browse', 'foundation', 'column', 'deck', 'bicycle'], function(Quard, Stack, Browse, Foundation, Column, Deck, Bicycle) {

    // Create new Klondike Class
    var Klondike = Quard.canvas.extend({

        // Settings
        settings: {
            tile: {
                size: '7x5',
                width: 71,
                height: 96,
                x_space: 30,
                y_space: 30
            },
            body: 'body',
            el: 'klondike'
        },

        // File cache
        filecache: true,

        // Templates
        templates: {
            dist: 'quard/templates/',
            list: ['intro', 'system', 'win', 'themes']
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
            'click .btn-undo': 'undoLast',
            'click .btn-themes': 'themesPane',
            'click .theme-item': 'themesUpdate'
        },

        // Win condition
        winCondition: {
            'Foundation': 'full faceup'
        },

        // Game ends
        gameWin: function(time, moves) {
            var that = this;

            // Hide system btns
            $('#system').fadeOut('fast', function() {

                // Destroy cards
                that.destroyCards();

                // Display win in panel
                var html = that.getTemplate('win', {
                    time: time,
                    moves: moves
                });
                that.panel.content(html);
                that.panel.open();
            });
        },

        // Load intro
        intro: function() {
            var that = this;

            // Display intro in panel
            var html = that.getTemplate('intro');
            that.panel.content(html);
            that.panel.open();
        },

        // Start canvas
        start: function() {
            var that = this;

            // Close panel
            that.panel.close(function() {

                // Create slots
                that.renderSlots({
                    'Deck': { slot: Deck, tile: '3-3' },
                    'Stack': { slot: Stack, tile: '0-0' },
                    'Browse': { slot: Browse, tile: '1-0' },
                    'Foundation': { slot: Foundation, tile: ['3-0', '4-0', '5-0', '6-0'] },
                    'Column': { slot: Column, tile: ['0-1', '1-1', '2-1', '3-1', '4-1', '5-1', '6-1'] }
                });

                // Display system template
                var html = that.getTemplate('system');
                var block = $(html).appendTo(that.body);
                block.animate({ bottom: 0 });
            });
        },

        // Restart canvas
        restart: function() {
            var that = this;

            // Close panel
            that.panel.close(function() {
                that.resetCards();
                that.stopTimer();
                $('#system').fadeIn('fast');
            });
        },

        // After slots are created
        slotsRendered: function() {
            var that = this;

            // Render cards
            that.renderCards(Bicycle, {
                'Stack': 24,
                'Column': [1, 2, 3, 4, 5, 6, 7]
            });

            // Hide deck slot
            that.slots['Deck'].el.hide();
        },

        // After cards are placed
        cardsRendered: function() {
            var that = this;
            var count = 0;

            // Open last cards in column
            $.each(that.slots, function(name, slot) {
                if (slot.group == 'Column') {
                    var timeout = count * slot.anim.interval;
                    (function(timeout, slot, count) {
                        setTimeout(function() {
                            if (slot.last != undefined) {
                                slot.last.open();
                            }
                        }, timeout);
                    })(timeout, slot, count);
                    count++;
                }
            });

            // Display themes in panel
            var html = that.getTemplate('themes');
            that.panel.content(html);

            // Start timer
            that.startTimer('#timer');
        },

        // Card dropped event
        cardDropped: function(action, actors, origin) {
            var that = this;

            // Register move
            that.registerMove(action, actors, origin);
        },

        // Slot clicked
        slotClicked: function(slot) {
            var that = this;

            // On click, reset stack if empty
            if (slot.name = 'Stack' && slot.cardCount() == 0) {
                slot.unbrowseCards();
            }
        },

        // Slot decreased
        slotDecreased: function(slot, cards) {
            var that = this;

            // Open last card of columns
            if (slot.group == 'Column') {
                if (slot.last != undefined && slot.last.face == 'facedown') {
                    slot.last.flip();
                }
            }
        },

        // Move undid
        moveUndid: function(move) {
            var that = this;

            // Close prev last card of columns
            if (move.action == 'switch' || move.action == 'checkIn') {
                if (move.origin.group == 'Column') {
                    var card = (move.actors[0] == undefined) ? move.actors : move.actors[0];
                    var last = move.origin.cards[card.index - 1];
                    var faceup = move.origin.countFace('faceup') - move.actors.length;
                    if (last != undefined && faceup == 1) {
                        last.close();
                    }
                }
            }
        },

        // Open themes pane
        themesPane: function() {
            var that = this;

            // Open/close panel
            if (that.panel.status == 'opened') {
                that.panel.close();
                that.unpauseTimer();
            } else {
                that.panel.open();
                that.pauseTimer();
            }
        },

        // Update theme
        themesUpdate: function(el) {
            var that = this;

            if (el.is('.current')) return;
            that.changeTheme(el.data('theme'));

            // Update current item
            $('.theme-item').removeClass('current');
            el.addClass('current');
        }
    });

    // Return class
    return Klondike;
});