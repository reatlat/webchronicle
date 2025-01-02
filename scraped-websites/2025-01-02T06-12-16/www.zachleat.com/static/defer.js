class Island extends HTMLElement {
  static tagName = "is-land";
  static prefix = "is-land--";
  static attr = {
    template: "data-island",
    ready: "ready",
    defer: "defer-hydration",
  };

  static onceCache = new Map();
  static onReady = new Map();

  static fallback = {
    ":not(is-land,:defined,[defer-hydration])": (readyPromise, node, prefix) => {
      // remove from document to prevent web component init
      let cloned = document.createElement(prefix + node.localName);
      for(let attr of node.getAttributeNames()) {
        cloned.setAttribute(attr, node.getAttribute(attr));
      }
    
      // Declarative Shadow DOM (with polyfill)
      let shadowroot = node.shadowRoot;
      if(!shadowroot) {
        let tmpl = node.querySelector(":scope > template:is([shadowrootmode], [shadowroot])");
        if(tmpl) {
          let mode = tmpl.getAttribute("shadowrootmode") || tmpl.getAttribute("shadowroot") || "closed";
          shadowroot = node.attachShadow({ mode }); // default is closed
          shadowroot.appendChild(tmpl.content.cloneNode(true));
        }
      }
    
      // Cheers to https://gist.github.com/developit/45c85e9be01e8c3f1a0ec073d600d01e
      if(shadowroot) {
        cloned.attachShadow({ mode: shadowroot.mode }).append(...shadowroot.childNodes);
      }
    
      // Keep *same* child nodes to preserve state of children (e.g. details->summary)
      cloned.append(...node.childNodes);
      node.replaceWith(cloned);
    
      return readyPromise.then(() => {
        // Restore original children and shadow DOM
        if(cloned.shadowRoot) {
          node.shadowRoot.append(...cloned.shadowRoot.childNodes);
        }
        node.append(...cloned.childNodes);
        cloned.replaceWith(node);
      });
    }
  }

  constructor() {
    super();

    // Internal promises
    this.ready = new Promise(resolve => {
      this.readyResolve = resolve;
    });
  }

  // any parents of `el` that are <is-land> (with conditions)
  static getParents(el, stopAt = false) {
    let nodes = [];
    while(el) {
      if(el.matches && el.matches(Island.tagName)) {
        if(stopAt && el === stopAt) {
          break;
        }

        if(Conditions.hasConditions(el)) {
          nodes.push(el);
        }
      }
      el = el.parentNode;
    }
    return nodes;
  }

  static async ready(el, parents) {
    if(!parents) {
      parents = Island.getParents(el);
    }
    if(parents.length === 0) {
      return;
    }
    let imports = await Promise.all(parents.map(p => p.wait()));
    // return innermost module import
    if(imports.length) {
      return imports[0];
    }
  }

  forceFallback() {
    if(window.Island) {
      Object.assign(Island.fallback, window.Island.fallback);
    }

    for(let selector in Island.fallback) {
      // Reverse here as a cheap way to get the deepest nodes first
      let components = Array.from(this.querySelectorAll(selector)).reverse();

      // with thanks to https://gist.github.com/cowboy/938767
      for(let node of components) {
        if(!node.isConnected) {
          continue;
        }

        let parents = Island.getParents(node);
        // must be in a leaf island (not nested deep)
        if(parents.length === 1) {
          let p = Island.ready(node, parents);
          Island.fallback[selector](p, node, Island.prefix);
        }
      }
    }
  }

  wait() {
    return this.ready;
  }

  async connectedCallback() {
    // Only use fallback content with loading conditions
    if(Conditions.hasConditions(this)) {
      // Keep fallback content without initializing the components
      this.forceFallback();
    }

    await this.hydrate();
  }

  getTemplates() {
    return this.querySelectorAll(`template[${Island.attr.template}]`);
  }

  replaceTemplates(templates) {
    // replace <template> with the live content
    for(let node of templates) {
      // if the template is nested inside another child <is-land> inside, skip
      if(Island.getParents(node, this).length > 0) {
        continue;
      }

      let value = node.getAttribute(Island.attr.template);
      // get rid of the rest of the content on the island
      if(value === "replace") {
        let children = Array.from(this.childNodes);
        for(let child of children) {
          this.removeChild(child);
        }
        this.appendChild(node.content);
        break;
      } else {
        let html = node.innerHTML;
        if(value === "once" && html) {
          if(Island.onceCache.has(html)) {
            node.remove();
            return;
          }

          Island.onceCache.set(html, true);
        }

        node.replaceWith(node.content);
      }
    }
  }

  async hydrate() {
    let conditions = [];
    if(this.parentNode) {
      // wait for all parents before hydrating
      conditions.push(Island.ready(this.parentNode));
    }

    let attrs = Conditions.getConditions(this);
    for(let condition in attrs) {
      if(Conditions.map[condition]) {
        conditions.push(Conditions.map[condition](attrs[condition], this));
      }
    }

    // Loading conditions must finish before dependencies are loaded
    await Promise.all(conditions);

    this.replaceTemplates(this.getTemplates());

    for(let fn of Island.onReady.values()) {
      await fn.call(this, Island);
    }

    this.readyResolve();

    this.setAttribute(Island.attr.ready, "");

    // Remove [defer-hydration]
    this.querySelectorAll(`[${Island.attr.defer}]`).forEach(node => node.removeAttribute(Island.attr.defer));
  }
}

class Conditions {
  static map = {
    visible: Conditions.visible,
    idle: Conditions.idle,
    interaction: Conditions.interaction,
    media: Conditions.media,
    "save-data": Conditions.saveData,
  };

  static hasConditions(node) {
    return Object.keys(Conditions.getConditions(node)).length > 0;
  }

  static getConditions(node) {
    let map = {};
    for(let key of Object.keys(Conditions.map)) {
      if(node.hasAttribute(`on:${key}`)) {
        map[key] = node.getAttribute(`on:${key}`);
      }
    }

    return map;
  }

  static visible(noop, el) {
    if(!('IntersectionObserver' in window)) {
      // runs immediately
      return;
    }

    return new Promise(resolve => {
      let observer = new IntersectionObserver(entries => {
        let [entry] = entries;
        if(entry.isIntersecting) {
          observer.unobserve(entry.target);
          resolve();
        }
      });

      observer.observe(el);
    });
  }

  // Warning: on:idle is not very useful with other conditions as it may resolve long before.
  static idle() {
    let onload = new Promise(resolve => {
      if(document.readyState !== "complete") {
        window.addEventListener("load", () => resolve(), { once: true });
      } else {
        resolve();
      }
    });

    if(!("requestIdleCallback" in window)) {
      // run immediately
      return onload;
    }

    // both idle and onload
    return Promise.all([
      new Promise(resolve => {
        requestIdleCallback(() => {
          resolve();
        });
      }),
      onload,
    ]);
  }

  static interaction(eventOverrides, el) {
    let events = ["click", "touchstart"];
    // event overrides e.g. on:interaction="mouseenter"
    if(eventOverrides) {
      events = (eventOverrides || "").split(",").map(entry => entry.trim());
    }

    return new Promise(resolve => {
      function resolveFn(e) {
        resolve();

        // cleanup the other event handlers
        for(let name of events) {
          el.removeEventListener(name, resolveFn);
        }
      }

      for(let name of events) {
        el.addEventListener(name, resolveFn, { once: true });
      }
    });
  }

  static media(query) {
    let mm = {
      matches: true
    };

    if(query && ("matchMedia" in window)) {
      mm = window.matchMedia(query);
    }

    if(mm.matches) {
      return;
    }

    return new Promise(resolve => {
      mm.addListener(e => {
        if(e.matches) {
          resolve();
        }
      });
    });
  }

  static saveData(expects) {
    // return early if API does not exist
    if(!("connection" in navigator) || navigator.connection.saveData === (expects !== "false")) {
      return;
    }

    // dangly promise
    return new Promise(() => {});
  }
}

// Should this auto define? Folks can redefine later using { component } export
if("customElements" in window) {
  window.customElements.define(Island.tagName, Island);
  window.Island = Island;
}

export {
  Island,
  Island as component, // Backwards compat only: recommend `Island` export
};

// TODO remove in 4.0
export const ready = Island.ready; // Backwards compat only: recommend `Island` export

class FilterContainer extends HTMLElement {
  static attrs = {
    oninit: "oninit",
    valueDelimiter: "delimiter",
    leaveUrlAlone: "leave-url-alone",
    mode: "filter-mode",
    bind: "data-filter-key",
    results: "data-filter-results",
    resultsExclude: "data-filter-results-exclude",
  };

  static register(tagName) {
    if("customElements" in window) {
      customElements.define(tagName || "filter-container", FilterContainer);
    }
  }

  getCss(keys) {
    return `${keys.map(key => `.filter-${key}--hide`).join(", ")} {
  display: none;
}`;
  }

  connectedCallback() {
    this._lookedFor = {};

    this.bindEvents(this.formElements);

    // even if this isn’t supported, folks can still add the CSS manually.
    if(("replaceSync" in CSSStyleSheet.prototype) && !this._cssAdded) {
      let sheet = new CSSStyleSheet();
      let css = this.getCss(Object.keys(this.formElements));
      sheet.replaceSync(css);
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
      this._cssAdded = true;
    }

    if(this.hasAttribute(FilterContainer.attrs.oninit)) {
      // This timeout was necessary to fix a bug with Google Chrome 93
      // Navigate to a filterable page, navigate away, use the back button to return
      // (connectedCallback would filter before the DOM was ready)
      window.setTimeout(() => {
        for(let key in this.formElements) {
          this.initFormElements(this.formElements[key]);
          this.applyFilterForKey(key);
          this.renderResultCount(true);
        }
      }, 0);
    }
  }

  get valueDelimiter() {
    if(!this._valueDelimiter) {
      this._valueDelimiter = this.getAttribute(FilterContainer.attrs.valueDelimiter) || ",";
    }

    return this._valueDelimiter;
  }

  get formElements() {
    if(!this._lookedFor.formElements) {
      let selector = `:scope [${FilterContainer.attrs.bind}]`;
      let results = {};
      for(let node of this.querySelectorAll(selector)) {
        let attr = node.getAttribute(FilterContainer.attrs.bind);
        if(!results[attr]) {
          results[attr] = [];
        }
        results[attr].push(node);
      }
      this._formElements = results;
      this._lookedFor.formElements = true;
    }

    return this._formElements;
  }

  getAllKeys() {
    return Object.keys(this.formElements);
  }

  getElementSelector(key) {
    return `data-filter-${key}`
  }

  getKeyFromAttributeName(attributeName) {
    return attributeName.substr("data-filter-".length);
  }

  getFilterMode(key) {
    if(!this.modes) {
      this.modes = {};
    }
    if(!this.modes[key]) {
      this.modes[key] = this.getAttribute(`${FilterContainer.attrs.mode}-${key}`);
    }
    if(!this.modes[key]) {
      if(!this.globalMode) {
        this.globalMode = this.getAttribute(FilterContainer.attrs.mode);
      }
      return this.globalMode;
    }

    return this.modes[key];
  }

  bindEvents() {
    this.addEventListener("input", e => {
      let closest = e.target.closest(`[${FilterContainer.attrs.bind}]`);
      if(closest) {
        this.applyFilterForElement(closest);
        requestAnimationFrame(() => {
          this.renderResultCount();
        });
      }
    }, false);
  }

  initFormElements(formElements) {
    for(let el of formElements) {
      let urlParamValues = this.getUrlFilterValues(el);
      for(let value of urlParamValues) {
        let type = el.getAttribute("type");
        if(el.tagName === "INPUT" && (type === "checkbox" || type === "radio")) {
          if(el.value === value) {
            el.checked = true;
          }
        } else {
          el.value = value;
        }
      }
    }
  }

  getFormElementKey(formElement) {
    return formElement.getAttribute(FilterContainer.attrs.bind);
  }

  _getMap(key) {
    let values = [];
    for(let formElement of this.formElements[key]) {
      let type = formElement.getAttribute("type");
      if(formElement.tagName === "INPUT" && (type === "checkbox" || type === "radio")) {
        if(formElement.checked) {
          values.push(formElement.value);
        }
      } else {
        values.push(formElement.value);
      }
    }

    if(!this.hasAttribute(FilterContainer.attrs.leaveUrlAlone)) {
      this.updateUrl(key, values);
    }

    let elementsSelectorAttr = this.getElementSelector(key);
    let selector = `:scope [${elementsSelectorAttr}]`;
    let elements = this.querySelectorAll(selector);

    let map = new Map();
    for(let element of Array.from(elements)) {
      let isValid = this.elementIsValid(element, elementsSelectorAttr, values);
      map.set(element, isValid)
    }
    return map;
  }

  _applyMapForKey(key, map) {
    if(!key) {
      return;
    }

    for(let [element, isVisible] of map) {
      let cls = `filter-${key}--hide`;
      if(isVisible) {
        element.classList.remove(cls);
      } else {
        element.classList.add(cls);
      }
    }
  }

  applyFilterForElement(formElement) {
    let key = this.getFormElementKey(formElement);
    this.applyFilterForKey(key);
  }

  applyFilterForKey(key) {
    let firstFormElementForDelimiter = this.formElements[key][0];
    if(!firstFormElementForDelimiter) {
      return;
    }
    let map = this._getMap(key);
    this._applyMapForKey(key, map);
  }

  _hasValue(needle, haystack = [], mode = "any") {
    if(!haystack || !haystack.length || !Array.isArray(haystack)) {
      return false;
    }

    if(!Array.isArray(needle)) {
      needle = [needle];
    }

    // all must match
    if(mode === "all") {
      let found = true;
      for(let lookingFor of haystack) {
        if(!needle.some((val) => val === lookingFor)) {
          found = false;
        }
      }
      return found;
    }

    for(let lookingFor of needle) {
      // has any, return true
      if(haystack.some((val) => val === lookingFor)) {
        return true;
      }
    }
    return false;
  }

  elementIsValid(element, attributeName, values) {
    let hasAttr = element.hasAttribute(attributeName);
    if(hasAttr && (!values.length || !values.join(""))) { // [] or [''] for value="" radio
      return true;
    }
    let haystack = (element.getAttribute(attributeName) || "").split(this.valueDelimiter);
    let key = this.getKeyFromAttributeName(attributeName);
    let mode = this.getFilterMode(key);
    if(hasAttr && this._hasValue(haystack, values, mode)) {
      return true;
    }
    return false;
  }

  /*
   * Feature: Result count
   */

  get resultsCounter() {
    if(!this._lookedFor.resultsCounter) {
      this._results = this.querySelector(`:scope [${FilterContainer.attrs.results}]`);
      this._lookedFor.resultsCounter = true;
    }

    return this._results;
  }

  getGlobalCount() {
    let keys = this.getAllKeys();
    let selector = keys.map(key => {
      return `:scope [${this.getElementSelector(key)}]`;
    }).join(",");
    let elements = this.querySelectorAll(selector);

    return Array.from(elements)
      .filter(entry => this.elementIsVisible(entry))
      .filter(entry => !this.elementIsExcluded(entry))
      .length;
  }

  elementIsVisible(element) {
    for(let cls of element.classList) {
      if(cls.startsWith("filter-") && cls.endsWith("--hide")) {
        return false;
      }
    }
    return true;
  }

  elementIsExcluded(element) {
    return element.hasAttribute(FilterContainer.attrs.resultsExclude);
  }

  getLabels() {
    if(this.resultsCounter) {
      let attrValue = this.resultsCounter.getAttribute(FilterContainer.attrs.results);
      let split = attrValue.split("/");
      if(split.length === 2) {
        return split;
      }
    }
    return ["Result", "Results"];
  }

  _renderResultCount(count) {
    if(!this.resultsCounter) {
      return;
    }
    if(!count) {
      count = this.getGlobalCount();
    }

    let labels = this.getLabels();
    this.resultsCounter.innerText = `${count} ${count !== 1 ? labels[1] : labels[0]}`;
  }

  renderResultCount(isOnload = false) {
    if(!this.resultsCounter) {
      return;
    }

    if(!isOnload && this.resultsCounter.hasAttribute("aria-live")) {
      // This timeout helped VoiceOver
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this._renderResultCount()
      }, 250);
    } else {
      this._renderResultCount();
    }
  }

  /*
   * Feature: Work with URLs
   */

  getUrlSearchValue() {
    let s = window.location.search;
    if(s.startsWith("?")) {
      return s.substr(1);
    }
    return s;
  }

  getUrlFilterValues(formElement) {
    let params = new URLSearchParams(this.getUrlSearchValue());
    let key = this.getFormElementKey(formElement);
    return params.getAll(key);
  }

  // Future improvement: url updates currently once per key (we could group these into one)
  updateUrl(key, values) {
    let params = new URLSearchParams(this.getUrlSearchValue());
    let keyParamsStr = params.getAll(key).sort().join(",");
    let valuesStr = values.slice().sort().join(",");

    if(keyParamsStr !== valuesStr) {
      params.delete(key);
      for(let value of values) {
        if(value) { // ignore ""
          params.append(key, value);
        }
      }

      let baseUrl = window.location.pathname;
      history.replaceState({}, '', `${baseUrl}${params.toString().length > 0 ? `?${params}`: ""}` );
    }
  }
}

FilterContainer.register();
class FundraisingStatus extends HTMLElement {
	static tagName = "fundraising-status";

	static css = `
:host {
	--fs-color: #333;
	--fs-background: #eee;
	display: flex;
	flex-wrap: nowrap;
	white-space: nowrap;
	align-items: center;
	gap: .25em;
}
@media (prefers-color-scheme: dark) {
	:host {
		--fs-color: rgba(255,255,255,.9);
		--fs-background: rgba(0,0,0,.2);
	}
}
progress {
	flex-grow: 1;
	accent-color: var(--fs-color);
	width: 100%;
}
.max,
.currency {
	font-size: .8125em;
}
@supports (appearance: none) {
	progress {
		height: 1em;
		border-radius: .125em;
		overflow: hidden;
		appearance: none;
	}
	::-webkit-progress-value {
		background: var(--fs-color);
	}
	::-moz-progress-bar {
		background: var(--fs-color);
	}
	::-webkit-progress-bar {
		background-color: var(--fs-background);
		box-shadow: 0 .125em .3125em rgba(0, 0, 0, 0.25) inset;
	}
}
`;

	static register(tagName) {
		if(!("customElements" in globalThis)) {
			return;
		}
		customElements.define(tagName || this.tagName, this);
	}

	get currency() {
		return this.getAttribute("currency") || "USD";
	}

	formatPrice(num, locale) {
		if(!("NumberFormat" in Intl)) {
			return num;
		}

		let localized = new Intl.NumberFormat(locale || navigator.language, {
			style: "currency",
			currency: this.currency,
			currencyDisplay: "symbol",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		});

		return localized.format(num);
	}

	connectedCallback() {
		if (!("replaceSync" in CSSStyleSheet.prototype) || this.shadowRoot) {
			return;
		}

		let min = this.getAttribute("min") || 0;
		let max = this.getAttribute("max") || 1;
		let value = this.getAttribute("value") || 0;

		this.attachShadow({ mode: "open" });

		let sheet = new CSSStyleSheet();
		sheet.replaceSync(FundraisingStatus.css);
		this.shadowRoot.adoptedStyleSheets = [sheet];

		this.render({
			min,
			max,
			value,
		});
	}

	async render({min, max, value}) {
		this.shadowRoot.innerHTML = `<slot></slot>
	<progress min="${min}" max="${max}" value="${value}"></progress>
	<code>${this.formatPrice(value)}</code>
	<code class="max">/${this.formatPrice(max)}</code>
	${!this.hasAttribute("hide-currency") ? `<code class="currency">${this.currency}</code>` : ""}`;
	}
}

FundraisingStatus.register();