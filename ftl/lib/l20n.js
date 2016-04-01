(function () {
  'use strict';

  var babelHelpers = {};
  babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  babelHelpers.createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  babelHelpers.defineProperty = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  };

  babelHelpers.inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  babelHelpers.possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  babelHelpers.slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  babelHelpers.toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  babelHelpers;

  (function () {
    'use strict';

    function L10nError(message, id, lang) {
      this.name = 'L10nError';
      this.message = message;
      this.id = id;
      this.lang = lang;
    }
    L10nError.prototype = Object.create(Error.prototype);
    L10nError.prototype.constructor = L10nError;

    var HTTP_STATUS_CODE_OK = 200;

    function load(type, url) {
      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();

        if (xhr.overrideMimeType) {
          xhr.overrideMimeType(type);
        }

        xhr.open('GET', url, true);

        if (type === 'application/json') {
          xhr.responseType = 'json';
        }

        xhr.addEventListener('load', function (e) {
          if (e.target.status === HTTP_STATUS_CODE_OK || e.target.status === 0) {
            resolve(e.target.response);
          } else {
            reject(new L10nError('Not found: ' + url));
          }
        });
        xhr.addEventListener('error', reject);
        xhr.addEventListener('timeout', reject);

        try {
          xhr.send(null);
        } catch (e) {
          if (e.name === 'NS_ERROR_FILE_NOT_FOUND') {
            reject(new L10nError('Not found: ' + url));
          } else {
            throw e;
          }
        }
      });
    }

    var io = {
      extra: function extra(code, ver, path, type) {
        return navigator.mozApps.getLocalizationResource(code, ver, path, type);
      },
      app: function app(code, ver, path, type) {
        switch (type) {
          case 'text':
            return load('text/plain', path);
          case 'json':
            return load('application/json', path);
          default:
            throw new L10nError('Unknown file type: ' + type);
        }
      }
    };

    function fetchResource(res, _ref) {
      var code = _ref.code;
      var src = _ref.src;
      var ver = _ref.ver;

      var url = res.replace('{locale}', code);
      var type = res.endsWith('.json') ? 'json' : 'text';
      return io[src](code, ver, url, type);
    }

    function emit(listeners) {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var type = args.shift();

      if (listeners['*']) {
        listeners['*'].slice().forEach(function (listener) {
          return listener.apply(_this, args);
        });
      }

      if (listeners[type]) {
        listeners[type].slice().forEach(function (listener) {
          return listener.apply(_this, args);
        });
      }
    }

    function addEventListener(listeners, type, listener) {
      if (!(type in listeners)) {
        listeners[type] = [];
      }
      listeners[type].push(listener);
    }

    function removeEventListener(listeners, type, listener) {
      var typeListeners = listeners[type];
      var pos = typeListeners.indexOf(listener);
      if (pos === -1) {
        return;
      }

      typeListeners.splice(pos, 1);
    }

    var Client = function () {
      function Client(remote) {
        babelHelpers.classCallCheck(this, Client);

        this.id = this;
        this.remote = remote;

        var listeners = {};
        this.on = function () {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return addEventListener.apply(undefined, [listeners].concat(args));
        };
        this.emit = function () {
          for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
          }

          return emit.apply(undefined, [listeners].concat(args));
        };
      }

      babelHelpers.createClass(Client, [{
        key: 'method',
        value: function method(name) {
          var _remote;

          for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
            args[_key4 - 1] = arguments[_key4];
          }

          return (_remote = this.remote)[name].apply(_remote, args);
        }
      }]);
      return Client;
    }();

    function broadcast(type, data) {
      Array.from(this.ctxs.keys()).forEach(function (client) {
        return client.emit(type, data);
      });
    }

    if (typeof NodeList === 'function' && !NodeList.prototype[Symbol.iterator]) {
      NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
    }

    function documentReady() {
      if (document.readyState !== 'loading') {
        return Promise.resolve();
      }

      return new Promise(function (resolve) {
        document.addEventListener('readystatechange', function onrsc() {
          document.removeEventListener('readystatechange', onrsc);
          resolve();
        });
      });
    }

    function getDirection(code) {
      var tag = code.split('-')[0];
      return ['ar', 'he', 'fa', 'ps', 'ur'].indexOf(tag) >= 0 ? 'rtl' : 'ltr';
    }

    if (navigator.languages === undefined) {
      navigator.languages = [navigator.language];
    }

    function getResourceLinks(head) {
      return Array.prototype.map.call(head.querySelectorAll('link[rel="localization"]'), function (el) {
        return el.getAttribute('href');
      });
    }

    function getMeta(head) {
      var availableLangs = Object.create(null);
      var defaultLang = null;
      var appVersion = null;

      var metas = Array.from(head.querySelectorAll('meta[name="availableLanguages"],' + 'meta[name="defaultLanguage"],' + 'meta[name="appVersion"]'));
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = metas[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var meta = _step.value;

          var name = meta.getAttribute('name');
          var content = meta.getAttribute('content').trim();
          switch (name) {
            case 'availableLanguages':
              availableLangs = getLangRevisionMap(availableLangs, content);
              break;
            case 'defaultLanguage':
              var _getLangRevisionTuple = getLangRevisionTuple(content);

              var _getLangRevisionTuple2 = babelHelpers.slicedToArray(_getLangRevisionTuple, 2);

              var lang = _getLangRevisionTuple2[0];
              var rev = _getLangRevisionTuple2[1];

              defaultLang = lang;
              if (!(lang in availableLangs)) {
                availableLangs[lang] = rev;
              }
              break;
            case 'appVersion':
              appVersion = content;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return {
        defaultLang: defaultLang,
        availableLangs: availableLangs,
        appVersion: appVersion
      };
    }

    function getLangRevisionMap(seq, str) {
      return str.split(',').reduce(function (prevSeq, cur) {
        var _getLangRevisionTuple3 = getLangRevisionTuple(cur);

        var _getLangRevisionTuple4 = babelHelpers.slicedToArray(_getLangRevisionTuple3, 2);

        var lang = _getLangRevisionTuple4[0];
        var rev = _getLangRevisionTuple4[1];

        prevSeq[lang] = rev;
        return prevSeq;
      }, seq);
    }

    function getLangRevisionTuple(str) {
      var _str$trim$split = str.trim().split(':');

      var _str$trim$split2 = babelHelpers.slicedToArray(_str$trim$split, 2);

      var lang = _str$trim$split2[0];
      var rev = _str$trim$split2[1];

      return [lang, parseInt(rev)];
    }

    var reOverlay = /<|&#?\w+;/;

    var allowed = {
      elements: ['a', 'em', 'strong', 'small', 's', 'cite', 'q', 'dfn', 'abbr', 'data', 'time', 'code', 'var', 'samp', 'kbd', 'sub', 'sup', 'i', 'b', 'u', 'mark', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'span', 'br', 'wbr'],
      attributes: {
        global: ['title', 'aria-label', 'aria-valuetext', 'aria-moz-hint'],
        a: ['download'],
        area: ['download', 'alt'],

        input: ['alt', 'placeholder'],
        menuitem: ['label'],
        menu: ['label'],
        optgroup: ['label'],
        option: ['label'],
        track: ['label'],
        img: ['alt'],
        textarea: ['placeholder'],
        th: ['abbr']
      }
    };

    function overlayElement(element, translation) {
      var value = translation.value;

      if (typeof value === 'string') {
        if (!reOverlay.test(value)) {
          element.textContent = value;
        } else {
          var tmpl = element.ownerDocument.createElement('template');
          tmpl.innerHTML = value;

          overlay(element, tmpl.content);
        }
      }

      for (var key in translation.attrs) {
        var attrName = camelCaseToDashed(key);
        if (isAttrAllowed({ name: attrName }, element)) {
          element.setAttribute(attrName, translation.attrs[key]);
        }
      }
    }

    function overlay(sourceElement, translationElement) {
      var result = translationElement.ownerDocument.createDocumentFragment();
      var k = void 0,
          attr = void 0;

      var childElement = void 0;
      while (childElement = translationElement.childNodes[0]) {
        translationElement.removeChild(childElement);

        if (childElement.nodeType === childElement.TEXT_NODE) {
          result.appendChild(childElement);
          continue;
        }

        var index = getIndexOfType(childElement);
        var sourceChild = getNthElementOfType(sourceElement, childElement, index);
        if (sourceChild) {
          overlay(sourceChild, childElement);
          result.appendChild(sourceChild);
          continue;
        }

        if (isElementAllowed(childElement)) {
          var sanitizedChild = childElement.ownerDocument.createElement(childElement.nodeName);
          overlay(sanitizedChild, childElement);
          result.appendChild(sanitizedChild);
          continue;
        }

        result.appendChild(translationElement.ownerDocument.createTextNode(childElement.textContent));
      }

      sourceElement.textContent = '';
      sourceElement.appendChild(result);

      if (translationElement.attributes) {
        for (k = 0, attr; attr = translationElement.attributes[k]; k++) {
          if (isAttrAllowed(attr, sourceElement)) {
            sourceElement.setAttribute(attr.name, attr.value);
          }
        }
      }
    }

    function isElementAllowed(element) {
      return allowed.elements.indexOf(element.tagName.toLowerCase()) !== -1;
    }

    function isAttrAllowed(attr, element) {
      var attrName = attr.name.toLowerCase();
      var tagName = element.tagName.toLowerCase();

      if (allowed.attributes.global.indexOf(attrName) !== -1) {
        return true;
      }

      if (!allowed.attributes[tagName]) {
        return false;
      }

      if (allowed.attributes[tagName].indexOf(attrName) !== -1) {
        return true;
      }

      if (tagName === 'input' && attrName === 'value') {
        var type = element.type.toLowerCase();
        if (type === 'submit' || type === 'button' || type === 'reset') {
          return true;
        }
      }
      return false;
    }

    function getNthElementOfType(context, element, index) {
      var nthOfType = 0;
      for (var i = 0, child; child = context.children[i]; i++) {
        if (child.nodeType === child.ELEMENT_NODE && child.tagName === element.tagName) {
          if (nthOfType === index) {
            return child;
          }
          nthOfType++;
        }
      }
      return null;
    }

    function getIndexOfType(element) {
      var index = 0;
      var child = void 0;
      while (child = element.previousElementSibling) {
        if (child.tagName === element.tagName) {
          index++;
        }
      }
      return index;
    }

    function camelCaseToDashed(string) {
      if (string === 'ariaValueText') {
        return 'aria-valuetext';
      }

      return string.replace(/[A-Z]/g, function (match) {
        return '-' + match.toLowerCase();
      }).replace(/^-/, '');
    }

    var reHtml = /[&<>]/g;
    var htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    };

    function setAttributes(element, id, args) {
      element.setAttribute('data-l10n-id', id);
      if (args) {
        element.setAttribute('data-l10n-args', JSON.stringify(args));
      }
    }

    function getAttributes(element) {
      return {
        id: element.getAttribute('data-l10n-id'),
        args: JSON.parse(element.getAttribute('data-l10n-args'))
      };
    }

    function getTranslatables(element) {
      var nodes = Array.from(element.querySelectorAll('[data-l10n-id]'));

      if (typeof element.hasAttribute === 'function' && element.hasAttribute('data-l10n-id')) {
        nodes.push(element);
      }

      return nodes;
    }

    function translateMutations(view, mutations) {
      var targets = new Set();

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = mutations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var mutation = _step2.value;

          switch (mutation.type) {
            case 'attributes':
              targets.add(mutation.target);
              break;
            case 'childList':
              var _iteratorNormalCompletion3 = true;
              var _didIteratorError3 = false;
              var _iteratorError3 = undefined;

              try {
                for (var _iterator3 = mutation.addedNodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                  var addedNode = _step3.value;

                  if (addedNode.nodeType === addedNode.ELEMENT_NODE) {
                    if (addedNode.childElementCount) {
                      getTranslatables(addedNode).forEach(targets.add.bind(targets));
                    } else {
                      if (addedNode.hasAttribute('data-l10n-id')) {
                        targets.add(addedNode);
                      }
                    }
                  }
                }
              } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                  }
                } finally {
                  if (_didIteratorError3) {
                    throw _iteratorError3;
                  }
                }
              }

              break;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (targets.size === 0) {
        return;
      }

      translateElements(view, Array.from(targets));
    }

    function _translateFragment(view, frag) {
      return translateElements(view, getTranslatables(frag));
    }

    function getElementsTranslation(view, elems) {
      var keys = elems.map(function (elem) {
        var id = elem.getAttribute('data-l10n-id');
        var args = elem.getAttribute('data-l10n-args');
        return args ? [id, JSON.parse(args.replace(reHtml, function (match) {
          return htmlEntities[match];
        }))] : id;
      });

      return view.formatEntities.apply(view, babelHelpers.toConsumableArray(keys));
    }

    function translateElements(view, elements) {
      return getElementsTranslation(view, elements).then(function (translations) {
        return applyTranslations(view, elements, translations);
      });
    }

    function applyTranslations(view, elems, translations) {
      disconnect(view, null, true);
      for (var i = 0; i < elems.length; i++) {
        overlayElement(elems[i], translations[i]);
      }
      reconnect(view);
    }

    var observerConfig = {
      attributes: true,
      characterData: false,
      childList: true,
      subtree: true,
      attributeFilter: ['data-l10n-id', 'data-l10n-args']
    };

    var observers = new WeakMap();

    function initMutationObserver(view) {
      observers.set(view, {
        roots: new Set(),
        observer: new MutationObserver(function (mutations) {
          return translateMutations(view, mutations);
        })
      });
    }

    function translateRoots(view) {
      var roots = Array.from(observers.get(view).roots);
      return Promise.all(roots.map(function (root) {
        return _translateFragment(view, root);
      }));
    }

    function observe(view, root) {
      var obs = observers.get(view);
      if (obs) {
        obs.roots.add(root);
        obs.observer.observe(root, observerConfig);
      }
    }

    function disconnect(view, root, allRoots) {
      var obs = observers.get(view);
      if (obs) {
        obs.observer.disconnect();
        if (allRoots) {
          return;
        }
        obs.roots.delete(root);
        obs.roots.forEach(function (other) {
          return obs.observer.observe(other, observerConfig);
        });
      }
    }

    function reconnect(view) {
      var obs = observers.get(view);
      if (obs) {
        obs.roots.forEach(function (root) {
          return obs.observer.observe(root, observerConfig);
        });
      }
    }

    var viewProps = new WeakMap();

    var View = function () {
      function View(client, doc) {
        var _this2 = this;

        babelHelpers.classCallCheck(this, View);

        this.pseudo = {
          'fr-x-psaccent': createPseudo(this, 'fr-x-psaccent'),
          'ar-x-psbidi': createPseudo(this, 'ar-x-psbidi')
        };

        var initialized = documentReady().then(function () {
          return init(_this2, client);
        });
        this._interactive = initialized.then(function () {
          return client;
        });
        this.ready = initialized.then(function (langs) {
          return translateView(_this2, langs);
        });
        initMutationObserver(this);

        viewProps.set(this, {
          doc: doc,
          ready: false
        });

        client.on('languageschangerequest', function (requestedLangs) {
          return _this2.requestLanguages(requestedLangs);
        });
      }

      babelHelpers.createClass(View, [{
        key: 'requestLanguages',
        value: function requestLanguages(requestedLangs, isGlobal) {
          var _this3 = this;

          var method = isGlobal ? function (client) {
            return client.method('requestLanguages', requestedLangs);
          } : function (client) {
            return changeLanguages(_this3, client, requestedLangs);
          };
          return this._interactive.then(method);
        }
      }, {
        key: 'handleEvent',
        value: function handleEvent() {
          return this.requestLanguages(navigator.languages);
        }
      }, {
        key: 'formatEntities',
        value: function formatEntities() {
          for (var _len5 = arguments.length, keys = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            keys[_key5] = arguments[_key5];
          }

          return this._interactive.then(function (client) {
            return client.method('formatEntities', client.id, keys);
          });
        }
      }, {
        key: 'formatValue',
        value: function formatValue(id, args) {
          return this._interactive.then(function (client) {
            return client.method('formatValues', client.id, [[id, args]]);
          }).then(function (values) {
            return values[0];
          });
        }
      }, {
        key: 'formatValues',
        value: function formatValues() {
          for (var _len6 = arguments.length, keys = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            keys[_key6] = arguments[_key6];
          }

          return this._interactive.then(function (client) {
            return client.method('formatValues', client.id, keys);
          });
        }
      }, {
        key: 'translateFragment',
        value: function translateFragment(frag) {
          return _translateFragment(this, frag);
        }
      }, {
        key: 'observeRoot',
        value: function observeRoot(root) {
          observe(this, root);
        }
      }, {
        key: 'disconnectRoot',
        value: function disconnectRoot(root) {
          disconnect(this, root);
        }
      }]);
      return View;
    }();

    View.prototype.setAttributes = setAttributes;
    View.prototype.getAttributes = getAttributes;

    function createPseudo(view, code) {
      return {
        getName: function getName() {
          return view._interactive.then(function (client) {
            return client.method('getName', code);
          });
        },
        processString: function processString(str) {
          return view._interactive.then(function (client) {
            return client.method('processString', code, str);
          });
        }
      };
    }

    function init(view, client) {
      var doc = viewProps.get(view).doc;
      var resources = getResourceLinks(doc.head);
      var meta = getMeta(doc.head);
      view.observeRoot(doc.documentElement);
      return getAdditionalLanguages().then(function (additionalLangs) {
        return client.method('registerView', client.id, resources, meta, additionalLangs, navigator.languages);
      });
    }

    function changeLanguages(view, client, requestedLangs) {
      var doc = viewProps.get(view).doc;
      var meta = getMeta(doc.head);
      return getAdditionalLanguages().then(function (additionalLangs) {
        return client.method('changeLanguages', client.id, meta, additionalLangs, requestedLangs);
      }).then(function (_ref2) {
        var langs = _ref2.langs;
        var haveChanged = _ref2.haveChanged;
        return haveChanged ? translateView(view, langs) : undefined;
      });
    }

    function getAdditionalLanguages() {
      if (navigator.mozApps && navigator.mozApps.getAdditionalLanguages) {
        return navigator.mozApps.getAdditionalLanguages().catch(function () {
          return Object.create(null);
        });
      }

      return Promise.resolve(Object.create(null));
    }

    function translateView(view, langs) {
      var props = viewProps.get(view);
      var html = props.doc.documentElement;

      if (props.ready) {
        return translateRoots(view).then(function () {
          return setAllAndEmit(html, langs);
        });
      }

      var translated = langs[0].code === html.getAttribute('lang') ? Promise.resolve() : translateRoots(view).then(function () {
        return setLangDir(html, langs);
      });

      return translated.then(function () {
        setLangs(html, langs);
        props.ready = true;
      });
    }

    function setLangs(html, langs) {
      var codes = langs.map(function (lang) {
        return lang.code;
      });
      html.setAttribute('langs', codes.join(' '));
    }

    function setLangDir(html, langs) {
      var code = langs[0].code;
      html.setAttribute('lang', code);
      html.setAttribute('dir', getDirection(code));
    }

    function setAllAndEmit(html, langs) {
      setLangDir(html, langs);
      setLangs(html, langs);
      html.parentNode.dispatchEvent(new CustomEvent('DOMRetranslated', {
        bubbles: false,
        cancelable: false
      }));
    }

    var locales2rules = {
      'af': 3,
      'ak': 4,
      'am': 4,
      'ar': 1,
      'asa': 3,
      'az': 0,
      'be': 11,
      'bem': 3,
      'bez': 3,
      'bg': 3,
      'bh': 4,
      'bm': 0,
      'bn': 3,
      'bo': 0,
      'br': 20,
      'brx': 3,
      'bs': 11,
      'ca': 3,
      'cgg': 3,
      'chr': 3,
      'cs': 12,
      'cy': 17,
      'da': 3,
      'de': 3,
      'dv': 3,
      'dz': 0,
      'ee': 3,
      'el': 3,
      'en': 3,
      'eo': 3,
      'es': 3,
      'et': 3,
      'eu': 3,
      'fa': 0,
      'ff': 5,
      'fi': 3,
      'fil': 4,
      'fo': 3,
      'fr': 5,
      'fur': 3,
      'fy': 3,
      'ga': 8,
      'gd': 24,
      'gl': 3,
      'gsw': 3,
      'gu': 3,
      'guw': 4,
      'gv': 23,
      'ha': 3,
      'haw': 3,
      'he': 2,
      'hi': 4,
      'hr': 11,
      'hu': 0,
      'id': 0,
      'ig': 0,
      'ii': 0,
      'is': 3,
      'it': 3,
      'iu': 7,
      'ja': 0,
      'jmc': 3,
      'jv': 0,
      'ka': 0,
      'kab': 5,
      'kaj': 3,
      'kcg': 3,
      'kde': 0,
      'kea': 0,
      'kk': 3,
      'kl': 3,
      'km': 0,
      'kn': 0,
      'ko': 0,
      'ksb': 3,
      'ksh': 21,
      'ku': 3,
      'kw': 7,
      'lag': 18,
      'lb': 3,
      'lg': 3,
      'ln': 4,
      'lo': 0,
      'lt': 10,
      'lv': 6,
      'mas': 3,
      'mg': 4,
      'mk': 16,
      'ml': 3,
      'mn': 3,
      'mo': 9,
      'mr': 3,
      'ms': 0,
      'mt': 15,
      'my': 0,
      'nah': 3,
      'naq': 7,
      'nb': 3,
      'nd': 3,
      'ne': 3,
      'nl': 3,
      'nn': 3,
      'no': 3,
      'nr': 3,
      'nso': 4,
      'ny': 3,
      'nyn': 3,
      'om': 3,
      'or': 3,
      'pa': 3,
      'pap': 3,
      'pl': 13,
      'ps': 3,
      'pt': 3,
      'rm': 3,
      'ro': 9,
      'rof': 3,
      'ru': 11,
      'rwk': 3,
      'sah': 0,
      'saq': 3,
      'se': 7,
      'seh': 3,
      'ses': 0,
      'sg': 0,
      'sh': 11,
      'shi': 19,
      'sk': 12,
      'sl': 14,
      'sma': 7,
      'smi': 7,
      'smj': 7,
      'smn': 7,
      'sms': 7,
      'sn': 3,
      'so': 3,
      'sq': 3,
      'sr': 11,
      'ss': 3,
      'ssy': 3,
      'st': 3,
      'sv': 3,
      'sw': 3,
      'syr': 3,
      'ta': 3,
      'te': 3,
      'teo': 3,
      'th': 0,
      'ti': 4,
      'tig': 3,
      'tk': 3,
      'tl': 4,
      'tn': 3,
      'to': 0,
      'tr': 0,
      'ts': 3,
      'tzm': 22,
      'uk': 11,
      'ur': 3,
      've': 3,
      'vi': 0,
      'vun': 3,
      'wa': 4,
      'wae': 3,
      'wo': 0,
      'xh': 3,
      'xog': 3,
      'yo': 0,
      'zh': 0,
      'zu': 3
    };

    function isIn(n, list) {
      return list.indexOf(n) !== -1;
    }
    function isBetween(n, start, end) {
      return (typeof n === 'undefined' ? 'undefined' : babelHelpers.typeof(n)) === (typeof start === 'undefined' ? 'undefined' : babelHelpers.typeof(start)) && start <= n && n <= end;
    }

    var pluralRules = {
      '0': function _() {
        return 'other';
      },
      '1': function _(n) {
        if (isBetween(n % 100, 3, 10)) {
          return 'few';
        }
        if (n === 0) {
          return 'zero';
        }
        if (isBetween(n % 100, 11, 99)) {
          return 'many';
        }
        if (n === 2) {
          return 'two';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '2': function _(n) {
        if (n !== 0 && n % 10 === 0) {
          return 'many';
        }
        if (n === 2) {
          return 'two';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '3': function _(n) {
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '4': function _(n) {
        if (isBetween(n, 0, 1)) {
          return 'one';
        }
        return 'other';
      },
      '5': function _(n) {
        if (isBetween(n, 0, 2) && n !== 2) {
          return 'one';
        }
        return 'other';
      },
      '6': function _(n) {
        if (n === 0) {
          return 'zero';
        }
        if (n % 10 === 1 && n % 100 !== 11) {
          return 'one';
        }
        return 'other';
      },
      '7': function _(n) {
        if (n === 2) {
          return 'two';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '8': function _(n) {
        if (isBetween(n, 3, 6)) {
          return 'few';
        }
        if (isBetween(n, 7, 10)) {
          return 'many';
        }
        if (n === 2) {
          return 'two';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '9': function _(n) {
        if (n === 0 || n !== 1 && isBetween(n % 100, 1, 19)) {
          return 'few';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '10': function _(n) {
        if (isBetween(n % 10, 2, 9) && !isBetween(n % 100, 11, 19)) {
          return 'few';
        }
        if (n % 10 === 1 && !isBetween(n % 100, 11, 19)) {
          return 'one';
        }
        return 'other';
      },
      '11': function _(n) {
        if (isBetween(n % 10, 2, 4) && !isBetween(n % 100, 12, 14)) {
          return 'few';
        }
        if (n % 10 === 0 || isBetween(n % 10, 5, 9) || isBetween(n % 100, 11, 14)) {
          return 'many';
        }
        if (n % 10 === 1 && n % 100 !== 11) {
          return 'one';
        }
        return 'other';
      },
      '12': function _(n) {
        if (isBetween(n, 2, 4)) {
          return 'few';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '13': function _(n) {
        if (isBetween(n % 10, 2, 4) && !isBetween(n % 100, 12, 14)) {
          return 'few';
        }
        if (n !== 1 && isBetween(n % 10, 0, 1) || isBetween(n % 10, 5, 9) || isBetween(n % 100, 12, 14)) {
          return 'many';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '14': function _(n) {
        if (isBetween(n % 100, 3, 4)) {
          return 'few';
        }
        if (n % 100 === 2) {
          return 'two';
        }
        if (n % 100 === 1) {
          return 'one';
        }
        return 'other';
      },
      '15': function _(n) {
        if (n === 0 || isBetween(n % 100, 2, 10)) {
          return 'few';
        }
        if (isBetween(n % 100, 11, 19)) {
          return 'many';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '16': function _(n) {
        if (n % 10 === 1 && n !== 11) {
          return 'one';
        }
        return 'other';
      },
      '17': function _(n) {
        if (n === 3) {
          return 'few';
        }
        if (n === 0) {
          return 'zero';
        }
        if (n === 6) {
          return 'many';
        }
        if (n === 2) {
          return 'two';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '18': function _(n) {
        if (n === 0) {
          return 'zero';
        }
        if (isBetween(n, 0, 2) && n !== 0 && n !== 2) {
          return 'one';
        }
        return 'other';
      },
      '19': function _(n) {
        if (isBetween(n, 2, 10)) {
          return 'few';
        }
        if (isBetween(n, 0, 1)) {
          return 'one';
        }
        return 'other';
      },
      '20': function _(n) {
        if ((isBetween(n % 10, 3, 4) || n % 10 === 9) && !(isBetween(n % 100, 10, 19) || isBetween(n % 100, 70, 79) || isBetween(n % 100, 90, 99))) {
          return 'few';
        }
        if (n % 1000000 === 0 && n !== 0) {
          return 'many';
        }
        if (n % 10 === 2 && !isIn(n % 100, [12, 72, 92])) {
          return 'two';
        }
        if (n % 10 === 1 && !isIn(n % 100, [11, 71, 91])) {
          return 'one';
        }
        return 'other';
      },
      '21': function _(n) {
        if (n === 0) {
          return 'zero';
        }
        if (n === 1) {
          return 'one';
        }
        return 'other';
      },
      '22': function _(n) {
        if (isBetween(n, 0, 1) || isBetween(n, 11, 99)) {
          return 'one';
        }
        return 'other';
      },
      '23': function _(n) {
        if (isBetween(n % 10, 1, 2) || n % 20 === 0) {
          return 'one';
        }
        return 'other';
      },
      '24': function _(n) {
        if (isBetween(n, 3, 10) || isBetween(n, 13, 19)) {
          return 'few';
        }
        if (isIn(n, [2, 12])) {
          return 'two';
        }
        if (isIn(n, [1, 11])) {
          return 'one';
        }
        return 'other';
      }
    };

    function getPluralRule(code) {
      var index = locales2rules[code.replace(/-.*$/, '')];
      if (!(index in pluralRules)) {
        return function (n) {
          return 'other';
        };
      }
      return pluralRules[index];
    }

    var L20nIntl = typeof Intl !== 'undefined' ? Intl : {};

    if (!L20nIntl.NumberFormat) {
      L20nIntl.NumberFormat = function () {
        return {
          format: function format(n) {
            return n;
          }
        };
      };
    }

    if (!L20nIntl.PluralRules) {
      L20nIntl.PluralRules = function (code) {
        var fn = getPluralRule(code);
        return {
          select: function select(n) {
            return fn(n);
          }
        };
      };
    }

    if (!L20nIntl.ListFormat) {
      L20nIntl.ListFormat = function () {
        return {
          format: function format(list) {
            return list.join(', ');
          }
        };
      };
    }

    var FTLNone = function () {
      function FTLNone() {
        babelHelpers.classCallCheck(this, FTLNone);
      }

      babelHelpers.createClass(FTLNone, [{
        key: 'format',
        value: function format() {
          return this.value || '???';
        }
      }, {
        key: 'match',
        value: function match() {
          return false;
        }
      }]);
      return FTLNone;
    }();

    ;

    var FTLText = function (_FTLNone) {
      babelHelpers.inherits(FTLText, _FTLNone);

      function FTLText(value) {
        babelHelpers.classCallCheck(this, FTLText);

        var _this4 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(FTLText).call(this));

        _this4.value = value;
        return _this4;
      }

      babelHelpers.createClass(FTLText, [{
        key: 'format',
        value: function format() {
          return this.value.toString();
        }
      }, {
        key: 'match',
        value: function match(res, _ref3) {
          var value = _ref3.value;

          return this.value === value;
        }
      }]);
      return FTLText;
    }(FTLNone);

    ;

    var FTLNumber = function (_FTLText) {
      babelHelpers.inherits(FTLNumber, _FTLText);

      function FTLNumber(value, opts) {
        babelHelpers.classCallCheck(this, FTLNumber);

        var _this5 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(FTLNumber).call(this, parseFloat(value)));

        _this5.opts = opts;
        return _this5;
      }

      babelHelpers.createClass(FTLNumber, [{
        key: 'format',
        value: function format(res) {
          var nf = res.ctx._memoizeIntlObject(L20nIntl.NumberFormat, res.lang, this.opts);
          return nf.format(this.value);
        }
      }, {
        key: 'match',
        value: function match(res, _ref4) {
          var value = _ref4.value;

          switch (typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) {
            case 'number':
              return this.value === value;
            case 'string':
              var pr = res.ctx._memoizeIntlObject(L20nIntl.PluralRules, res.lang, this.opts);
              return pr.select(this.value) === value;
          }
        }
      }]);
      return FTLNumber;
    }(FTLText);

    var FTLCategory = function (_FTLNumber) {
      babelHelpers.inherits(FTLCategory, _FTLNumber);

      function FTLCategory() {
        babelHelpers.classCallCheck(this, FTLCategory);
        return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(FTLCategory).apply(this, arguments));
      }

      babelHelpers.createClass(FTLCategory, [{
        key: 'format',
        value: function format(res) {
          var pr = res.ctx._memoizeIntlObject(L20nIntl.PluralRules, res.lang);
          return pr.select(this.value);
        }
      }, {
        key: 'match',
        value: function match(res, _ref5) {
          var value = _ref5.value;

          switch (typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) {
            case 'number':
              return this.value === value;
            case 'string':
              return this.format(res) === value;
          }
        }
      }]);
      return FTLCategory;
    }(FTLNumber);

    var FTLKeyword = function (_FTLText2) {
      babelHelpers.inherits(FTLKeyword, _FTLText2);

      function FTLKeyword(value, namespace) {
        babelHelpers.classCallCheck(this, FTLKeyword);

        var _this7 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(FTLKeyword).call(this, value));

        _this7.namespace = namespace;
        return _this7;
      }

      babelHelpers.createClass(FTLKeyword, [{
        key: 'format',
        value: function format() {
          return this.namespace ? this.namespace + ':' + this.value : this.value;
        }
      }, {
        key: 'match',
        value: function match(res, _ref6) {
          var namespace = _ref6.namespace;
          var value = _ref6.value;

          return this.namespace === namespace && this.value === value;
        }
      }]);
      return FTLKeyword;
    }(FTLText);

    ;

    var FTLKeyValueArg = function (_FTLText3) {
      babelHelpers.inherits(FTLKeyValueArg, _FTLText3);

      function FTLKeyValueArg(value, id) {
        babelHelpers.classCallCheck(this, FTLKeyValueArg);

        var _this8 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(FTLKeyValueArg).call(this, value));

        _this8.id = id;
        return _this8;
      }

      return FTLKeyValueArg;
    }(FTLText);

    ;

    var FTLList = function (_FTLText4) {
      babelHelpers.inherits(FTLList, _FTLText4);

      function FTLList() {
        babelHelpers.classCallCheck(this, FTLList);
        return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(FTLList).apply(this, arguments));
      }

      babelHelpers.createClass(FTLList, [{
        key: 'format',
        value: function format(res) {
          var lf = res.ctx._memoizeIntlObject(L20nIntl.ListFormat, res.lang, this.opts);
          var elems = this.value.map(function (elem) {
            return elem.format(res);
          });
          return lf.format(elems);
        }
      }, {
        key: 'match',
        value: function match() {
          return false;
        }
      }]);
      return FTLList;
    }(FTLText);

    ;

    var builtins = {
      'NUMBER': function NUMBER(_ref7, opts) {
        var _ref8 = babelHelpers.slicedToArray(_ref7, 1);

        var num = _ref8[0];
        return new FTLNumber(num.value, values(opts));
      },
      'PLURAL': function PLURAL(_ref9, opts) {
        var _ref10 = babelHelpers.slicedToArray(_ref9, 1);

        var num = _ref10[0];
        return new FTLCategory(num.value, values(opts));
      },
      'LIST': function LIST() {
        for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
          args[_key7] = arguments[_key7];
        }

        return new (Function.prototype.bind.apply(FTLList, [null].concat(args)))();
      }
    };

    function values(opts) {
      return Object.keys(opts).reduce(function (seq, cur) {
        return Object.assign({}, seq, babelHelpers.defineProperty({}, cur, opts[cur].value));
      }, {});
    }

    var FSI = '⁨';
    var PDI = '⁩';

    function mapValues(res, arr) {
      return arr.reduce(function (_ref11, cur) {
        var _ref12 = babelHelpers.slicedToArray(_ref11, 2);

        var errSeq = _ref12[0];
        var valSeq = _ref12[1];

        var _Value = Value(res, cur);

        var _Value2 = babelHelpers.slicedToArray(_Value, 2);

        var errs = _Value2[0];
        var value = _Value2[1];

        return [[].concat(babelHelpers.toConsumableArray(errSeq), babelHelpers.toConsumableArray(errs)), new FTLList([].concat(babelHelpers.toConsumableArray(valSeq.value), [value]))];
      }, [[], new FTLList([])]);
    }

    function unit(val) {
      return [[], val];
    }

    function fail(prevErrs, _ref13) {
      var _ref14 = babelHelpers.slicedToArray(_ref13, 2);

      var errs = _ref14[0];
      var value = _ref14[1];

      return [[].concat(babelHelpers.toConsumableArray(prevErrs), babelHelpers.toConsumableArray(errs)), value];
    }

    function DefaultMember(members) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = members[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var member = _step4.value;

          if (member.def) {
            return unit(member);
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return fail([new L10nError('No default')], unit(new FTLNone()));
    }

    function Expression(res, expr) {
      switch (expr.type) {
        case 'ref':
          return EntityReference(res, expr);
        case 'blt':
          return BuiltinReference(res, expr);
        case 'mem':
          return MemberExpression(res, expr);
        case 'sel':
          return SelectExpression(res, expr);
        default:
          return unit(expr);
      }
    }

    function EntityReference(res, expr) {
      var entity = res.ctx._getEntity(res.lang, expr.name);

      if (!entity) {
        return fail([new L10nError('Unknown entity: ' + expr.name)], unit(new FTLText(expr.name)));
      }

      return unit(entity);
    }

    function BuiltinReference(res, expr) {
      var builtin = builtins[expr.name];

      if (!builtin) {
        return fail([new L10nError('Unknown built-in: ' + expr.name + '()')], unit(new FTLText(expr.name + '()')));
      }

      return unit(builtin);
    }

    function MemberExpression(res, expr) {
      var _Expression = Expression(res, expr.obj);

      var _Expression2 = babelHelpers.slicedToArray(_Expression, 2);

      var errs1 = _Expression2[0];
      var entity = _Expression2[1];

      if (errs1.length) {
        return fail(errs1, Value(res, entity));
      }

      var _Value3 = Value(res, expr.key);

      var _Value4 = babelHelpers.slicedToArray(_Value3, 2);

      var key = _Value4[1];
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {

        for (var _iterator5 = entity.traits[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var member = _step5.value;

          var _Value5 = Value(res, member.key);

          var _Value6 = babelHelpers.slicedToArray(_Value5, 2);

          var memberKey = _Value6[1];

          if (key.match(res, memberKey)) {
            return unit(member);
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return fail([new L10nError('Unknown trait: ' + key.format(res))], Value(res, entity));
    }

    function SelectExpression(res, expr) {
      var _Value7 = Value(res, expr.exp);

      var _Value8 = babelHelpers.slicedToArray(_Value7, 2);

      var selErrs = _Value8[0];
      var selector = _Value8[1];

      if (selErrs.length) {
        return fail(selErrs, DefaultMember(expr.vars));
      }

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = expr.vars[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var variant = _step6.value;

          var _Value9 = Value(res, variant.key);

          var _Value10 = babelHelpers.slicedToArray(_Value9, 2);

          var key = _Value10[1];

          if (selector.match(res, key)) {
            return unit(variant);
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return DefaultMember(expr.vars);
    }

    function Value(res, expr) {
      if (typeof expr === 'string') {
        return unit(new FTLText(expr));
      }

      if (Array.isArray(expr)) {
        return Pattern(res, expr);
      }

      if (expr instanceof FTLNone) {
        return unit(expr);
      }

      var _Expression3 = Expression(res, expr);

      var _Expression4 = babelHelpers.slicedToArray(_Expression3, 2);

      var errs = _Expression4[0];
      var node = _Expression4[1];

      if (errs.length) {
        return fail(errs, Value(res, node));
      }

      switch (node.type) {
        case 'id':
          return unit(new FTLKeyword(node.name, node.ns));
        case 'num':
          return unit(new FTLNumber(node.val));
        case 'ext':
          return ExternalArgument(res, node);
        case 'kv':
          return KeyValueArg(res, expr);
        case 'call':
          return CallExpression(res, expr);
        default:
          if (node.key) {
            return Value(res, node.val);
          }
          return Entity(res, node);
      }
    }

    function ExternalArgument(res, expr) {
      var name = expr.name;
      var args = res.args;

      if (!args || !args.hasOwnProperty(name)) {
        return fail([new L10nError('Unknown external: ' + name)], unit(new FTLNone(name)));
      }

      var arg = args[name];

      switch (typeof arg === 'undefined' ? 'undefined' : babelHelpers.typeof(arg)) {
        case 'number':
          return unit(new FTLNumber(arg));
        case 'string':
          return unit(new FTLText(arg));
        default:
          return fail([new L10nError('Unsupported external type: ' + name + ', ' + (typeof arg === 'undefined' ? 'undefined' : babelHelpers.typeof(arg)))], unit(new FTLNone(name)));
      }
    }

    function KeyValueArg(res, expr) {
      var _Value11 = Value(res, expr.val);

      var _Value12 = babelHelpers.slicedToArray(_Value11, 2);

      var errs = _Value12[0];
      var value = _Value12[1];

      return [errs, new FTLKeyValueArg(value, expr.name)];
    }

    function CallExpression(res, expr) {
      var _Expression5 = Expression(res, expr.name);

      var _Expression6 = babelHelpers.slicedToArray(_Expression5, 2);

      var errs1 = _Expression6[0];
      var callee = _Expression6[1];

      if (errs1.length) {
        return fail(errs1, unit(callee));
      }

      var _mapValues = mapValues(res, expr.args);

      var _mapValues2 = babelHelpers.slicedToArray(_mapValues, 2);

      var errs2 = _mapValues2[0];
      var args = _mapValues2[1];

      var _args$value$reduce = args.value.reduce(function (_ref15, arg) {
        var _ref16 = babelHelpers.slicedToArray(_ref15, 2);

        var pargs = _ref16[0];
        var kargs = _ref16[1];
        return arg instanceof FTLKeyValueArg ? [pargs, Object.assign({}, kargs, babelHelpers.defineProperty({}, arg.id, arg.value))] : [[].concat(babelHelpers.toConsumableArray(pargs), [arg]), kargs];
      }, [[], {}]);

      var _args$value$reduce2 = babelHelpers.slicedToArray(_args$value$reduce, 2);

      var pargs = _args$value$reduce2[0];
      var kargs = _args$value$reduce2[1];

      return [errs2, callee(pargs, kargs)];
    }

    function Pattern(res, ptn) {
      if (res.dirty.has(ptn)) {
        return fail([new L10nError('Cyclic reference')], unit(new FTLNone()));
      }

      res.dirty.add(ptn);
      var rv = formatPattern(res, ptn);
      res.dirty.delete(ptn);
      return rv;
    }

    function Entity(res, entity) {
      if (!entity.traits) {
        return Value(res, entity);
      }

      if (entity.val !== undefined) {
        return Value(res, entity.val);
      }

      var _DefaultMember = DefaultMember(entity.traits);

      var _DefaultMember2 = babelHelpers.slicedToArray(_DefaultMember, 2);

      var errs = _DefaultMember2[0];
      var def = _DefaultMember2[1];


      if (errs.length) {
        return fail([].concat(babelHelpers.toConsumableArray(errs), [new L10nError('No value')]), unit(new FTLNone()));
      }

      return Value(res, def.val);
    }

    function formatPattern(res, ptn) {
      return ptn.reduce(function (_ref17, elem) {
        var _ref18 = babelHelpers.slicedToArray(_ref17, 2);

        var errSeq = _ref18[0];
        var valSeq = _ref18[1];

        if (typeof elem === 'string') {
          return [errSeq, new FTLText(valSeq.format(res) + elem)];
        } else {
          var _mapValues3 = mapValues(res, elem);

          var _mapValues4 = babelHelpers.slicedToArray(_mapValues3, 2);

          var errs = _mapValues4[0];
          var value = _mapValues4[1];

          return [[].concat(babelHelpers.toConsumableArray(errSeq), babelHelpers.toConsumableArray(errs)), new FTLText(valSeq.format(res) + FSI + value.format(res) + PDI)];
        }
      }, [[], new FTLText('')]);
    }

    function format(ctx, lang, args, entity) {
      var res = {
        ctx: ctx,
        lang: lang,
        args: args,
        dirty: new WeakSet()
      };

      var _Entity = Entity(res, entity);

      var _Entity2 = babelHelpers.slicedToArray(_Entity, 2);

      var errs = _Entity2[0];
      var value = _Entity2[1];

      return [errs, value.format(res)];
    }

    var Context = function () {
      function Context(env, langs, resIds) {
        var _this10 = this;

        babelHelpers.classCallCheck(this, Context);

        this.langs = langs;
        this.resIds = resIds;
        this.env = env;
        this.emit = function (type, evt) {
          return env.emit(type, evt, _this10);
        };
      }

      babelHelpers.createClass(Context, [{
        key: '_formatTuple',
        value: function _formatTuple(lang, args, entity, id, key) {
          try {
            return format(this, lang, args, entity);
          } catch (err) {
            err.id = key ? id + '::' + key : id;
            err.lang = lang;
            this.emit('resolveerror', err);
            return [{ error: err }, err.id];
          }
        }
      }, {
        key: '_formatEntity',
        value: function _formatEntity(lang, args, entity, id) {
          var _formatTuple2 = this._formatTuple(lang, args, entity, id);

          var _formatTuple3 = babelHelpers.slicedToArray(_formatTuple2, 2);

          var value = _formatTuple3[1];


          var formatted = {
            value: value,
            attrs: null
          };

          if (entity.attrs) {
            formatted.attrs = Object.create(null);
            for (var key in entity.attrs) {
              var _formatTuple4 = this._formatTuple(lang, args, entity.attrs[key], id, key);

              var _formatTuple5 = babelHelpers.slicedToArray(_formatTuple4, 2);

              var attrValue = _formatTuple5[1];

              formatted.attrs[key] = attrValue;
            }
          }

          return formatted;
        }
      }, {
        key: '_formatValue',
        value: function _formatValue(lang, args, entity, id) {
          return this._formatTuple(lang, args, entity, id)[1];
        }
      }, {
        key: 'fetch',
        value: function fetch() {
          var _this11 = this;

          var langs = arguments.length <= 0 || arguments[0] === undefined ? this.langs : arguments[0];

          if (langs.length === 0) {
            return Promise.resolve(langs);
          }

          return Promise.all(this.resIds.map(function (resId) {
            return _this11.env._getResource(langs[0], resId);
          })).then(function () {
            return langs;
          });
        }
      }, {
        key: '_resolve',
        value: function _resolve(langs, keys, formatter, prevResolved) {
          var _this12 = this;

          var lang = langs[0];

          if (!lang) {
            return reportMissing.call(this, keys, formatter, prevResolved);
          }

          var hasUnresolved = false;

          var resolved = keys.map(function (key, i) {
            if (prevResolved && prevResolved[i] !== undefined) {
              return prevResolved[i];
            }

            var _ref19 = Array.isArray(key) ? key : [key, undefined];

            var _ref20 = babelHelpers.slicedToArray(_ref19, 2);

            var id = _ref20[0];
            var args = _ref20[1];

            var entity = _this12._getEntity(lang, id);

            if (entity) {
              return formatter.call(_this12, lang, args, entity, id);
            }

            _this12.emit('notfounderror', new L10nError('"' + id + '" not found in ' + lang.code, id, lang));
            hasUnresolved = true;
          });

          if (!hasUnresolved) {
            return resolved;
          }

          return this.fetch(langs.slice(1)).then(function (nextLangs) {
            return _this12._resolve(nextLangs, keys, formatter, resolved);
          });
        }
      }, {
        key: 'formatEntities',
        value: function formatEntities() {
          var _this13 = this;

          for (var _len8 = arguments.length, keys = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
            keys[_key8] = arguments[_key8];
          }

          return this.fetch().then(function (langs) {
            return _this13._resolve(langs, keys, _this13._formatEntity);
          });
        }
      }, {
        key: 'formatValues',
        value: function formatValues() {
          var _this14 = this;

          for (var _len9 = arguments.length, keys = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
            keys[_key9] = arguments[_key9];
          }

          return this.fetch().then(function (langs) {
            return _this14._resolve(langs, keys, _this14._formatValue);
          });
        }
      }, {
        key: '_getEntity',
        value: function _getEntity(lang, name) {
          var cache = this.env.resCache;

          for (var i = 0, resId; resId = this.resIds[i]; i++) {
            var resource = cache.get(resId + lang.code + lang.src);
            if (resource instanceof L10nError) {
              continue;
            }
            if (name in resource) {
              return resource[name];
            }
          }
          return undefined;
        }
      }, {
        key: '_memoizeIntlObject',
        value: function _memoizeIntlObject(ctor, _ref21, opts) {
          var code = _ref21.code;

          return new ctor(code, opts);
        }
      }]);
      return Context;
    }();

    function reportMissing(keys, formatter, resolved) {
      var _this15 = this;

      var missingIds = new Set();

      keys.forEach(function (key, i) {
        if (resolved && resolved[i] !== undefined) {
          return;
        }
        var id = Array.isArray(key) ? key[0] : key;
        missingIds.add(id);
        resolved[i] = formatter === _this15._formatValue ? id : { value: id, attrs: null };
      });

      this.emit('notfounderror', new L10nError('"' + Array.from(missingIds).join(', ') + '"' + ' not found in any language', missingIds));

      return resolved;
    }

    var Node = function Node() {
      babelHelpers.classCallCheck(this, Node);
    };

    var Resource = function (_Node) {
      babelHelpers.inherits(Resource, _Node);

      function Resource() {
        babelHelpers.classCallCheck(this, Resource);

        var _this16 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Resource).call(this));

        _this16.type = 'Resource';
        _this16.body = [];
        return _this16;
      }

      return Resource;
    }(Node);

    var Entry = function (_Node2) {
      babelHelpers.inherits(Entry, _Node2);

      function Entry() {
        babelHelpers.classCallCheck(this, Entry);

        var _this17 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Entry).call(this));

        _this17.type = 'Entry';
        return _this17;
      }

      return Entry;
    }(Node);

    var Identifier = function (_Node3) {
      babelHelpers.inherits(Identifier, _Node3);

      function Identifier(name) {
        var namespace = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        babelHelpers.classCallCheck(this, Identifier);

        var _this18 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Identifier).call(this));

        _this18.type = 'Identifier';
        _this18.name = name;
        _this18.namespace = namespace;
        return _this18;
      }

      return Identifier;
    }(Node);

    var Section = function (_Node4) {
      babelHelpers.inherits(Section, _Node4);

      function Section(name) {
        var comment = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        babelHelpers.classCallCheck(this, Section);

        var _this19 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Section).call(this));

        _this19.type = 'Section';
        _this19.name = name;
        _this19.comment = comment;
        return _this19;
      }

      return Section;
    }(Node);

    var Pattern$1 = function (_Node5) {
      babelHelpers.inherits(Pattern$1, _Node5);

      function Pattern$1(source, elements) {
        babelHelpers.classCallCheck(this, Pattern$1);

        var _this20 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Pattern$1).call(this));

        _this20.type = 'Pattern';
        _this20.source = source;
        _this20.elements = elements;
        return _this20;
      }

      return Pattern$1;
    }(Node);

    var Member = function (_Node6) {
      babelHelpers.inherits(Member, _Node6);

      function Member(key, value) {
        var def = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
        babelHelpers.classCallCheck(this, Member);

        var _this21 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Member).call(this));

        _this21.type = 'Member';
        _this21.key = key;
        _this21.value = value;
        _this21.default = def;
        return _this21;
      }

      return Member;
    }(Node);

    var Entity$1 = function (_Entry) {
      babelHelpers.inherits(Entity$1, _Entry);

      function Entity$1(id) {
        var value = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        var traits = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
        var comment = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
        babelHelpers.classCallCheck(this, Entity$1);

        var _this22 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Entity$1).call(this));

        _this22.type = 'Entity';
        _this22.id = id;
        _this22.value = value;
        _this22.traits = traits;
        _this22.comment = comment;
        return _this22;
      }

      return Entity$1;
    }(Entry);

    var Placeable = function (_Node7) {
      babelHelpers.inherits(Placeable, _Node7);

      function Placeable(expressions) {
        babelHelpers.classCallCheck(this, Placeable);

        var _this23 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Placeable).call(this));

        _this23.type = 'Placeable';
        _this23.expressions = expressions;
        return _this23;
      }

      return Placeable;
    }(Node);

    var SelectExpression$1 = function (_Node8) {
      babelHelpers.inherits(SelectExpression$1, _Node8);

      function SelectExpression$1(expression) {
        var variants = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        babelHelpers.classCallCheck(this, SelectExpression$1);

        var _this24 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(SelectExpression$1).call(this));

        _this24.type = 'SelectExpression';
        _this24.expression = expression;
        _this24.variants = variants;
        return _this24;
      }

      return SelectExpression$1;
    }(Node);

    var MemberExpression$1 = function (_Node9) {
      babelHelpers.inherits(MemberExpression$1, _Node9);

      function MemberExpression$1(obj, keyword) {
        babelHelpers.classCallCheck(this, MemberExpression$1);

        var _this25 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MemberExpression$1).call(this));

        _this25.type = 'MemberExpression';
        _this25.object = obj;
        _this25.keyword = keyword;
        return _this25;
      }

      return MemberExpression$1;
    }(Node);

    var CallExpression$1 = function (_Node10) {
      babelHelpers.inherits(CallExpression$1, _Node10);

      function CallExpression$1(callee, args) {
        babelHelpers.classCallCheck(this, CallExpression$1);

        var _this26 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(CallExpression$1).call(this));

        _this26.type = 'CallExpression';
        _this26.callee = callee;
        _this26.args = args;
        return _this26;
      }

      return CallExpression$1;
    }(Node);

    var ExternalArgument$1 = function (_Node11) {
      babelHelpers.inherits(ExternalArgument$1, _Node11);

      function ExternalArgument$1(name) {
        babelHelpers.classCallCheck(this, ExternalArgument$1);

        var _this27 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ExternalArgument$1).call(this));

        _this27.type = 'ExternalArgument';
        _this27.name = name;
        return _this27;
      }

      return ExternalArgument$1;
    }(Node);

    var KeyValueArg$1 = function (_Node12) {
      babelHelpers.inherits(KeyValueArg$1, _Node12);

      function KeyValueArg$1(name, value) {
        babelHelpers.classCallCheck(this, KeyValueArg$1);

        var _this28 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(KeyValueArg$1).call(this));

        _this28.type = 'KeyValueArg';
        _this28.name = name;
        _this28.value = value;
        return _this28;
      }

      return KeyValueArg$1;
    }(Node);

    var EntityReference$1 = function (_Identifier) {
      babelHelpers.inherits(EntityReference$1, _Identifier);

      function EntityReference$1(name, namespace) {
        babelHelpers.classCallCheck(this, EntityReference$1);

        var _this29 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(EntityReference$1).call(this));

        _this29.type = 'EntityReference';
        _this29.name = name;
        _this29.namespace = namespace;
        return _this29;
      }

      return EntityReference$1;
    }(Identifier);

    var BuiltinReference$1 = function (_Identifier2) {
      babelHelpers.inherits(BuiltinReference$1, _Identifier2);

      function BuiltinReference$1(name, namespace) {
        babelHelpers.classCallCheck(this, BuiltinReference$1);

        var _this30 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(BuiltinReference$1).call(this));

        _this30.type = 'BuiltinReference';
        _this30.name = name;
        _this30.namespace = namespace;
        return _this30;
      }

      return BuiltinReference$1;
    }(Identifier);

    var Keyword = function (_Identifier3) {
      babelHelpers.inherits(Keyword, _Identifier3);

      function Keyword(name) {
        var namespace = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        babelHelpers.classCallCheck(this, Keyword);

        var _this31 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Keyword).call(this));

        _this31.type = 'Keyword';
        _this31.name = name;
        _this31.namespace = namespace;
        return _this31;
      }

      return Keyword;
    }(Identifier);

    var Number = function (_Node13) {
      babelHelpers.inherits(Number, _Node13);

      function Number(value) {
        babelHelpers.classCallCheck(this, Number);

        var _this32 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Number).call(this));

        _this32.type = 'Number';
        _this32.value = value;
        return _this32;
      }

      return Number;
    }(Node);

    var TextElement = function (_Node14) {
      babelHelpers.inherits(TextElement, _Node14);

      function TextElement(value) {
        babelHelpers.classCallCheck(this, TextElement);

        var _this33 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(TextElement).call(this));

        _this33.type = 'TextElement';
        _this33.value = value;
        return _this33;
      }

      return TextElement;
    }(Node);

    var Comment = function (_Node15) {
      babelHelpers.inherits(Comment, _Node15);

      function Comment(content) {
        babelHelpers.classCallCheck(this, Comment);

        var _this34 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Comment).call(this));

        _this34.type = 'Comment';
        _this34.content = content;
        return _this34;
      }

      return Comment;
    }(Node);

    var JunkEntry = function (_Entry2) {
      babelHelpers.inherits(JunkEntry, _Entry2);

      function JunkEntry(content) {
        babelHelpers.classCallCheck(this, JunkEntry);

        var _this35 = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(JunkEntry).call(this));

        _this35.type = 'JunkEntry';
        _this35.content = content;
        return _this35;
      }

      return JunkEntry;
    }(Entry);

    var AST = {
      Node: Node,
      Pattern: Pattern$1,
      Member: Member,
      Identifier: Identifier,
      Entity: Entity$1,
      Section: Section,
      Resource: Resource,
      Placeable: Placeable,
      SelectExpression: SelectExpression$1,
      MemberExpression: MemberExpression$1,
      CallExpression: CallExpression$1,
      ExternalArgument: ExternalArgument$1,
      KeyValueArg: KeyValueArg$1,
      Number: Number,
      EntityReference: EntityReference$1,
      BuiltinReference: BuiltinReference$1,
      Keyword: Keyword,
      TextElement: TextElement,
      Comment: Comment,
      JunkEntry: JunkEntry
    };

    var ParseContext = function () {
      function ParseContext(string) {
        babelHelpers.classCallCheck(this, ParseContext);

        this._source = string;
        this._index = 0;
        this._length = string.length;

        this._lastGoodEntryEnd = 0;
        this._section = null;
      }

      babelHelpers.createClass(ParseContext, [{
        key: 'getResource',
        value: function getResource() {
          var resource = new AST.Resource();
          resource._errors = [];

          this.getWS();
          while (this._index < this._length) {
            try {
              resource.body.push(this.getEntry());
              this._lastGoodEntryEnd = this._index;
            } catch (e) {
              if (e instanceof L10nError) {
                resource._errors.push(e);
                resource.body.push(this.getJunkEntry());
              } else {
                throw e;
              }
            }
            this.getWS();
          }

          return resource;
        }
      }, {
        key: 'getEntry',
        value: function getEntry() {
          if (this._index !== 0 && this._source[this._index - 1] !== '\n') {
            throw this.error('Expected new line and a new entry');
          }

          var comment = void 0;

          if (this._source[this._index] === '#') {
            comment = this.getComment();
          }

          this.getLineWS();

          if (this._source[this._index] === '[') {
            return this.getSection(comment);
          }

          if (this._index < this._length && this._source[this._index] !== '\n') {
            return this.getEntity(comment);
          }
          return comment;
        }
      }, {
        key: 'getSection',
        value: function getSection() {
          var comment = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

          this._index += 1;
          if (this._source[this._index] !== '[') {
            throw this.error('Expected "[[" to open a section');
          }

          this._index += 1;

          this.getLineWS();

          var id = this.getIdentifier();

          this.getLineWS();

          if (this._source[this._index] !== ']' || this._source[this._index + 1] !== ']') {
            throw this.error('Expected "]]" to close a section');
          }

          this._index += 2;

          this._section = id;

          return new AST.Section(id, comment);
        }
      }, {
        key: 'getEntity',
        value: function getEntity() {
          var comment = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

          var id = this.getIdentifier('/');

          var members = [];
          var value = null;

          this.getLineWS();

          var ch = this._source[this._index];

          if (ch !== '=') {
            throw this.error('Expected "=" after Entity ID');
          }
          ch = this._source[++this._index];

          this.getLineWS();

          value = this.getPattern();

          ch = this._source[this._index];

          if (ch === '\n') {
            this._index++;
            this.getLineWS();
            ch = this._source[this._index];
          }

          if (ch === '[' && this._source[this._index + 1] !== '[' || ch === '*') {
            members = this.getMembers();
          } else if (value === null) {
            throw this.error('Expected a value (like: " = value") or a trait (like: "[key] value")');
          }

          return new AST.Entity(id, value, members, comment);
        }
      }, {
        key: 'getWS',
        value: function getWS() {
          var cc = this._source.charCodeAt(this._index);

          while (cc === 32 || cc === 10 || cc === 9 || cc === 13) {
            cc = this._source.charCodeAt(++this._index);
          }
        }
      }, {
        key: 'getLineWS',
        value: function getLineWS() {
          var cc = this._source.charCodeAt(this._index);

          while (cc === 32 || cc === 9) {
            cc = this._source.charCodeAt(++this._index);
          }
        }
      }, {
        key: 'getIdentifier',
        value: function getIdentifier() {
          var nsSep = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

          var namespace = null;
          var id = '';

          if (nsSep) {
            namespace = this.getIdentifier().name;
            if (this._source[this._index] === nsSep) {
              this._index++;
            } else if (namespace) {
              id = namespace;
              namespace = null;
            }
          }

          var start = this._index;
          var cc = this._source.charCodeAt(this._index);

          if (cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc === 95) {
            cc = this._source.charCodeAt(++this._index);
          } else if (id.length === 0) {
            throw this.error('Expected an identifier (starting with [a-zA-Z_])');
          }

          while (cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc >= 48 && cc <= 57 || cc === 95 || cc === 45) {
            cc = this._source.charCodeAt(++this._index);
          }

          id += this._source.slice(start, this._index);

          return new AST.Identifier(id, namespace);
        }
      }, {
        key: 'getIdentifierWithSpace',
        value: function getIdentifierWithSpace() {
          var nsSep = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

          var namespace = null;
          var id = '';

          if (nsSep) {
            namespace = this.getIdentifier().name;
            if (this._source[this._index] === nsSep) {
              this._index++;
            } else if (namespace) {
              id = namespace;
              namespace = null;
            }
          }

          var start = this._index;
          var cc = this._source.charCodeAt(this._index);

          if (cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc === 95 || cc === 32) {
            cc = this._source.charCodeAt(++this._index);
          } else if (id.length === 0) {
            throw this.error('Expected an identifier (starting with [a-zA-Z_])');
          }

          while (cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc >= 48 && cc <= 57 || cc === 95 || cc === 45 || cc === 32) {
            cc = this._source.charCodeAt(++this._index);
          }

          id += this._source.slice(start, this._index);

          return new AST.Identifier(id, namespace);
        }
      }, {
        key: 'getPattern',
        value: function getPattern() {
          var buffer = '';
          var source = '';
          var content = [];
          var quoteDelimited = null;
          var firstLine = true;

          var ch = this._source[this._index];

          if (ch === '\\' && (this._source[this._index + 1] === '"' || this._source[this._index + 1] === '{' || this._source[this._index + 1] === '\\')) {
            buffer += this._source[this._index + 1];
            this._index += 2;
            ch = this._source[this._index];
          } else if (ch === '"') {
            quoteDelimited = true;
            this._index++;
            ch = this._source[this._index];
          }

          while (this._index < this._length) {
            if (ch === '\n') {
              if (quoteDelimited) {
                throw this.error('Unclosed string');
              }
              this._index++;
              this.getLineWS();
              if (this._source[this._index] !== '|') {
                break;
              }
              if (firstLine && buffer.length) {
                throw this.error('Multiline string should have the ID line empty');
              }
              firstLine = false;
              this._index++;
              if (this._source[this._index] === ' ') {
                this._index++;
              }
              if (buffer.length) {
                buffer += '\n';
              }
              ch = this._source[this._index];
              continue;
            } else if (ch === '\\') {
              var ch2 = this._source[this._index + 1];
              if (quoteDelimited && ch2 === '"' || ch2 === '{') {
                ch = ch2;
                this._index++;
              }
            } else if (quoteDelimited && ch === '"') {
              this._index++;
              quoteDelimited = false;
              break;
            } else if (ch === '{') {
              if (buffer.length) {
                content.push(new AST.TextElement(buffer));
              }
              source += buffer;
              buffer = '';
              var start = this._index;
              content.push(this.getPlaceable());
              source += this._source.substring(start, this._index);
              ch = this._source[this._index];
              continue;
            }

            if (ch) {
              buffer += ch;
            }
            this._index++;
            ch = this._source[this._index];
          }

          if (quoteDelimited) {
            throw this.error('Unclosed string');
          }

          if (buffer.length) {
            source += buffer;
            content.push(new AST.TextElement(buffer));
          }

          if (content.length === 0) {
            if (quoteDelimited !== null) {
              content.push(new AST.TextElement(source));
            } else {
              return null;
            }
          }

          return new AST.Pattern(source, content);
        }
      }, {
        key: 'getPlaceable',
        value: function getPlaceable() {
          this._index++;

          var expressions = [];

          this.getLineWS();

          while (this._index < this._length) {
            var start = this._index;
            try {
              expressions.push(this.getPlaceableExpression());
            } catch (e) {
              throw this.error(e.description, start);
            }
            this.getWS();
            if (this._source[this._index] === '}') {
              this._index++;
              break;
            } else if (this._source[this._index] === ',') {
              this._index++;
              this.getWS();
            } else {
              throw this.error('Expected "}" or ","');
            }
          }

          return new AST.Placeable(expressions);
        }
      }, {
        key: 'getPlaceableExpression',
        value: function getPlaceableExpression() {
          var selector = this.getCallExpression();
          var members = null;

          this.getWS();

          if (this._source[this._index] !== '}' && this._source[this._index] !== ',') {
            if (this._source[this._index] !== '-' || this._source[this._index + 1] !== '>') {
              throw this.error('Expected "}", "," or "->"');
            }
            this._index += 2;

            this.getLineWS();

            if (this._source[this._index] !== '\n') {
              throw this.error('Members should be listed in a new line');
            }

            this.getWS();

            members = this.getMembers();

            if (members.length === 0) {
              throw this.error('Expected members for the select expression');
            }
          }

          if (members === null) {
            return selector;
          }
          return new AST.SelectExpression(selector, members);
        }
      }, {
        key: 'getCallExpression',
        value: function getCallExpression() {
          var exp = this.getMemberExpression();

          if (this._source[this._index] !== '(') {
            return exp;
          }

          this._index++;

          var args = this.getCallArgs();

          this._index++;

          if (exp instanceof AST.EntityReference) {
            exp = new AST.BuiltinReference(exp.name, exp.namespace);
          }

          return new AST.CallExpression(exp, args);
        }
      }, {
        key: 'getCallArgs',
        value: function getCallArgs() {
          var args = [];

          if (this._source[this._index] === ')') {
            return args;
          }

          while (this._index < this._length) {
            this.getLineWS();

            var exp = this.getCallExpression();

            if (!(exp instanceof AST.EntityReference) || exp.namespace !== null) {
              args.push(exp);
            } else {
              this.getLineWS();

              if (this._source[this._index] === ':') {
                this._index++;
                this.getLineWS();

                var val = this.getCallExpression();

                if (val instanceof AST.EntityReference || val instanceof AST.MemberExpression) {
                  this._index = this._source.lastIndexOf('=', this._index) + 1;
                  throw this.error('Expected string in quotes');
                }

                args.push(new AST.KeyValueArg(exp.name, val));
              } else {
                args.push(exp);
              }
            }

            this.getLineWS();

            if (this._source[this._index] === ')') {
              break;
            } else if (this._source[this._index] === ',') {
              this._index++;
            } else {
              throw this.error('Expected "," or ")"');
            }
          }

          return args;
        }
      }, {
        key: 'getNumber',
        value: function getNumber() {
          var num = '';
          var cc = this._source.charCodeAt(this._index);

          if (cc === 45) {
            num += '-';
            cc = this._source.charCodeAt(++this._index);
          }

          if (cc < 48 || cc > 57) {
            throw this.error('Unknown literal "' + num + '"');
          }

          while (cc >= 48 && cc <= 57) {
            num += this._source[this._index++];
            cc = this._source.charCodeAt(this._index);
          }

          if (cc === 46) {
            num += this._source[this._index++];
            cc = this._source.charCodeAt(this._index);

            if (cc < 48 || cc > 57) {
              throw this.error('Unknown literal "' + num + '"');
            }

            while (cc >= 48 && cc <= 57) {
              num += this._source[this._index++];
              cc = this._source.charCodeAt(this._index);
            }
          }

          return new AST.Number(num);
        }
      }, {
        key: 'getMemberExpression',
        value: function getMemberExpression() {
          var exp = this.getLiteral();

          if (this._source[this._index] !== '[') {
            return exp;
          }
          var keyword = this.getKeyword();
          return new AST.MemberExpression(exp, keyword);
        }
      }, {
        key: 'getMembers',
        value: function getMembers() {
          var members = [];

          while (this._index < this._length) {
            if ((this._source[this._index] !== '[' || this._source[this._index + 1] === '[') && this._source[this._index] !== '*') {
              break;
            }
            var def = false;
            if (this._source[this._index] === '*') {
              this._index++;
              def = true;
            }

            if (this._source[this._index] !== '[') {
              throw this.error('Expected "["');
            }

            var key = this.getKeyword();

            this.getLineWS();

            var value = this.getPattern();

            var member = new AST.Member(key, value, def);

            members.push(member);

            this.getWS();
          }

          return members;
        }
      }, {
        key: 'getKeyword',
        value: function getKeyword() {
          this._index++;

          var cc = this._source.charCodeAt(this._index);
          var literal = void 0;

          if (cc >= 48 && cc <= 57 || cc === 45) {
            literal = this.getNumber();
          } else {
            literal = this.getIdentifierWithSpace('/');
          }

          if (this._source[this._index] !== ']') {
            throw this.error('Expected "]"');
          }

          this._index++;
          return literal;
        }
      }, {
        key: 'getLiteral',
        value: function getLiteral() {
          var cc = this._source.charCodeAt(this._index);
          if (cc >= 48 && cc <= 57 || cc === 45) {
            return this.getNumber();
          } else if (cc === 34) {
            return this.getPattern();
          } else if (cc === 36) {
            this._index++;
            var _id = this.getIdentifier();
            return new AST.ExternalArgument(_id.name);
          }

          var id = this.getIdentifier('/');
          return new AST.EntityReference(id.name, id.namespace);
        }
      }, {
        key: 'getComment',
        value: function getComment() {
          this._index++;
          if (this._source[this._index] === ' ') {
            this._index++;
          }

          var content = '';

          var eol = this._source.indexOf('\n', this._index);

          content += this._source.substring(this._index, eol);

          while (eol !== -1 && this._source[eol + 1] === '#') {
            this._index = eol + 2;

            if (this._source[this._index] === ' ') {
              this._index++;
            }

            eol = this._source.indexOf('\n', this._index);

            if (eol === -1) {
              break;
            }

            content += '\n' + this._source.substring(this._index, eol);
          }

          if (eol === -1) {
            this._index = this._length;
          } else {
            this._index = eol + 1;
          }

          return new AST.Comment(content);
        }
      }, {
        key: 'error',
        value: function error(message) {
          var start = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

          var colors = require('colors/safe');

          var pos = this._index;

          if (start === null) {
            start = pos;
          }
          start = this._findEntityStart(start);

          var context = this._source.slice(start, pos + 10);

          var msg = '\n\n  ' + message + '\nat pos ' + pos + ':\n------\n…' + context + '\n------';
          var err = new L10nError(msg);

          var row = this._source.slice(0, pos).split('\n').length;
          var col = pos - this._source.lastIndexOf('\n', pos - 1);
          err._pos = { start: pos, end: undefined, col: col, row: row };
          err.offset = pos - start;
          err.description = message;
          err.context = context;
          return err;
        }
      }, {
        key: 'getJunkEntry',
        value: function getJunkEntry() {
          var pos = this._index;

          var nextEntity = this._findNextEntryStart(pos);

          if (nextEntity === -1) {
            nextEntity = this._length;
          }

          this._index = nextEntity;

          var entityStart = this._findEntityStart(pos);

          if (entityStart < this._lastGoodEntryEnd) {
            entityStart = this._lastGoodEntryEnd;
          }

          var junk = new AST.JunkEntry(this._source.slice(entityStart, nextEntity));
          return junk;
        }
      }, {
        key: '_findEntityStart',
        value: function _findEntityStart(pos) {
          var start = pos;

          while (true) {
            start = this._source.lastIndexOf('\n', start - 2);
            if (start === -1 || start === 0) {
              start = 0;
              break;
            }
            var cc = this._source.charCodeAt(start + 1);

            if (cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc === 95) {
              start++;
              break;
            }
          }

          return start;
        }
      }, {
        key: '_findNextEntryStart',
        value: function _findNextEntryStart(pos) {
          var start = pos;

          while (true) {
            if (start === 0 || this._source[start - 1] === '\n') {
              var cc = this._source.charCodeAt(start);

              if (cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc === 95 || cc === 35 || cc === 91) {
                break;
              }
            }

            start = this._source.indexOf('\n', start);

            if (start === -1) {
              break;
            }
            start++;
          }

          return start;
        }
      }]);
      return ParseContext;
    }();

    var ASTParser = {
      parseResource: function parseResource(string) {
        var parseContext = new ParseContext(string);
        return parseContext.getResource();
      }
    };

    function toEntries(_ref22, entry) {
      var _ref23 = babelHelpers.slicedToArray(_ref22, 2);

      var entries = _ref23[0];
      var curSection = _ref23[1];

      if (entry.type === 'Section') {
        return [entries, entry.name.name];
      }

      if (curSection && !entry.id.namespace) {
        entry.id.namespace = curSection;
      }

      return [Object.assign(entries, babelHelpers.defineProperty({}, stringifyIdentifier(entry.id), transformEntity(entry))), curSection];
    }

    function transformEntity(entity) {
      if (entity.traits.length === 0) {
        return transformPattern(entity.value);
      }

      var ret = {
        traits: entity.traits.map(transformMember)
      };

      if (entity.value !== null) {
        ret.val = transformPattern(entity.value);
      }

      return ret;
    }

    function transformExpression(exp) {
      if (exp instanceof AST.EntityReference) {
        return {
          type: 'ref',
          name: stringifyIdentifier(exp)
        };
      }
      if (exp instanceof AST.BuiltinReference) {
        return {
          type: 'blt',
          name: stringifyIdentifier(exp)
        };
      }
      if (exp instanceof AST.ExternalArgument) {
        return {
          type: 'ext',
          name: exp.name
        };
      }
      if (exp instanceof AST.Pattern) {
        return transformPattern(exp);
      }
      if (exp instanceof AST.Identifier) {
        return transformIdentifier(exp);
      }
      if (exp instanceof AST.Number) {
        return {
          type: 'num',
          val: exp.value
        };
      }
      if (exp instanceof AST.KeyValueArg) {
        return {
          type: 'kv',
          name: exp.name,
          val: transformExpression(exp.value)
        };
      }

      if (exp instanceof AST.SelectExpression) {
        return {
          type: 'sel',
          exp: transformExpression(exp.expression),
          vars: exp.variants.map(transformMember)
        };
      }
      if (exp instanceof AST.MemberExpression) {
        return {
          type: 'mem',
          obj: transformExpression(exp.object),
          key: transformExpression(exp.keyword)
        };
      }
      if (exp instanceof AST.CallExpression) {
        return {
          type: 'call',
          name: transformExpression(exp.callee),
          args: exp.args.map(transformExpression)
        };
      }
      return exp;
    }

    function transformPattern(pattern) {
      if (pattern === null) {
        return null;
      }

      if (pattern.elements.length === 1 && pattern.elements[0] instanceof AST.TextElement) {
        return pattern.source;
      }

      return pattern.elements.map(function (chunk) {
        if (chunk instanceof AST.TextElement) {
          return chunk.value;
        }
        if (chunk instanceof AST.Placeable) {
          return chunk.expressions.map(transformExpression);
        }
        return chunk;
      });
    }

    function transformMember(member) {
      var type = member.key.type;
      var ret = {
        key: transformExpression(member.key),
        val: transformPattern(member.value)
      };

      if (member.default) {
        ret.def = true;
      }

      return ret;
    }

    function transformIdentifier(id) {
      var ret = {
        type: 'id',
        name: id.name
      };

      if (id.namespace) {
        ret.ns = id.namespace;
      }

      return ret;
    }

    function stringifyIdentifier(id) {
      if (id.namespace) {
        return id.namespace + '/' + id.name;
      }
      return id.name;
    }

    function createEntriesFromAST(_ref24) {
      var body = _ref24.body;
      var _errors = _ref24._errors;

      var _body$filter$reduce = body.filter(function (entry) {
        return entry.type === 'Entity' || entry.type === 'Section';
      }).reduce(toEntries, [{}, null]);

      var _body$filter$reduce2 = babelHelpers.slicedToArray(_body$filter$reduce, 1);

      var entries = _body$filter$reduce2[0];

      return { entries: entries, _errors: _errors };
    }

    var FTLEntriesParser = {
      parseResource: function parseResource(string) {
        var ast = ASTParser.parseResource(string);
        return createEntriesFromAST(ast);
      }
    };

    function walkEntry(entry, fn) {
      if (typeof entry === 'string') {
        return fn(entry);
      }

      var newEntry = Object.create(null);

      if (entry.value) {
        newEntry.value = walkValue(entry.value, fn);
      }

      if (entry.index) {
        newEntry.index = entry.index;
      }

      if (entry.attrs) {
        newEntry.attrs = Object.create(null);
        for (var key in entry.attrs) {
          newEntry.attrs[key] = walkEntry(entry.attrs[key], fn);
        }
      }

      return newEntry;
    }

    function walkValue(value, fn) {
      if (typeof value === 'string') {
        return fn(value);
      }

      if (value.type) {
        return value;
      }

      var newValue = Array.isArray(value) ? [] : Object.create(null);
      var keys = Object.keys(value);

      for (var i = 0, key; key = keys[i]; i++) {
        newValue[key] = walkValue(value[key], fn);
      }

      return newValue;
    }

    function createGetter(id, name) {
      var _pseudo = null;

      return function getPseudo() {
        if (_pseudo) {
          return _pseudo;
        }

        var reAlphas = /[a-zA-Z]/g;
        var reVowels = /[aeiouAEIOU]/g;
        var reWords = /[^\W0-9_]+/g;

        var reExcluded = /(%[EO]?\w|\{\s*.+?\s*\}|&[#\w]+;|<\s*.+?\s*>)/;

        var charMaps = {
          'fr-x-psaccent': 'ȦƁƇḒḖƑƓĦĪĴĶĿḾȠǾƤɊŘŞŦŬṼẆẊẎẐ[\\]^_`ȧƀƈḓḗƒɠħīĵķŀḿƞǿƥɋřşŧŭṽẇẋẏẑ',
          'ar-x-psbidi': '∀ԐↃpƎɟפHIſӼ˥WNOԀÒᴚS⊥∩ɅＭXʎZ[\\]ᵥ_,ɐqɔpǝɟƃɥıɾʞʅɯuodbɹsʇnʌʍxʎz'
        };

        var mods = {
          'fr-x-psaccent': function frXPsaccent(val) {
            return val.replace(reVowels, function (match) {
              return match + match.toLowerCase();
            });
          },

          'ar-x-psbidi': function arXPsbidi(val) {
            return val.replace(reWords, function (match) {
              return '‮' + match + '‬';
            });
          }
        };

        var ASCII_LETTER_A = 65;
        var replaceChars = function replaceChars(map, val) {
          return val.replace(reAlphas, function (match) {
            return map.charAt(match.charCodeAt(0) - ASCII_LETTER_A);
          });
        };

        var transform = function transform(val) {
          return replaceChars(charMaps[id], mods[id](val));
        };

        var apply = function apply(fn, val) {
          if (!val) {
            return val;
          }

          var parts = val.split(reExcluded);
          var modified = parts.map(function (part) {
            if (reExcluded.test(part)) {
              return part;
            }
            return fn(part);
          });
          return modified.join('');
        };

        return _pseudo = {
          name: transform(name),
          process: function process(str) {
            return apply(transform, str);
          }
        };
      };
    }

    var pseudo = Object.defineProperties(Object.create(null), {
      'fr-x-psaccent': {
        enumerable: true,
        get: createGetter('fr-x-psaccent', 'Runtime Accented')
      },
      'ar-x-psbidi': {
        enumerable: true,
        get: createGetter('ar-x-psbidi', 'Runtime Bidi')
      }
    });

    var Env = function () {
      function Env(fetchResource) {
        babelHelpers.classCallCheck(this, Env);

        this.fetchResource = fetchResource;

        this.resCache = new Map();
        this.resRefs = new Map();
        this.builtins = null;
        this.parsers = {
          ftl: FTLEntriesParser
        };

        var listeners = {};
        this.emit = emit.bind(this, listeners);
        this.addEventListener = addEventListener.bind(this, listeners);
        this.removeEventListener = removeEventListener.bind(this, listeners);
      }

      babelHelpers.createClass(Env, [{
        key: 'createContext',
        value: function createContext(langs, resIds) {
          var _this36 = this;

          var ctx = new Context(this, langs, resIds);
          resIds.forEach(function (resId) {
            var usedBy = _this36.resRefs.get(resId) || 0;
            _this36.resRefs.set(resId, usedBy + 1);
          });

          return ctx;
        }
      }, {
        key: 'destroyContext',
        value: function destroyContext(ctx) {
          var _this37 = this;

          ctx.resIds.forEach(function (resId) {
            var usedBy = _this37.resRefs.get(resId) || 0;

            if (usedBy > 1) {
              return _this37.resRefs.set(resId, usedBy - 1);
            }

            _this37.resRefs.delete(resId);
            _this37.resCache.forEach(function (val, key) {
              return key.startsWith(resId) ? _this37.resCache.delete(key) : null;
            });
          });
        }
      }, {
        key: '_parse',
        value: function _parse(syntax, lang, data) {
          var _this38 = this;

          var parser = this.parsers[syntax];
          if (!parser) {
            return data;
          }

          var emitAndAmend = function emitAndAmend(type, err) {
            return _this38.emit(type, amendError(lang, err));
          };
          return parser.parse(emitAndAmend, data);
        }
      }, {
        key: '_create',
        value: function _create(lang, entries) {
          if (lang.src !== 'pseudo') {
            return entries;
          }

          var pseudoentries = Object.create(null);
          for (var key in entries) {
            pseudoentries[key] = walkEntry(entries[key], pseudo[lang.code].process);
          }
          return pseudoentries;
        }
      }, {
        key: '_getResource',
        value: function _getResource(lang, res) {
          var _this39 = this;

          var cache = this.resCache;
          var id = res + lang.code + lang.src;

          if (cache.has(id)) {
            return cache.get(id);
          }

          var syntax = res.substr(res.lastIndexOf('.') + 1);

          var saveEntries = function saveEntries(data) {
            var entries = _this39._parse(syntax, lang, data);
            cache.set(id, _this39._create(lang, entries));
          };

          var recover = function recover(err) {
            err.lang = lang;
            _this39.emit('fetcherror', err);
            cache.set(id, err);
          };

          var langToFetch = lang.src === 'pseudo' ? { code: 'en-US', src: 'app', ver: lang.ver } : lang;

          var resource = this.fetchResource(res, langToFetch).then(saveEntries, recover);

          cache.set(id, resource);

          return resource;
        }
      }]);
      return Env;
    }();

    function amendError(lang, err) {
      err.lang = lang;
      return err;
    }

    function prioritizeLocales(def, availableLangs, requested) {
      var supportedLocale = void 0;

      for (var i = 0; i < requested.length; i++) {
        var locale = requested[i];
        if (availableLangs.indexOf(locale) !== -1) {
          supportedLocale = locale;
          break;
        }
      }
      if (!supportedLocale || supportedLocale === def) {
        return [def];
      }

      return [supportedLocale, def];
    }

    function negotiateLanguages(_ref25, additionalLangs, prevLangs, requestedLangs) {
      var appVersion = _ref25.appVersion;
      var defaultLang = _ref25.defaultLang;
      var availableLangs = _ref25.availableLangs;


      var allAvailableLangs = Object.keys(availableLangs).concat(Object.keys(additionalLangs)).concat(Object.keys(pseudo));
      var newLangs = prioritizeLocales(defaultLang, allAvailableLangs, requestedLangs);

      var langs = newLangs.map(function (code) {
        return {
          code: code,
          src: getLangSource(appVersion, availableLangs, additionalLangs, code),
          ver: appVersion
        };
      });

      return { langs: langs, haveChanged: !arrEqual(prevLangs, newLangs) };
    }

    function arrEqual(arr1, arr2) {
      return arr1.length === arr2.length && arr1.every(function (elem, i) {
        return elem === arr2[i];
      });
    }

    function getMatchingLangpack(appVersion, langpacks) {
      for (var i = 0, langpack; langpack = langpacks[i]; i++) {
        if (langpack.target === appVersion) {
          return langpack;
        }
      }
      return null;
    }

    function getLangSource(appVersion, availableLangs, additionalLangs, code) {
      if (additionalLangs && additionalLangs[code]) {
        var lp = getMatchingLangpack(appVersion, additionalLangs[code]);
        if (lp && (!(code in availableLangs) || parseInt(lp.revision) > availableLangs[code])) {
          return 'extra';
        }
      }

      if (code in pseudo && !(code in availableLangs)) {
        return 'pseudo';
      }

      return 'app';
    }

    var Remote = function () {
      function Remote(fetchResource, broadcast) {
        babelHelpers.classCallCheck(this, Remote);

        this.broadcast = broadcast;
        this.env = new Env(fetchResource);
        this.ctxs = new Map();
      }

      babelHelpers.createClass(Remote, [{
        key: 'registerView',
        value: function registerView(view, resources, meta, additionalLangs, requestedLangs) {
          var _negotiateLanguages = negotiateLanguages(meta, additionalLangs, [], requestedLangs);

          var langs = _negotiateLanguages.langs;

          this.ctxs.set(view, this.env.createContext(langs, resources));
          return langs;
        }
      }, {
        key: 'unregisterView',
        value: function unregisterView(view) {
          this.ctxs.delete(view);
          return true;
        }
      }, {
        key: 'formatEntities',
        value: function formatEntities(view, keys) {
          var _ctxs$get;

          return (_ctxs$get = this.ctxs.get(view)).formatEntities.apply(_ctxs$get, babelHelpers.toConsumableArray(keys));
        }
      }, {
        key: 'formatValues',
        value: function formatValues(view, keys) {
          var _ctxs$get2;

          return (_ctxs$get2 = this.ctxs.get(view)).formatValues.apply(_ctxs$get2, babelHelpers.toConsumableArray(keys));
        }
      }, {
        key: 'changeLanguages',
        value: function changeLanguages(view, meta, additionalLangs, requestedLangs) {
          var oldCtx = this.ctxs.get(view);
          var prevLangs = oldCtx.langs;
          var newLangs = negotiateLanguages(meta, additionalLangs, prevLangs, requestedLangs);
          this.ctxs.set(view, this.env.createContext(newLangs.langs, oldCtx.resIds));
          return newLangs;
        }
      }, {
        key: 'requestLanguages',
        value: function requestLanguages(requestedLangs) {
          this.broadcast('languageschangerequest', requestedLangs);
        }
      }, {
        key: 'getName',
        value: function getName(code) {
          return pseudo[code].name;
        }
      }, {
        key: 'processString',
        value: function processString(code, str) {
          return pseudo[code].process(str);
        }
      }]);
      return Remote;
    }();

    var lang = {
      code: 'en-US',
      src: 'app'
    };

    function MockContext(entries) {
      return {
        env: {},
        _getEntity: function _getEntity(lang, name) {
          return entries[name];
        },

        _memoizeIntlObject: Context.prototype._memoizeIntlObject
      };
    }

    window.L20n = {
      fetchResource: fetchResource, Client: Client, Remote: Remote, View: View, broadcast: broadcast,
      FTLASTParser: ASTParser, FTLEntriesParser: FTLEntriesParser, createEntriesFromAST: createEntriesFromAST,
      Context: Context, Env: Env, L10nError: L10nError, emit: emit, addEventListener: addEventListener, removeEventListener: removeEventListener,
      prioritizeLocales: prioritizeLocales, MockContext: MockContext, lang: lang,
      walkEntry: walkEntry, walkValue: walkValue, pseudo: pseudo, format: format
    };
  })();

}());