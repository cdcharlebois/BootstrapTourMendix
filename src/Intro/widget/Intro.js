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
    "Intro/widget/lib/bootstrap-tour-standalone-new",
    "dijit/_TemplatedMixin",
    "dojo/text!Intro/widget/template/Intro.html"


], function (declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, jQuery, Tour, _TemplatedMixin, template) {
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
        onStartMf: null,
        buttonText: "",
        buttonBootstrap: "",
        buttonExtraClass: "",
        errorMessage: "",
        wlkNextButtonText: null,
        wlkPrevButtonText: null,
        wlkEndButtonText: null,

        constructor: function () {
            this._handles = [];
            // from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
            (function (arr) {
                arr.forEach(function (item) {
                    if (item.hasOwnProperty('remove')) {
                        return;
                    }
                    Object.defineProperty(item, 'remove', {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: function remove() {
                            if (this.parentNode !== null)
                                this.parentNode.removeChild(this);
                        }
                    });
                });
            })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
        },

        update: function (obj, callback) {
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
                    callback: function (res) {
                        if (res) self._waitForStepElements(self.steps, res);
                    },
                    error: function (err) {
                        // console.log(err)
                    }
                });
            }
            this._setupListeners();

            this._waitForStepElements(this.steps, false);
            this._updateRendering(callback);
        },

        resize: function (box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function () {
            logger.debug(this.id + ".uninitialize");
            if (this.displayHook) {
                this.buttonNode.remove();
            }
        },

        _setupListeners: function () {
            this.buttonNode.addEventListener('click', lang.hitch(this, this._doClick));
        },

        _doClick: function () {
            if (this.onStartMf) {
                this._executeMicroflow(this.onStartMf);
            }
            this._waitForStepElements(this.steps, true);
        },

        _waitForStepElements: function (elements, force) {
            var self = this;
            var n = 0;
            var wait = setInterval(function () {
                // console.log('waiting..' + n);
                if (elements
                    .filter(function (el) {
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

        _getElementClassName: function (modelerStep) {
            // debugger;
            return modelerStep.selector ?
                modelerStep.isMendixName ?
                    '.mx-name-' + modelerStep.selector :
                    modelerStep.selector :
                null; // default to an element so we don't get an infinite loop
        },

        _setupTour: function () {
            var self = this;
            this._introSteps = this.steps.map(function (s) {
                return {
                    content: s.intro ? s.intro : '',
                    element: self._getElementClassName(s),
                    orphan: !self._getElementClassName(s),
                    title: s.stepTitle ? s.stepTitle : '',
                    backdrop: s.backdrop,
                    backdropPadding: 5,
                    placement: s.position,
                    reflex: s.clickToContinue,
                    onShow: function (t) {
                        var target = document.querySelector(self._getElementClassName(s));
                        if (target && !self._elementIsOnScreen(target)) {
                            target.scrollIntoView();
                        }
                    },
                };
            });
        },

        _startTour: function (force) {
            var template = "<div class='popover tour'><div class='arrow'></div><h3 class='popover-title'></h3><div class='popover-content'></div><div class='popover-navigation'><div class='btn-group'><button class='btn btn-sm btn-default' data-role='prev' tabindex='-1'>« {{prev}}</button><button class='btn btn-sm btn-default' data-role='next'>{{next}} »</button></div><button class='btn btn-sm btn-default' data-role='end'>{{end}}</button></div></div>"
                .split('{{next}}').join(this.wlkNextButtonText)
                .split('{{prev}}').join(this.wlkPrevButtonText)
                .split('{{end}}').join(this.wlkEndButtonText);
            var self = this;
            var tour = new Tour({
                steps: self._introSteps,
                template: template,
                onEnd: function () {
                    if (self.afterMf) {
                        self._executeMicroflow(self.afterMf);
                    }
                }
            });

            tour.start(force);
            tour.goTo(0);

        },

        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");
            this.buttonNode.innerHTML = this.buttonText;
            dojoClass.add(this.buttonNode, 'btn-' + this.buttonBootstrap);
            dojoClass.add(this.buttonNode, this.buttonExtraClass);
            if (this.displayHook) {
                // this._shadow = this.domNode.cloneNode(true);
                var shadowRoot = document.querySelector(this.displayHook);
                while (shadowRoot.firstChild) {
                    shadowRoot.removeChild(shadowRoot.firstChild);
                }
                shadowRoot.appendChild(this.buttonNode);
            }
            this._executeCallback(callback);
        },

        _executeCallback: function (cb) {
            if (cb && typeof cb === "function") {
                cb();
            }
        },

        _executeMicroflow: function (mf) {
            var opts = {
                actionname: mf,
            };
            if (this._contextObj) {
                opts.applyto = "selection";
                opts.guids = [this._contextObj.getGuid()];
            } else {
                opts.applyto = "none"; // handle a callback with no context
            }
            mx.data.action({
                params: opts,
                callback: function (res) {
                    // self.afterMf;
                },
                error: function (err) {
                    console.info("there was an error evaluating the callback" + err);
                }
            });
        },

        _elementIsOnScreen: function (elm) {
            var rect = elm.getBoundingClientRect();
            var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
            // orig: bottom < 0        --> bottom of elm is above the viewport
            //       top - height >= 0 --> top of elm is below the viewport
            // return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
            // new: if the element is clipped at all
            var topbar = document.querySelector('.region-topbar');
            return !(rect.top < (topbar ? topbar.clientHeight : 0) || rect.bottom - viewHeight >= 0);
        }
    });
});

require(["Intro/widget/Intro"]);
