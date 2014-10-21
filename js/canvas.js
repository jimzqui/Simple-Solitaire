/**
 * JQcards - Canvas
 * canvas.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['class'], function(Class) {

    // Create new Canvas Class
    var Canvas = Class.extend({

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
                cards_dir: 'cards/default/',
                themes_dir: 'themes/default/',
                moves: [],
                slots: {}
            };

            // Construct final settings
            var settings = $.extend({}, defaults, options);

            // Map settings to root
            $.each(settings, function(index, value) {
                that[index] = value;
            });

            // Retrieve cards map
            $.getScript(that.cards_dir + 'cards.js', function(data) {
                that.cardmap = cardmap;
            });

            // Create canvas
            that._create();
            that._events();
            that.render();
            return;
        },

        // Create slots
        renderSlots: function(obj) {
            var that = this;

            // Save settings for laters
            that.slotSettings = obj;

            // Create and draw slots in canvas
            $.each(obj, function(name, opt) {
                var slot = opt.slot;
                var tile = opt.tile;

                if (tile instanceof Array) {
                    for (var i = 0; i < tile.length; i++) {
                        that.slots[name + i] = new slot({
                            canvas: that,
                            name: name + i,
                            group: name,
                            position: {
                                left: tile[i].split('-')[0],
                                top: tile[i].split('-')[1]
                            }
                        });
                    };
                } else {
                    that.slots[name] = new slot({
                        canvas: that,
                        name: name,
                        group: name,
                        position: {
                            left: tile.split('-')[0],
                            top: tile.split('-')[1]
                        }
                    });
                }
            });
        },

        // Render cards
        renderCards: function(obj, callback) {
            var that = this;
            var orders = {};

            // Save settings for laters
            that.cardSettings = obj;

            // Create/transfer cards in slots
            $.each(obj, function(to_name, opt) {
                if(opt.create != undefined) {
                    that.createCards({
                        to: to_name,
                        card: opt.create
                    });
                } else {
                    if (orders[opt.from] == undefined) {
                        orders[opt.from] = [];
                    }

                    if (opt.pick instanceof Array) {
                        for (var i = 0; i < opt.pick.length; i++) {
                            orders[opt.from].push({
                                name: to_name + i,
                                size: opt.pick[i]
                            });
                        };
                    } else {
                        orders[opt.from].push({
                            name: to_name,
                            size: opt.pick
                        });
                    }
                }
            });

            // Transfer cards
            $.each(orders, function(from_name, order) {
                that.placeCards({
                    from: from_name, 
                    order: order
                });
            });
        },

        // Restart canvas
        restart: function(callback) {
            var that = this;

            // Destroy all cards
            that.destroyCards();

            // Rerender cards
            that.renderCards(that.cardSettings, callback);
        },

        // Destroy all cards
        destroyCards: function() {
            var that = this;
            var cards = [];

            // Empty all cards in slots
            $.each(that.slots, function(name, slot) {
                cards = cards.concat(slot.pickRandom(slot.cardCount()));
            });

            // Destroy all cards
            for (var i = cards.length - 1; i >= 0; i--) {
                var card = cards[i];
                card.el.remove();
            };

            // Reset infos
            that.rendered = false;
            that.moves = [];
        },

        // Create cards
        createCards: function(obj) {
            var that = this;
            var cards = [];
            var maps = [];
            var started = false;

            // Create cards based on cards map
            for (var i = 0; i < that.cardmap.map.length; i++) {
                var row = that.cardmap.map[i];
                for (var j = 0; j < row.length; j++) {
                    var map = row[j];
                    var num = map.split(' ')[0];
                    var suit = map.split(' ')[1];

                    // Start pushing cards when start map shows
                    if (that.cardmap.render.start == map || started == true) {
                        started = true;
                        maps.push({
                            num: num,
                            suit: suit,
                            map: [j, i]
                        });
                    }


                    // Stop pushing cards when stop map show
                    if (that.cardmap.render.end == map) {
                        started = false;
                        maps.push({
                            num: num,
                            suit: suit,
                            map: [j, i]
                        });
                    }

                    // Get facedown map
                    if (that.cardmap.render.back == map) {
                        var facedown_map = [j, i];
                    }
                };
            };

            // Create cards based on cards map
            for (var k = 0; k < maps.length; k++) {
                var card = maps[k];
                cards.push(new obj.card({
                    canvas: that,
                    num: card.num,
                    suit: card.suit,
                    faceup_map: card.map,
                    facedown_map: facedown_map
                }));
            };

            // Double shuffle cards
            var cards = that.shuffleCards(that.shuffleCards(cards));

            // Place cards
            that.slots[obj.to].animate = false;
            that.slots[obj.to].addCards(cards);
        },

        // Shuffle cards
        shuffleCards: function(cards) {
            var that = this;
            var cur_index = cards.length, temp_value, rand_index ;

            // While there remain elements to shuffle
            while (0 !== cur_index) {

                // Pick a remaining element
                rand_index = Math.floor(Math.random() * cur_index);
                cur_index -= 1;

                // And swap it with the current element
                temp_value = cards[cur_index];
                cards[cur_index] = cards[rand_index];
                cards[rand_index] = temp_value;

                // Update zindex
                cards[cur_index].el.css({
                    zIndex: cur_index * -1
                });
            }

            return cards;
        },

        // Transfer and place cards to slots
        placeCards: function(obj, i) {
            var that = this;

            // Default i to 0
            if (i == undefined) {
                i = 0;
            }

            // Get cards
            var name = obj.order[i].name;
            var slot = that.slots[name];
            var cards = that.slots[obj.from].getCards(obj.order[i].size, true);

            // Place cards to slot
            slot.addCards(cards, function() {
                if (i == obj.order.length - 1) {
                    that.rendered = true;
                    that.afterStart();
                } else {
                    that.placeCards(obj, i + 1);
                }
            });
        },

        // Set browse slot
        setBrowse: function(obj) {
            var that = this;
            var map = [1, 0];
            var pos_x = map[0] * that.tile.width;
            var pos_y = map[1] * that.tile.height;
            that.slots[obj.to].browse_size = obj.size;
            that.slots[obj.from].browse_to = that.slots[obj.to];
            that.slots[obj.to].browse_from = that.slots[obj.from];
            that.slots[obj.from].inner.css({
                backgroundPosition: '-' + pos_x + 'px -' + pos_y + 'px'
            });
        },

        // Set checkin slots
        setCheckin: function(obj) {
            var that = this;
            var count = 2;
            $.each(obj, function(suit, name) {
                var map = [count, 0];
                var pos_x = map[0] * that.tile.width;
                var pos_y = map[1] * that.tile.height;
                that.slots[name].checkin = suit;
                that.slots[name].inner.css({
                    backgroundPosition: '-' + pos_x + 'px -' + pos_y + 'px'
                });
                count++;
            });
        },

        // Flip every last cards of group
        flipLast: function(group, callback) {
            var that = this;
            var count = 0;

            // Iterate slots and find the group
            $.each(that.slots, function(name, slot) {
                if (slot.group == group) {
                    var timeout = count * slot.anim.interval;
                    (function(timeout, slot, count) {
                        setTimeout(function() {
                            if (count == 6) {
                                slot.last.flip();
                                if (callback) callback();
                            } else {
                                slot.last.flip();
                            }
                        }, timeout);
                    })(timeout, slot, count);
                    count++;
                }
            });
        },

        // Change anim settings of group
        changeAnim: function(group, anim) {
            var that = this;

            // Iterate slots and find the group
            $.each(that.slots, function(name, slot) {
                if (slot.group == group) {
                    slot.anim = anim;
                }
            });
        },

        // Register move
        registerMove: function(move) {
            var that = this;

            // Check if allowed to register
            if (that.rendered == true) {
                that.moves.push(move);
            }
        },

        // Undo last move
        undoMove: function() {
            var that = this;

            // Return if no moves registered
            if (that.moves.length == 0) return;

            // Get last move
            var move = that.moves[that.moves.length - 1];

            switch(move.action) {
                case 'switchCards': that._undoSwitch(move); break;
                case 'browseCards': that._undoBrowse(move); break;
                case 'resetCards': that._undoReset(move); break;
                case 'checkin': that._undoCheckin(move); break;
                case 'open': that._undoOpen(move); break;
            }

            // Remove last move
            that.moves.pop(); 
        },

        // Undo switch cards
        _undoSwitch: function(move) {
            var that = this;

            // Create container
            var cards = [];

            // Retrieve cards back
            for (var i = 0; i < move.actor.length; i++) {
                var slot = move.actor[i].slot;
                var card = slot.cards[slot.cardCount() - 1];
                slot.removeCards(card);
                cards.push(card);
            };

            // Transfer cards to origin
            move.origin.addCards(cards.reverse());
        },

        // Undo reset cards
        _undoReset: function(move) {
            var that = this;

            // Create container
            var cards = [];

            // Retrieve cards back
            for (var i = 0; i < move.actor.length; i++) {
                var slot = move.actor[i].slot;
                var card = slot.cards[slot.cardCount() - 1];
                card.flip(0.15);
                slot.removeCards(card);
                cards.push(card);
            };

            // Transfer cards to origin
            move.origin.addCards(cards.reverse());
        },

        // Undo browse cards
        _undoBrowse: function(move) {
            var that = this;

            // Move back browsed cards
            move.origin.unbrowseCards();
        },

        // Undo card checkin
        _undoCheckin: function(move) {
            var that = this;

            // Retrieve card back
            var slot = move.actor.slot;
            var card = slot.cards[slot.cardCount() - 1];
            slot.removeCards(card);

            // Transfer card to origin
            card.el.animate({ zIndex: 999 }, 0);
            move.origin.addCards(card);
        },

        // Undo card open
        _undoOpen: function(move) {
            var that = this;

            // Close back card
            move.actor.close()
        },

        // Render events
        _events: function() {
            var that = this;

            // Unbind events
            that.el.off();

            // Iterate each events
            $.each(that.events, function(index, value) {
                var event = index.split(' ')[0];
                var elem = index.split(' ')[1];
                var action = value;

                // Bind event to elem
                $('body').on(event, elem, function(e) {
                    that[action](e);
                });
            });
        },

        // Create canvas
        _create: function() {
            var that = this;

            // Compute canvas width and height
            var size_x = that.tile.size.split('x')[0];
            var size_y = that.tile.size.split('x')[1];
            that.width = (size_x * that.tile.width) + ((size_x - 1) * that.tile.x_space);
            that.height = (size_y * that.tile.height) + ((size_y - 1) * that.tile.y_space);

            // Create canvas
            var html = '<div id="' + that.el + '"></div>';
            that.el = $(html).appendTo('body');

            // Add background
            $('body').css({
                background: 'url(' + that.themes_dir + 'bg.jpg) repeat',
                backgroundPosition: 'center 0'
            });

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
        }
    });

    // Return class
    return Canvas;
});