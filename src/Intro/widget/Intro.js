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
    "Intro/widget/lib/jquery",
    "Intro/widget/lib/bootstrap-tour-standalone",
    "dijit/_TemplatedMixin",
    "dojo/text!Intro/widget/template/Intro.html"


], function(declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, jQuery, Tour, _TemplatedMixin, template) {
    "use strict";
    var $ = jQuery.noConflict(true);

    return declare("Intro.widget.Intro", [_WidgetBase, _TemplatedMixin], {

        templateString: template,
        buttonNode: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _introSteps: [],

        // modeler
        steps: null,
        beforeMf: null,
        afterMf: null,
        buttonText: "",
        buttonBootstrap: "",
        buttonExtraClass: "",
        errorMessage: "",

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            var self = this;
            if (this._contextObj && this.beforeMf) {
                mx.data.action({
                    params: {
                        actionname: this.beforeMf,
                        applyto: "selection",
                        guids: [this._contextObj.getGuid()]
                    },
                    callback: function(res) {
                        if (res) self._waitForStepElements(self.steps, res);
                    },
                    error: function(err) {
                        // console.log(err)
                    }
                });
            }
            this._setupListeners();

            this._waitForStepElements(this.steps, false);
            this._updateRendering(callback);
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },

        _setupListeners: function() {
            this.buttonNode.addEventListener('click', lang.hitch(this, this._doClick));
        },

        _doClick: function() {
            this._waitForStepElements(this.steps, true);
        },

        _waitForStepElements: function(elements, force) {
            var self = this;
            var n = 0;
            var wait = setInterval(function() {
                // console.log('waiting..' + n);
                if (elements
                    .filter(function(el) {
                        return el.selector === "" || document.querySelector(self._getElementClassName(el));
                    })
                    .length == elements.length
                ) {
                    self._setupTour();
                    self._startTour(force);
                    clearInterval(wait);
                } else if (++n > 20) { // 2 seconds
                    clearInterval(wait);
                    mx.ui.info(self.errorMessage, true);
                }
            }, 100);
        },

        _getElementClassName: function(modelerStep) {
            // debugger;
            return modelerStep.selector ?
                modelerStep.isMendixName ?
                '.mx-name-' + modelerStep.selector :
                modelerStep.selector :
                null; // default to an element so we don't get an infinite loop
        },

        _setupTour: function() {
            var self = this;
            this._introSteps = this.steps.map(function(s) {
                return {
                    content: s.intro ? s.intro : '',
                    element: self._getElementClassName(s),
                    orphan: !self._getElementClassName(s),
                    title: s.stepTitle? s.stepTitle : '',
                    backdrop: s.backdrop,
                    backdropPadding: 5,
                    placement: s.position,
                    reflex: s.clickToContinue
                };
            });
        },

        _startTour: function(force) {
            var self = this;
            var tour = new Tour({
                steps: self._introSteps,
                onEnd: function() {
                    if (self.afterMf) {
                        var opts = {
                            actionname: self.afterMf,
                        };
                        if (self._contextObj) {
                            opts.applyto = "selection";
                            opts.guids = [self._contextObj.getGuid()];
                        } else {
                            opts.applyto = "none"; // handle a callback with no context
                        }
                        mx.data.action({
                            params: opts,
                            callback: function(res) {
                                // self.afterMf;
                            },
                            error: function(err) {
                                console.info("there was an error evaluating the callback" + err);
                            }
                        });
                    }
                }
            });

            tour.start(force);
            tour.goTo(0);

        },

        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");
            this.buttonNode.innerHTML = this.buttonText;
            dojoClass.add(this.buttonNode, 'btn-' + this.buttonBootstrap);
            dojoClass.add(this.buttonNode, this.buttonExtraClass);

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
