/*!
 * Quard Javascript Cards Library
 * http://quard.com/
 *
 * By Jimbo Quijano
 * https://github.com/jimzqui
 *
 * Copyright 2014
 * Released under the MIT license
 *
 * Thanks to John Resig for
 * Simple JS Inheritance and
 * Micro Templating
 */

(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
} (function($) {

    // Empty Quard
    var Quard = {};

    // Simple JS Inheritance
    Quard.class = function() {

        var initializing = false;
        var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

        // The base Class implementation (does nothing)
        this.Class = function(){};

        // Create a new Class that inherits from this class
        Class.extend = function(prop) {
            var _super = this.prototype;

            // Instantiate a base class (but only create the instance,
            // don't run the init constructor)
            initializing = true;
            var prototype = new this();
            initializing = false;

            // Copy the properties over onto the new prototype
            for (var name in prop) {

                // Check if we're overwriting an existing function
                prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn) {
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);        
                        this._super = tmp;
                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
            }

            // The dummy class constructor
            function Class() {

                // All construction is actually done in the init method
                if ( !initializing && this.init )
                    this.init.apply(this, arguments);
            }
       
            // Populate our constructed prototype object
            Class.prototype = prototype;

            // Enforce the constructor to be what we expect
            Class.prototype.constructor = Class;

            // And make this class extendable
            Class.extend = arguments.callee;

            return Class;
        };

        return Class;
    }();

    // Quard Canvas Class
    Quard.canvas = Quard.class.extend({

        // Settings
        settings: {
            tile: {
                size: '7x5',
                width: 71,
                height: 96,
                x_space: 30,
                y_space: 30
            },
            el: 'canvas'
        },

        // Initialize
        init: function(options) {
            var that = this;
            that.moves = [];
            that.slots = {};

            // Construct final settings
            var settings = $.extend({}, that.settings, options);

            // Map settings to root
            $.each(settings, function(index, value) {
                that[index] = value;
            });

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
                background: 'url(' + that.themes.dist + that.themes.current + '/bg.jpg) repeat',
                backgroundPosition: 'center 0'
            });

            // Style canvas
            that.el.css({
                position: 'absolute',
                top: $(document).height() / 2,
                left: $(document).width() / 2,
                zIndex: '1',
                width: that.width,
                height: that.height,
                marginLeft: (that.width / 2) * -1,
                marginTop: (that.height / 2) * -1
            });

            // Canvas offset
            that.offset = {
                top: $(document).height() / 2,
                left: $(document).width() / 2 
            };

            // Render events
            that._applyEvents();

            // Load files and templates
            that._loadFiles();

            return that;
        },

        // File cache
        filecache: true,

        // Template files
        templates: {
            dist: 'quard/templates/',
            list: []
        },

        // Theme
        themes: {
            dist: 'quard/themes/',
            current: 'default',
            list: [],
        },

        // Events
        events: {},

        // Win condition
        winCondition: {},

        // Create slots
        renderSlots: function(obj) {
            var that = this;
            var count = 0;

            // Save settings for laters
            that.slotSettings = obj;

            // Create and draw slots in canvas
            $.each(obj, function(name, opt) {

                // Extend options to defaults
                var settings = $.extend({}, {
                    slot: Quard.slot, 
                    tile: '0-0'
                }, opt);

                if (settings.tile instanceof Array) {
                    for (var i = 0; i < settings.tile.length; i++) {
                        that.slots[name + i] = new settings.slot({
                            canvas: that,
                            name: name + i,
                            group: name,
                            index: i,
                            position: {
                                left: settings.tile[i].split('-')[0],
                                top: settings.tile[i].split('-')[1]
                            }
                        });
                    };
                } else {
                    that.slots[name] = new settings.slot({
                        canvas: that,
                        name: name,
                        group: name,
                        position: {
                            left: settings.tile.split('-')[0],
                            top: settings.tile.split('-')[1]
                        }
                    });
                }
            });
            
            // Call event for clicking slot
            $.each(that.slots, function(name, slot) {
                count++;

                slot.el.css({ 
                    left: slot.offset.left + $(document).width()
                });

                if (count == Object.keys(that.slots).length) {
                    slot.el.animate({
                        left: slot.offset.left,
                    }, 1000, function() {

                        // Call event after slots are rendered
                        if ($.isFunction(that.slotsRendered) == true) {
                            that.slotsRendered();
                        }
                    });
                } else {
                    slot.el.animate({
                        left: slot.offset.left,
                        display: 'block'
                    }, 1000);
                }

                slot.el.on('click', function() {
                    if ($.isFunction(that.slotClicked) == true && that.rendered == true) {
                        that.slotClicked(slot);
                    }
                });
            });
        },

        // Render cards
        renderCards: function(from, obj) {
            var that = this;
            var orders = {};

            // Save settings for laters
            that._renderCache = {
                from: from,
                obj: obj
            };

            // Create cards
            that.slots[from].createCards();

            // Create/transfer cards in slots
            $.each(obj, function(slot_name, pick_size) {
                if (orders[from] == undefined) {
                    orders[from] = [];
                }

                if (pick_size instanceof Array) {
                    for (var i = 0; i < pick_size.length; i++) {
                        orders[from].push({
                            name: slot_name + i,
                            size: pick_size[i]
                        });
                    };
                } else {
                    orders[from].push({
                        name: slot_name,
                        size: pick_size
                    });
                }
            });

            // Transfer cards
            that.placeCards(orders);
        },

        // Transfer and place cards to slots
        placeCards: function(orders) {
            var that = this;

            // Place card
            var place = function(obj, i) {
                if (i == undefined) { i = 0; }

                // Get cards
                var name = obj.order[i].name;
                var slot = that.slots[name];
                var cards = that.slots[obj.from].getCards(obj.order[i].size, true);

                // Place cards to slot
                slot.addCards(cards, function() {
                    if (i == obj.order.length - 1) {
                        that.rendered = true;

                        // Call event after cards are rendered
                        if ($.isFunction(that.cardsRendered) == true && that.rendered == true) {
                            that.cardsRendered();
                        }
                    } else {
                        place(obj, i + 1);
                    }
                });
            }

            // Iterate through order and place cards
            $.each(orders, function(from, order) {
                place({
                    from: from, 
                    order: order
                });
            });
        },

        // Reset slots and cards
        resetCards: function(callback) {
            var that = this;

            // Destroy all cards
            that.destroyCards();

            // Rerender cards
            that.renderCards(that._renderCache.from, that._renderCache.obj);
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
                delete card;
            };

            // Reset infos
            that.rendered = false;
            that.cards = {};
            that.moves = [];
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
        registerMove: function(action, actors, origin) {
            var that = this;

            // Check if allowed to register
            if (that.rendered == true) {
                that.moves.push({
                    action: action,
                    actors: actors,
                    origin: origin
                });
            }
        },

        // Undo last move
        undoLast: function() {
            var that = this;

            // Return if no moves registered
            if (that.moves.length == 0) return;

            // Get last move
            var move = that.moves[that.moves.length - 1];

            switch(move.action) {
                case 'switch': that._undoSwitch(move); break;
                case 'checkIn': that._undoCheckIn(move); break;
                case 'browse': that._undoBrowse(move); break;
                case 'reset': that._undoReset(move); break;
                case 'open': that._undoOpen(move); break;
            }

            // Remove last move
            that.moves.pop();

            // Call event for undoing of move
            if ($.isFunction(that.moveUndid) == true && that.rendered == true) {
                that.moveUndid(move);
            }
        },

        // Undo a move
        undoMove: function(move) {
            var that = this;

            // Return if no move is invalid
            if (move == undefined) return;

            switch(move.action) {
                case 'switch': that._undoSwitch(move); break;
                case 'checkIn': that._undoCheckIn(move); break;
                case 'browse': that._undoBrowse(move); break;
                case 'reset': that._undoReset(move); break;
                case 'open': that._undoOpen(move); break;
            }

            // Remove last move
            that.moves.pop();

            // Call event for undoing of move
            if ($.isFunction(that.moveUndid) == true && that.rendered == true) {
                that.moveUndid(move);
            }
        },

        // Retrieve a template
        getTemplate: function(name, data) {
            var that = this;
            data = (data == undefined) ? {} : data;

            // Get template html
            var html = that._templates[name].html;
            return that.renderTemplate(html, data);
        },

        // Simple JavaScript Templating
        // John Resig - http://ejohn.org/ - MIT Licensed
        renderTemplate: function(str, data) {
            var that = this;
            that._tempcache = {};

            // Figure out if we're getting a template, or if we need to
            // load the template - and be sure to cache the result.
            var fn = !/\W/.test(str) ?
            that._tempcache[str] = that._tempcache[str] ||
            that.renderTemplate(document.getElementById(str).innerHTML) :

            // Generate a reusable function that will serve as a template
            // generator (and which will be cached).
            new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" +

            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +

            // Convert the template into pure JavaScript
            str.replace(/[\r\t\n]/g, " ")
            .split("<%").join("\t")
            .replace(/((^|%>)[^\t]*)'/g, "$1\r")
            .replace(/\t=(.*?)%>/g, "',$1,'")
            .split("\t").join("');")
            .split("%>").join("p.push('")
            .split("\r").join("\\'")
            + "');}return p.join('');");

            // Provide some basic currying to the user
            return data ? fn( data ) : fn;
        },

        // Check for win
        isWin: function() {
            var that = this;
            var count_con = 0;
            var face_con = 0;
            var conditions = {};

            // Return if no condition
            if (Object.keys(that.winCondition).length == 0) return;

            // Check if slot is part of a group
            $.each(that.winCondition, function(group, con) {
                $.each(that.slots, function(name, slot) {
                    if (slot.group == group) {
                        conditions[name] = con;
                    }
                });
            });

            // Iterate each conditions
            $.each(conditions, function(name, con) {
                var slot = that.slots[name];
                var count = con.split(' ')[0];
                var face = con.split(' ')[1];

                // Remap count
                switch(count) {
                    case 'full': count = 13; break;
                    case 'empty': count = 0; break;
                    default: count = count;
                }

                // Check if card count met the condition
                if (count == slot.cardCount()) {
                    count_con++;
                }

                // Check for face of all cards
                var total_face = 0;
                for (var i = 0; i < slot.cardCount(); i++) {
                    var card = slot.cards[i]
                    if (face == card.face) {
                        total_face++;
                    }
                };

                // If face of all cards met the condition
                if (total_face == slot.cardCount() && slot.cardCount() != 0) {
                    face_con++;
                }
            });

            // For the win...
            if (count_con == Object.keys(conditions).length 
            && face_con == Object.keys(conditions).length) {
                return true;
            } else {
                return false;
            }
        },

        // Start timer
        startTimer: function(el) {
            var that = this;

            function timer() {
                if (that._timerElapse == undefined) { that._timerElapse = 0;}
                that._timerElapse += 1000;

                // Display time
                $(el).html(that._constructTime(that._timerElapse));
            }

            // Timer interval
            that._timerInt = setInterval(timer, 1000);
        },

        // Stop timer
        stopTimer: function() {
            var that = this;
            var elapse = that._timerElapse;

            // Clear timer
            clearInterval(that._timerInt);
            delete that._timerElapse;

            // Final time
            return that._constructTime(elapse);
        },

        // Change theme
        changeTheme: function(theme) {
            var that = this;
            that.themes.current = theme;

            // Default cache to true
            var bust = (that.filecache == false) ? '?bust=' + Math.random() : '';
            $.ajaxSetup({ cache: that.filecache });

            // Update theme css source
            $('#quard-themecss').attr('href', that.themes.dist + that.themes.current + '/style.css' + bust)

            // Update background
            $('body').css({
                background: 'url(' + that.themes.dist + that.themes.current + '/bg.jpg) repeat',
                backgroundPosition: 'center 0'
            });

            $('.panel-top, .panel-btm').css({
                backgroundImage: 'url(' + that.themes.dist + that.themes.current + '/bg.jpg)'
            });

            // Reload all templates
            that._templates = {};
            for (var i = 0; i < that.templates.list.length; i++) {
                var template = that.templates.list[i];
                that._templates[template] = {};

                // Get template
                (function(template) {
                    $.get(that.templates.dist + template + '.html', function(html) {
                        that._templates[template].html = html;
                    });
                })(template);
            };
        },

        // Add and open panel
        openPanel: function(options, callback) {
            var that = this;

            // Return if still animating
            if (that._panelAnimating == true) return;

            // Construct final settings
            that._panelSettings = $.extend({}, {
                cut: $(document).height() / 2,
                size: 100,
                animate: 250
            }, options);

            // If panel is not present, add one
            if (that._panel == undefined) {
                var html = that.getTemplate('panel');
                that._panel = $(html).appendTo('body');
            }

            // Get top and btm panels
            var panel_top = that._panel.find('.panel-top');
            var panel_btm = that._panel.find('.panel-btm');
            var panel_inner = that._panel.find('.panel-inner');

            // Add background to top and btm
            var style = $('body').attr('style');
            var width = $(document).width();
            var top_height = that._panelSettings.cut;
            var btm_height = $(document).height() - top_height;
            panel_top.attr('style', style);
            panel_btm.attr('style', style);

            // Style all pane class
            $('.pane').css({ top: top_height - (that._panelSettings.size) });

            // Style panel body
            that._panel.css({
                width: $(document).width(),
                height: $(document).height(),
                overflow: 'hidden',
                position: 'absolute',
                left: 0,
                top: 0
            });

            // Style top panel
            panel_top.css({
                position: 'absolute',
                boxShadow: '0 15px 25px -20px #000',
                width: width,
                height: top_height,
                top: 0,
                left: 0
            });

            // Style btm panel
            panel_btm.css({
                backgroundPosition: 'center -' + top_height + 'px',
                boxShadow: '0 -15px 25px -20px #000',
                position: 'absolute',
                width: width,
                height: btm_height,
                top: top_height,
                left: 0
            });

            // Animate and open panel
            that._panelAnimating = true;

            panel_top.removeClass('panel-closed');
            panel_top.animate({ top: that._panelSettings.size * -1 }, 
                that._panelSettings.animate, function() {
                $(this).removeClass('panel-opened');
            });

            panel_btm.removeClass('panel-closed');
            panel_btm.animate({ top: top_height + that._panelSettings.size }, 
                that._panelSettings.animate, function() {
                that._panelAnimating = false;
                if (callback) callback();
            });

            // Move canvas up
            if (that.rendered == true) {
                that.el.animate({
                    top: that.offset.top - that._panelSettings.size
                }, that._panelSettings.animate);
            }
        },

        // Close and remove panel
        closePanel: function(callback) {
            var that = this;

            // Return if still animating
            if (that._panelAnimating == true) return;

            // Return if panel is already removed
            if (that._panel == undefined) return;

            var panel_top = that._panel.find('.panel-top');
            var panel_btm = that._panel.find('.panel-btm');
            var height = panel_btm.offset().top;

            // Style top panel
            panel_top.css({
                boxShadow: 'none',
            });

            // Style btm panel
            panel_btm.css({
                boxShadow: 'none',
            });

            // Animate and close panel
            that._panelAnimating = true;

            panel_top.animate({ top: 0 }, 
                that._panelSettings.animate, function() {
                $(this).addClass('panel-closed');
            });

            panel_btm.animate({ top: panel_btm.offset().top - that._panelSettings.size }, 
                that._panelSettings.animate, function() {
                $(this).addClass('panel-closed');

                setTimeout(function() {
                    that._panelAnimating = false;
                    that._panel.remove();
                    delete that._panel;
                    if (callback) callback();
                }, 200);
            });

            // Move canvas back
            if (that.rendered == true) {
                that.el.animate({
                    top: that.offset.top
                }, that._panelSettings.animate);
            }
        },

        // Load files and templates
        _loadFiles: function() {
            var that = this;
            that._loadCount = 0;

            // Size of templates and themes
            var template_size = that.templates.list.length + 1;
            var theme_size = that.themes.list.length * 2;
            that._loadSize = template_size + theme_size;

            // Set cache
            var bust = (that.filecache == false) ? '?bust=' + Math.random() : '';
            $.ajaxSetup({ cache: that.filecache });

            // Load all templates
            that._templates = {};
            for (var i = 0; i < that.templates.list.length; i++) {
                var template = that.templates.list[i];
                that._templates[template] = {};

                // Get template
                (function(template) {
                    $.get(that.templates.dist + template + '.html', function(html) {
                        that._templates[template].html = html;
                        that._fileLoaded();
                    });
                })(template);
            };

            // Load theme css
            var head  = document.getElementsByTagName('head')[0];
            var body  = document.getElementsByTagName('body')[0];
            var link  = document.createElement('link');
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.id = 'quard-themecss';
            link.href = that.themes.dist + that.themes.current + '/style.css' + bust;
            head.appendChild(link);
            link.onload = function() {
                that._fileLoaded();
            }

            // Preload theme background and slots images
            var preload = document.createElement('div');
            preload.id = 'quard-preload';
            body.appendChild(preload);
            $('#quard-preload').hide();

            for (var i = 0; i < that.themes.list.length; i++) {
                var theme = that.themes.list[i];

                // Load bg
                var bg = new Image();
                bg.src = that.themes.dist + theme + '/bg.jpg';
                preload.appendChild(bg);
                bg.onload = function() {
                    that._fileLoaded();
                }

                // Load slots
                var slots = new Image();
                slots.src = that.themes.dist + theme + '/slots.png';
                preload.appendChild(slots);
                slots.onload = function() {
                    that._fileLoaded();
                }
            };
        },

        // If a file is loaded
        _fileLoaded: function() {
            var that = this;
            that._loadCount++;
            var percentage = that._loadCount / that._loadSize * 100;

            if (that._loadCount == 1) {
                $('body').append('<div id="quard-loader"></div>');
                $('#quard-loader').css({ width: percentage + '%' });
            }

            if (that._loadCount == that._loadSize) {
                $('#quard-preload').remove();
            }

            // Animate loader
            $('#quard-loader').animate({
                width: percentage + '%'
            }, 'fast', function() {
                if (percentage == 100) {
                    $(this).remove();
                    that.intro();
                }
            });
        },

        // Undo switch cards
        _undoSwitch: function(move) {
            var that = this;

            // Create container
            var cards = [];

            // Retrieve cards back
            for (var i = 0; i < move.actors.length; i++) {
                var slot = move.actors[i].slot;
                var card = slot.cards[slot.cardCount() - 1];
                slot.removeCards(card);
                cards.push(card);
            };

            // Transfer cards to origin
            move.origin.addCards(cards.reverse());
        },

        // Undo checkIn cards
        _undoCheckIn: function(move) {
            var that = this;

            // Create container
            var cards = [];

            // Retrieve cards back
            for (var i = 0; i < move.actors.length; i++) {
                var slot = move.actors[i].slot;
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

            // Open cards
            for (var i = 0; i < move.actors.length; i++) {
                var card = move.actors[i];
                card.open(0.15);
            };

            // Remove cards from slot
            var slot = move.actors[0].slot;
            slot.removeCards(move.actors);

            // Transfer cards to origin
            move.origin.animate = true;
            move.origin.addCards(move.actors.reverse());
        },

        // Undo browse cards
        _undoBrowse: function(move) {
            var that = this;

            // Close cards
            for (var i = 0; i < move.actors.length; i++) {
                var card = move.actors[i];
                card.close(0.15);
            };

            // Remove cards from slot
            var slot = move.actors[0].slot;
            slot.removeCards(move.actors);

            // Transfer cards to origin
            move.origin.animate = true;
            move.origin.addCards(move.actors.reverse());
        },

        // Undo card open
        _undoOpen: function(move) {
            var that = this;

            // Close back card
            move.actors.close()
        },

        // Render events
        _applyEvents: function() {
            var that = this;

            // Iterate each events
            $.each(that.events, function(index, value) {
                var event = index.split(' ')[0];
                var elem = index.split(' ')[1];
                var action = value;

                // Bind event to elem
                $('body').on(event, elem, function(e) {
                    that[action]($(this));
                });
            });
        },

        // Construct time
        _constructTime: function(elapse) {
            var that = this;

            // Construct time
            var totalSec = new Date(elapse).getTime() / 1000;
            var hours = parseInt( totalSec / 3600 ) % 24;
            var minutes = parseInt( totalSec / 60 ) % 60;
            var seconds = totalSec % 60;

            return (hours < 10 ? '0' + hours : hours) + ':' + 
            (minutes < 10 ? '0' + minutes : minutes) + ':' + 
            (seconds  < 10 ? '0' + seconds : seconds);
        },

        // One successfuly move
        _oneMove: function(action, actors, origin) {
            var that = this;

            // Call drop event
            if ($.isFunction(that.cardDropped) == true && that.rendered == true) {
                that.cardDropped(action, actors, origin);
            }

            // Check for win
            if (that.isWin() == true) {

                // Stop timer
                var time = that.stopTimer();

                // Call game win event
                that.gameWin(time, that.moves.length);
            }
        }
    });

    // Quard Slot Class
    Quard.slot = Quard.class.extend({

        // Settings
        settings: {
            position: {
                left: 0,
                top: 0
            },
            cascade: {
                left: 0,
                top: 0,
                max: 0
            },
            anim: {
                interval: 150,
                speed: 500,
                swing: 20
            },
            animate: true
        },

        // Initialize
        init: function(options) {
            var that = this;
            that.cards = [];

            // Construct final settings
            var settings = $.extend({}, that.settings, options);

            // Map settings to root
            $.each(settings, function(index, value) {
                that[index] = value;
            });

            // Set height and width
            that.width = that.canvas.tile.width;
            that.height = that.canvas.tile.height;

            // Create slot
            var html = '<div class="slot"><span></span></div>';
            that.el = $(html).appendTo(that.canvas.el);
            that.inner = that.el.find('span');

            // Compute offset
            that.offset = that._computeOffset();

            // Style element
            that.el.css({
                position: 'absolute',
                left: that.offset.left,
                top: that.offset.top,
                height: that.height,
                width: that.width,
                cursor: 'pointer'
            });

            // Style inner
            that.inner.css({
                backgroundImage: 'url(' + that.canvas.themes.dist + that.canvas.themes.current + '/slots.png)',
                backgroundPosition: '0 0',
                backgroundRepeat: 'no-repeat',
                float: 'left',
                height: that.height,
                width: that.width
            });

            // If slot is stack type
            if (that.browse != undefined) {
                that.inner.css({
                    backgroundPosition: '-' + that.width + 'px 0'
                });
            }

            // If slot is foundation type
            if (that.checkSuits != undefined) {
                that.checkSuit = that.checkSuits[that.index];
                var adjust_left = (that.index + 2) * that.width;

                that.inner.css({
                    backgroundPosition: '-' + adjust_left + 'px 0'
                });
            }

            return that;
        },

        // Drop events
        dropEvents: {},

        // Drop condition
        dropCondition: {},

        // Create cards
        createCards: function() {
            var that = this;
            var cards = [];
            var maps = [];
            var started = false;

            // Return if slot dont have cardmap
            if (that.cardmap == undefined) return;

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
                    }

                    // Get facedown map
                    if (that.cardmap.render.back == map) {
                        var facedown_map = [j, i];
                    }
                };
            };

            // Create cards based on cards map
            that.canvas.cards = {};
            for (var k = 0; k < maps.length; k++) {
                var cardobj = maps[k];
                var card = new that.cardclass({
                    canvas: that.canvas,
                    num: cardobj.num,
                    suit: cardobj.suit,
                    faceup_map: cardobj.map,
                    facedown_map: facedown_map,
                    sprite: that.cardmap.sprite
                });

                cards.push(card);
                that.canvas.cards[card.slug] = card;
            };

            // Double shuffle cards
            var cards = that.shuffleCards(that.shuffleCards(cards));

            // Place cards
            that.animate = false;
            that.addCards(cards);
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

        // Pick random cards from slot
        pickRandom: function(size) {
            var that = this;

            // Create container
            var cards = [];

            // Pick cards depending on size
            for (var i = 1; i <= size; i++) {
                var card = that.cards[Math.floor((Math.random() * that.cardCount()))];
                that._removeCard(card);
                cards.push(card);
            };

            // Return cards
            return cards;
        },

        // Add cards to slot
        addCards: function(cards, callback) {
            var that = this;

            // Check if multiple cards
            if (!(cards instanceof Array)) {
                var card = cards;
                var cards = [];
                cards.push(card);
            }

            // Set batch cards
            that.batch = cards;

            // Set origin of cards
            var first = cards[0];
            if (first != undefined) {
                var origin = cards[0].slot;
            }

            // Uncascade cards
            that._maxUncascade();

            // Iterate each card and add
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                card.batch_count = i;

                // Move card to slot
                (function(i, card, callback) {
                    if (i == cards.length - 1) {
                        that._addCard(card, function() {
                            delete card.batch_count;
                            delete that.batch;
                            if (callback) callback();
                        }, function() {
                            // Call event for increasing slot cards
                            if ($.isFunction(that.canvas.slotIncreased) == true && that.canvas.rendered == true) {
                                that.canvas.slotIncreased(that, cards);
                            }

                            // Call event for decreasing slot cards
                            if ($.isFunction(that.canvas.slotDecreased) == true && that.canvas.rendered == true) {
                                that.canvas.slotDecreased(origin, cards);
                            }
                        });
                    } else {
                        that._addCard(card);
                    }
                })(i, card, callback);
            };
        },

        // Remove cards from slot
        removeCards: function(cards) {
            var that = this;

            // Check if multiple cards
            if (!(cards instanceof Array)) {
                var card = cards;
                var cards = [];
                cards.push(card);
            }

            // Iterate each card and remove
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                that._removeCard(card);
            };

            // Cascade cards
            that._maxCascade();
        },

        // Get cards
        getCards: function(size, reverse) {
            var that = this;

            // Default reverse to false
            if (reverse == undefined) {
                reverse = false;
            }

            // Create container
            var cards = [];

            // Pick cards based on size
            if (reverse == true) {
                var length = that.cardCount() - 1;
                for (var i = length; i > length - size; i--) {
                    var card = that.cards[i]
                    if (card != undefined) cards.push(card);
                };
            } else {
                for (var i = 0; i < size; i++) {
                    var card = that.cards[i]
                    if (card != undefined) cards.push(card);
                }
            }

            // Remove cards from origin
            that.removeCards(cards);

            // Return cards
            return cards;
        },

        // Open cards to browse slot
        browseCards: function() {
            var that = this;

            // Return if not browse type
            if (that.browse == undefined) return;

            // If still animating, return
            if (that.browsing == true) return;
            that.browsing = true;

            // Pick cards from slot
            var browse_slot = that.canvas.slots[that.browse.slot];
            var browsed = that.getCards(that.browse.size, true);
            var origin = browsed[0].slot;

            // Place cards to browse
            browse_slot.addCards(browsed, function() {

                // Open browsed cards
                for (var i = 0; i < browsed.length; i++) {
                    var card = browsed[i];

                    if (i == browsed.length - 1) {
                        card.open(0.15);
                    } else {
                        card.open(0.15);
                    }
                };

                // Set to unbrowse
                that.browsing = false;

                // Move successful, check for win
                that.canvas._oneMove('browse', browsed, origin);
            });
        },

        // Reset browsed cards
        unbrowseCards: function() {
            var that = this;

            // Return if not browse type
            if (that.browse == undefined) return;

            // Set animate to true
            that.animate = true;

            // Pick cards from slot
            var browse_slot = that.canvas.slots[that.browse.slot];
            var cards = browse_slot.getCards(browse_slot.cardCount(), true);

            if (cards.length == 0) return false;
            var origin = cards[0].slot;

            // Close cards and uncascade
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                card.el.css({ left: browse_slot.offset.left });
                card.close(0.15);
            };

            // Place cards to stack
            that.addCards(cards, function() {

                // Move successful, check for win
                that.canvas._oneMove('reset', cards, origin);
            });
        },

        // Unbind all events
        unbind: function() {
            var that = this;

            // Unbind slot
            that.el.off();

            // Iterate each cards and unbind event
            for (var i = 0; i < that.cardCount(); i++) {
                var card = that.cards[i];
                card.el.off();
            };
        },

        // Get card count
        cardCount: function() {
            var that = this;
            return that.cards.length;
        },

        // Add card to slot
        _addCard: function(card, callback, callback2) {
            var that = this;

            // Unbind all
            card.el.off();

            // Update card info
            card.index = that.cardCount();
            card.slot = that;
            card.last = true;
            that.last = card;

            // Update last card
            var lastcard = that.cards[that.cardCount() - 1];
            if (lastcard != undefined) {
                lastcard.last = false;
            }

            // Push to slot
            that.cards.push(card);

            // Update height
            that.height = ((that.cardCount() - 1) * that.cascade.top) + that.height;

            // Move card to slot
            card.move(that, callback, callback2);
        },

        // Remove card from slot
        _removeCard: function(card) {
            var that = this;

            // Unbind events of this card
            if (card != undefined) {
                card.el.off();
            }

            // Update card indexes
            for (var i = card.index; i < that.cardCount(); i++) {
                var next_card = that.cards[i + 1];
                if (next_card != undefined) {
                    next_card.index -= 1;
                }
            };

            // Remove card from slot
            that.cards.splice(card.index, 1);

            // Update last position
            var last_card = that.cards[that.cardCount() - 1];
            if (last_card != undefined) {
                last_card.last = true;
                that.last = last_card;
            }

            // Remove last if slot is empty
            if (that.cardCount() == 0) {
                that.last = null;
            }

            // Update height
            that.height = ((that.cardCount() - 1) * that.cascade.top) + that.height;
        },

        // Drop card if conditions are met
        _applyDrop: function(card) {
            var that = this;

            // If drop is not setup for this slot
            if (Object.keys(that.dropCondition).length == 0) return false;

            // Default result to false
            var result = false;

            // Check for suit conditions
            switch(that.dropCondition.suit) {
                case 'same':
                    switch(that.dropCondition.order) {
                        case 'asc': 
                            if (that.last == null) {
                                return false;
                            } else if (card.num - 1 == that.cardCount() && card.suit == that.last.suit) {
                                result = true;
                            } else {
                                result = false;
                            }
                        break;
                        default:
                            if (card.num == 13 && that.cardCount() == 0) {
                                result = true;
                            } else if (that.last == null) {
                                return false;
                            } else if (that.last.num - 1 == card.num && card.suit == that.last.suit) {
                                result = true;
                            } else {
                                result = false;
                            }
                        break;
                    }
                break;
                case 'foundation':
                    switch(that.dropCondition.order) {
                        case 'asc': 
                            if (card.num - 1 == that.cardCount() && card.suit == that.checkSuit) {
                                result = true;
                            } else {
                                result = false;
                            }
                        break;
                        default:
                            if (card.num == 13 && that.cardCount() == 0) {
                                result = true;
                            } else if (that.last == null) {
                                return false;
                            } else if (that.last.num - 1 == card.num && card.suit == that.checkSuit) {
                                result = true;
                            } else {
                                result = false;
                            }
                        break;
                    }
                break;
                case 'alternate':
                    switch(that.dropCondition.order) {
                        case 'asc': 
                            if (that.last == null) {
                                return false;
                            } else if (card.num - 1 == that.cardCount() && card.suit == that.checkSuit) {
                                result = true;
                            } else {
                                result = false;
                            }
                        break;
                        default:
                            if (card.num == 13 && that.cardCount() == 0) {
                                result = true;
                            } else if (that.last == null) {
                                return false;
                            } else if (that.last.num - 1 == card.num && that.last.color != card.color) {
                                result = true;
                            } else {
                                result = false;
                            }
                        break;
                    }
                break;
                default:
                    switch(that.dropCondition.order) {
                        case 'asc': 
                            if (that.last == null) {
                                return false;
                            } else if (card.num - 1 == that.cardCount() && card.suit == that.checkSuit) {
                                result = true;
                            } else {
                                result = false;
                            }
                        break;
                        default:
                            if (card.num == 13 && that.cardCount() == 0) {
                                result = true;
                            } else if (that.last == null) {
                                return false;
                            } else if (that.last.num - 1 == card.num && that.last.color != card.color) {
                                result = true;
                            } else {
                                result = false;
                            }
                        break;
                    }
                break;
            }

            return result;
        },

        // Compute slot positions
        _computeOffset: function() {
            var that = this;
            var dist_left = that.canvas.tile.x_space;
            var dist_top = that.canvas.tile.y_space;

            // Compute data
            var pos_left = (that.position.left * that.width) + (that.position.left * dist_left);
            var pos_top = (that.position.top * that.height) + (that.position.top * dist_top);

            return {
                left: pos_left,
                top: pos_top
            }
        },

        // Compute anim data
        _computeAnim: function() {
            var that = this;

            // If alternate anim is present and slot is rendered
            if (that.animAlt != undefined && that.canvas.rendered == true) {
                var anim = that.animAlt;
            } else {
                var anim = that.anim;
            }

            // Compute data
            var card = that.cards[that.cardCount() - 1];
            var zindex = that.offset.left + that.cardCount();
            var timeout = (card.batch_count * anim.swing) * 2;
            var interval = anim.interval;
            var speed = anim.speed;

            // Return data
            return {
                zindex: zindex,
                interval: interval,
                timeout: timeout,
                speed: speed
            }
        },

        // Compute cascade data
        _computeCascade: function() {
            var that = this;
            var card = that.cards[that.cardCount() - 1];
            var adjust_left = (that.cardCount() - 1) * that.cascade.left;
            var adjust_top = (that.cardCount() - 1) * that.cascade.top;

            // When max cascade is set adjust left cascade
            if (that.cascade.left > 0 && that.cascade.max > 0) {
                if (that.cardCount() > that.cascade.max) {
                    var cut = that.batch.length - that.cascade.max;
                    adjust_left = (card.batch_count - cut) * that.cascade.left;
                }

                var remain = (that.cardCount() - 1) - card.batch_count;
                if (remain <= that.cascade.max && remain + that.batch.length > that.cascade.max) {
                    var cut = that.batch.length - that.cascade.max;
                    adjust_left = (card.batch_count - cut) * that.cascade.left;
                }
            }

            // When max cascade is set adjust top cascade
            if (that.cascade.top > 0 && that.cascade.max > 0) {
                if (that.cardCount() > that.cascade.max) {
                    var cut = that.batch.length - that.cascade.max;
                    adjust_top = (card.batch_count - cut) * that.cascade.top;
                }

                var remain = (that.cardCount() - 1) - card.batch_count;
                if (remain <= that.cascade.max && remain + that.batch.length > that.cascade.max) {
                    var cut = that.batch.length - that.cascade.max;
                    adjust_top = (card.batch_count - cut) * that.cascade.top;
                }
            }

            // Compute final offset
            var offset_left = that.offset.left + adjust_left;
            var offset_top = that.offset.top + adjust_top;

            // Make sure cards dont go over the slot offset
            if (offset_left < that.offset.left) offset_left = that.offset.left;
            if (offset_top < that.offset.top) offset_top = that.offset.top;
            
            return {
                left: offset_left,
                top: offset_top
            };
        },

        // Cascade cards to max
        _maxCascade: function(callback) {
            var that = this;

            // Return if max cascade is not set
            if (that.cascade.max == 0) return;

            // Get card length
            if (that.cardCount() > that.cascade.max) {
                var count = that.cascade.max;
                var length = that.cascade.max;
            } else {
                var count = that.cardCount();
                var length = that.cardCount();
            }

            // Recascade browse cards
            for (var i = 0; i < length; i++) {
                count--;
                var card = that.cards[that.cardCount() - 1 - i];
                var adjust_left = count * that.cascade.left;
                var adjust_top = count * that.cascade.top;
                card.offset.left = that.offset.left + adjust_left;
                card.offset.top = that.offset.top + adjust_top;

                if (i == length - 1) {
                    card.el.animate({
                        left: card.offset.left,
                        top: card.offset.top
                    }, 'fast', callback);
                } else {
                    card.el.animate({
                        left: card.offset.left,
                        top: card.offset.top
                    }, 'fast');
                }
            };
        },

        // Uncascade cards to max
        _maxUncascade: function(callback) {
            var that = this;

            // Return if max cascade is not set
            if (that.cascade.max == 0) return;
            if (that.cardCount() + that.batch.length <= that.cascade.max) return;

            // Compute adjustment
            var adjust_left = that.batch.length * that.cascade.left;
            var adjust_top = that.batch.length * that.cascade.top;

            // Uncascade other cards
            for (var i = that.cardCount() - 1; i >= 0; i--) {
                var card = that.cards[i];
                card.offset.left = card.offset.left - adjust_left;
                card.offset.top = card.offset.top - adjust_top;

                // Make sure cards dont go over the slot offset
                if (card.offset.left < that.offset.left) card.offset.left = that.offset.left;
                if (card.offset.top < that.offset.top) card.offset.top = that.offset.top;

                if (i == length - 1) {
                    card.el.animate({
                        left: card.offset.left,
                        top: card.offset.top
                    }, 'fast', callback);
                } else {
                    card.el.animate({
                        left: card.offset.left,
                        top: card.offset.top
                    }, 'fast');
                }
            };
        },

        // Apply card events
        _cardEvents: function(card) {
            var that = this;

            // Unbind events
            card.el.off();

            // Iterate each events
            $.each(that.dropEvents, function(rule, action) {
                var event = rule.split(' ')[0];
                var elem = rule.split(' ')[1];
                var matches = (/\[(.*?)\]/).exec(elem);
                if (matches) var filters = matches[1];

                var target = elem.replace(/\[(.*?)\]/g, '');
                if (target != 'card') return;

                // Bind event to card
                card.el.on(event, function(e) {
                    if (filters != undefined) {
                        var filters_arr = filters.split(',');
                        for (var i = 0; i < filters_arr.length; i++) {
                            var filter = filters_arr[i];
                            var operand_a = filter.split('=')[0];
                            var operand_b = filter.split('=')[1];
                            if (card[operand_a].toString() != operand_b) return;
                        };
                    }

                    var actions = action.split(',');
                    for (var i = 0; i < actions.length; i++) {
                        card.e = e;
                        card[actions[i]]();
                    };
                });
            });

            // Call event for card click
            card.el.on('click', function(e) {
                if ($.isFunction(that.canvas.cardClicked) == true && that.canvas.rendered == true) {
                    if (card.grabbed != true) {
                        that.canvas.cardClicked(card);
                    }
                }
            });
        }
    });

    // Quard Card Class
    Quard.card = Quard.class.extend({

        // Settings
        settings: {
            num: '1',
            suit: 'joker',
            map: [3, 13]
        },

        // Initialize
        init: function(options) {
            var that = this;

            // Construct settings
            var settings = $.extend({}, that.settings, options);

            // Map settings to root
            $.each(settings, function(index, value) {
                that[index] = value;
            });

            // Set height and width
            that.width = that.canvas.tile.width;
            that.height = that.canvas.tile.height;

            // Set card info
            switch(that.num) {
                case '1': that.value = 1; that.name = 'Ace'; break;
                case '11': that.value = 10; that.name = 'Jack'; break;
                case '12': that.value = 10; that.name = 'Queen'; break;
                case '13': that.value = 10; that.name = 'King'; break;
                default: that.value = that.num; that.name = that.num;
            }

            // Set card color
            switch(that.suit) {
                case 'Spades': that.color = 'black'; break;
                case 'Hearts': that.color = 'white'; break;
                case 'Clubs': that.color = 'black'; break;
                case 'Diamonds': that.color = 'white'; break;
            }

            // Card num and slug
            that.slug = that.num + that.suit;

            // Create card
            var html = '<div class="card"><div class="flipper">' +
            '<div class="faceup"><span></span></div>' +
            '<div class="facedown"><span></span></div></div>' +
            '<div class="cover"></div></div>';
            that.el = $(html).appendTo(that.canvas.el);
            that.face = 'facedown';

            // Style element
            that.el.css({
                position: 'absolute',
                height: that.height,
                width: that.width,
                cursor: 'pointer',
                perspective: 1000
            });

            // Style card flipper
            that.el.find('.flipper').css({
                position: 'relative'
            });

            // Style faceup and facedown
            that.el.find('.faceup, .facedown').css({
                width: that.width,
                height: that.height,
                position: 'absolute',
                backfaceVisibility: 'hidden',
                top: 0,
                left: 0
            });

            // Style faceup
            that.el.find('.faceup').css({
                transform: 'rotateY(180deg)',
                zIndex: 2,
            });

            // Style facedown
            that.el.find('.facedown').css({
                transform: 'rotateY(0deg)'
            });

            // Style cover
            that.el.find('.cover').css({
                width: that.width,
                height: that.height,
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 9
            });

            // Compute background positions
            var faceup_x = that.faceup_map[0] * that.width;
            var faceup_y = that.faceup_map[1] * that.height;
            var facedown_x = that.facedown_map[0] * that.width;
            var facedown_y = that.facedown_map[1] * that.height;

            // Style faceup image
            that.el.find('.faceup span').css({
                float: 'left',
                width: that.width,
                height: that.height,
                backgroundImage: 'url(' + that.sprite + ')',
                backgroundPosition: '-' + faceup_x + 'px -' + faceup_y + 'px',
            });

            // Style facedown image
            that.el.find('.facedown span').css({
                float: 'left',
                width: that.width,
                height: that.height,
                backgroundImage: 'url(' + that.sprite + ')',
                backgroundPosition: '-' + facedown_x + 'px -' + facedown_y + 'px',
            });

            return that;
        },

        // Move card to slot
        move: function(slot, callback, callback2) {
            var that = this;

            // Compute anim data
            var anim = slot._computeAnim();
            that.offset = slot._computeCascade();

            // Make sure card is on top while moving
            that.el.animate({ zIndex: anim.zindex + 999 }, 0);
            that.zindex = anim.zindex + 999;

            // Time card animation
            if (slot.animate == true) {
                setTimeout(function() {
                    that.el.animate(that.offset, anim.speed, function() {
                        that.el.animate({ zIndex: anim.zindex }, 0);
                        that.zindex = anim.zindex;
                        if(callback2) callback2(that);
                    });
                }, anim.timeout);

                // Callback
                setTimeout(function() {
                    if(callback) callback(that);
                    slot._cardEvents(that);
                }, anim.timeout + anim.interval);
            }

            // Place card
            else {
                that.el.animate({ zIndex: anim.zindex }, 0);
                that.zindex = anim.zindex;
                that.el.css(that.offset);
                if(callback) callback(that);
                if(callback2) callback2(that);
                slot._cardEvents(that);
            }
        },

        // Open card
        open: function(speed) {
            var that = this;

            // Flip card
            that.flip(speed, 'open');
        },

        // Close card
        close: function(speed) {
            var that = this;

            // Flip card
            that.flip(speed, 'close');
        },

        // Flip card
        flip: function(speed, type) {
            var that = this;

            // Return if card came from grab
            if (that.grabbed == true) return;

            // Default speed to 0.3
            if (speed == undefined) {
                speed = 0.3;
            }

            if (type == 'close') {
                that.face = 'facedown';
                var rotate = '0deg';
            } else if (type == 'open') {
                that.face = 'faceup';
                var rotate = '180deg';
            } else {
                if (that.face == 'faceup') {
                    that.face = 'facedown';
                    var rotate = '0deg';
                    var type = 'close';
                } else {
                    that.face = 'faceup';
                    var rotate = '180deg';
                    var type = 'open';
                }
            }

            // Flip card
            that.el.find('.flipper').css({
                transition: 'all ' + speed + 's ease 0s',
                transformStyle: 'preserve-3d',
                transform: 'rotateY(' + rotate + ')'
            });

            // Call flip event
            if ($.isFunction(that.canvas.cardFlipped) == true && that.canvas.rendered == true) {
                that.canvas.cardFlipped(type, that);
            }
        },

        // CheckIn card
        checkIn: function(from_collide) {
            var that = this;
            var switched = false;

            // Avoid running both switch and checkIn
            if (that.canvas.switching == true) return;

            // Check for auto checkIn after return
            if (that._autoCheckIn == false) return that._autoCheckIn = true;

            // Get the correct slot to checkIn
            $.each(that.canvas.slots, function(name, slot) {

                // Column collided
                if (slot.collide != null || from_collide == undefined) {

                    // Check if card is allowed to switch
                    if (slot._applyDrop(that) == true && slot.checkSuits != undefined) {

                        // Return if already switched
                        if (switched == true) return true;

                        // Set origin
                        var origin = (slot.collide != null) ? slot.collide : that.slot;
                        var cards = origin.getCards(origin.cardCount() - that.index, true);

                        // Transfer cards
                        that.canvas.switching = true;
                        slot.addCards(cards.reverse(), function() {
                            that.canvas.switching = false;
                            slot.collide = null;

                            // Move successful, check for win
                            that.canvas._oneMove('checkIn', cards, origin);
                        });

                        // Ungrab cards
                        for (var i = 0; i < cards.length; i++) {
                            var card_active = cards[i];
                            card_active.grabbed = false;
                        };

                        switched = true;
                    }
                }
            });

            return switched;
        },

        // Switch card
        switch: function(from_collide) {
            var that = this;
            var switched = false;

            // Avoid running both switch and checkIn
            if (that.canvas.switching == true) return;

            // Check for auto switch after return
            if (that._autoSwitch == false) return that._autoSwitch = true;

            // Get the correct slot to switch
            $.each(that.canvas.slots, function(name, slot) {

                // Column collided
                if (slot.collide != null || from_collide == undefined) {

                    // Card is allowed to switch
                    if (slot._applyDrop(that) == true && slot.checkSuits == undefined) {

                        // Return if already switched
                        if (switched == true) return true;

                        // Pick cards from slot
                        var origin = (slot.collide != null) ? slot.collide : that.slot;
                        var cards = origin.getCards(origin.cardCount() - that.index, true);

                        // Transfer cards
                        that.canvas.switching = true;
                        slot.addCards(cards.reverse(), function() {
                            that.canvas.switching = false;
                            slot.collide = null;

                            // Move successful, check for win
                            that.canvas._oneMove('switch', cards, origin);
                        });

                        // Ungrab cards
                        for (var i = 0; i < cards.length; i++) {
                            var card_active = cards[i];
                            card_active.grabbed = false;
                        };

                        switched = true;
                    }
                }
            });
            
            return switched;
        },

        // Return card
        return: function() {
            var that = this;
            that._autoSwitch = false;
            that._autoCheckIn = false;

            // Iterate all cards in same slot
            for (var j = that.index; j < that.slot.cardCount(); j++) {
                var card_active = that.slot.cards[j];

                // Animate back to offset
                card_active.el.animate({
                    left: card_active.offset.left,
                    top: card_active.offset.top,
                    zIndex: card_active.zindex
                }, 'fast', function() {
                    card_active.grabbed = false;

                    // Call return event
                    if ($.isFunction(that.canvas.cardReturned) == true && that.canvas.rendered == true) {
                        that.canvas.cardReturned(that);
                    }
                });
            };
        },

        // Grab card
        grab: function() {
            var that = this;

            // Get mouse offset
            var x = that.e.pageX - that.offset.left;
            var y = that.e.pageY - that.offset.top;

            // Drag card and get collision data for slots
            that._drag(x, y, function(offset) {
                $.each(that.canvas.slots, function(name, slot) {
                    that._setCollision(slot, offset);
                });
            });

            // Other cards
            var count = 1;
            for (var j = that.index + 1; j < that.slot.cardCount(); j++) {
                var card_active = that.slot.cards[j];
                card_active._drag(x, y - (count * 20));
                count++;
            };

            // Release card on mouseup
            that.el.on('mouseup', function(e) {
                that._undrag();
            });

            // Call grab event
            if ($.isFunction(that.canvas.cardGrabbed) == true && that.canvas.rendered == true) {
                that.canvas.cardGrabbed(that);
            }
        },

        // Browse card
        browse: function() {
            var that = this;
            that.slot.browseCards();
        },

        // Drag card following mouse
        _drag: function(x, y, callback) {
            var that = this;

            // Move card according to mouse offset
            that.canvas.el.on('mousemove', function(e) {
                // Chrome fix: avoid firing mousemove on mousedown
                if (that.e.pageX == e.pageX && that.e.pageY == e.pageY) return;

                // Set card as grabbed
                that.grabbed = true;
                var offset = {
                    left: e.pageX - x,
                    top: e.pageY - y,
                    zIndex: 9999 - y
                };

                // Update offset
                that.el.css(offset);

                // Callback afer grab
                if (callback) callback(offset);
            });
        },

        // Return card after grab
        _undrag: function() {
            var that = this;
            var droppped = false;

            // Unbind mousemove and mouseup
            that.canvas.el.off('mousemove');
            that.el.off('mouseup');

            // Return if not grabbed
            if (that.grabbed != true) return;

            // Drop card
            droppped = that.switch(true);
            droppped = that.checkIn(true);

            // Return all cards
            if (droppped != true) {
                that.return();
            }
        },

        // Check for collision
        _isCollide: function(slot, offset) {
            var that = this;

            // If empty slot, slot is target
            if (slot.cardCount() == 0) {
                var target = slot; 
            } else {
                var target = slot.last;
            }

            // Compute card data
            var x1 = offset.left;
            var y1 = offset.top;
            var h1 = that.height;
            var w1 = that.width;
            var b1 = y1 + h1;
            var r1 = x1 + w1;

            // Get target data
            var x2 = target.offset.left;
            var y2 = target.offset.top;
            var h2 = target.height;
            var w2 = target.width;
            var b2 = y2 + h2;
            var r2 = x2 + w2;

            if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
            return true;
        },

        // Get any card collision
        _setCollision: function(slot, offset) {
            var that = this;

            // Something collided with the card
            if (that._isCollide(slot, offset) == true) {

                // Make sure not its own slot
                if (slot.name != that.slot.name) {
                    return slot.collide = that.slot;
                }
            }

            // Uncollide
            slot.collide = null;
        }
    });

    // Return quard
    return Quard;

}));