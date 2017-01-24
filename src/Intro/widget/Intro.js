define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "Intro/widget/lib/intro"


], function(declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, Intro) {
    "use strict";

    return declare("Intro.widget.Intro", [_WidgetBase], {


        // Internal variables.
        _handles: null,
        _contextObj: null,
        _introSteps: [],

        // modeler
        steps: null,

        constructor: function() {
            this._handles = [];
            // console.log(Intro());
            // this._appendCSS();
            // this._setupIntro();
            // this._startIntro();
            // console.log(this.introsteps);

        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");
            // console.log(this.introsteps)
            // this._startIntro();
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._updateRendering(callback);
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },

        _waitForStepElements: function(elements) {
            var self = this;
            var wait = setInterval(function() {
                if (elements
                    .filter(function(el) {
                        return el.selector === "" || document.querySelector(self._getElementClassName(el));
                    })
                    .length == elements.length
                ) {
                    self._setupIntro();
                    self._startIntro();
                    clearInterval(wait);
                }
            }, 100);
        },

        _getElementClassName: function(modelerStep) {
            // debugger;
            return modelerStep.selector
                    ? modelerStep.isMendixName
                      ? '.mx-name-' + modelerStep.selector
                      : modelerStep.selector
                      : null; // default to an element so we don't get an infinite loop
        },

        _setupIntro: function() {
            var self = this;
            this._introSteps = this.steps.map(function(s) {
                return {
                    intro: s.intro ? s.intro : '',
                    element: self._getElementClassName(s),
                    position: 'bottom'
                    // position: s.position && self._isValidPosition(s.position) ? s.position : 'bottom'
                };
            });
            // if (callback) lang.hitch(callback, this);
        },

        _isValidPosition: function(pos) {
            return ['right', 'left', 'bottom', 'top'].indexOf(pos) != -1;
        },

        _startIntro: function() {

            var intro = Intro();
            intro.setOptions({
                steps: this._introSteps
            });
            intro.start();
        },

        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");
            this._waitForStepElements(this.steps);

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._executeCallback(callback);
        },

        _executeCallback: function(cb) {
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["Intro/widget/Intro"]);
