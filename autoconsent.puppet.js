"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const enableLogs = false; // change this to enable debug logs

/* eslint-disable no-restricted-syntax,no-await-in-loop,no-underscore-dangle */
async function waitFor(predicate, maxTimes, interval) {
  let result = await predicate();
  if (!result && maxTimes > 0) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        resolve(waitFor(predicate, maxTimes - 1, interval));
      }, interval);
    });
  }
  return Promise.resolve(result);
}
async function success(action) {
  const result = await action;
  if (!result) {
    throw new Error(`Action failed: ${action} ${result}`);
  }
  return result;
}
class AutoConsentBase {
  constructor(name) {
    this.hasSelfTest = true;
    this.name = name;
  }
  detectCmp(tab) {
    throw new Error("Not Implemented");
  }
  async detectPopup(tab) {
    return false;
  }
  detectFrame(tab, frame) {
    return false;
  }
  optOut(tab) {
    throw new Error("Not Implemented");
  }
  optIn(tab) {
    throw new Error("Not Implemented");
  }
  openCmp(tab) {
    throw new Error("Not Implemented");
  }
  async test(tab) {
    // try IAB by default
    return Promise.resolve(true);
  }
}
async function evaluateRule(rule, tab) {
  if (rule.frame && !tab.frame) {
    await waitFor(() => Promise.resolve(!!tab.frame), 10, 500);
  }
  const frameId = rule.frame && tab.frame ? tab.frame.id : undefined;
  const results = [];
  if (rule.exists) {
    results.push(tab.elementExists(rule.exists, frameId));
  }
  if (rule.visible) {
    results.push(tab.elementsAreVisible(rule.visible, rule.check, frameId));
  }
  if (rule.eval) {
    results.push(
      new Promise(async (resolve) => {
        // catch eval error silently
        try {
          resolve(await tab.eval(rule.eval, frameId));
        } catch (e) {
          resolve(false);
        }
      })
    );
  }
  if (rule.waitFor) {
    results.push(
      tab.waitForElement(rule.waitFor, rule.timeout || 10000, frameId)
    );
  }
  if (rule.click) {
    if (rule.all === true) {
      results.push(tab.clickElements(rule.click, frameId));
    } else {
      results.push(tab.clickElement(rule.click, frameId));
    }
  }
  if (rule.waitForThenClick) {
    results.push(
      tab
        .waitForElement(rule.waitForThenClick, rule.timeout || 10000, frameId)
        .then(() => tab.clickElement(rule.waitForThenClick, frameId))
    );
  }
  if (rule.wait) {
    results.push(tab.wait(rule.wait));
  }
  if (rule.goto) {
    results.push(tab.goto(rule.goto));
  }
  if (rule.hide) {
    results.push(tab.hideElements(rule.hide, frameId));
  }
  if (rule.undoHide) {
    results.push(tab.undoHideElements(frameId));
  }
  if (rule.waitForFrame) {
    results.push(waitFor(() => !!tab.frame, 40, 500));
  }
  // boolean and of results
  return (await Promise.all(results)).reduce((a, b) => a && b, true);
}
class AutoConsent extends AutoConsentBase {
  constructor(config) {
    super(config.name);
    this.config = config;
  }
  get prehideSelectors() {
    return this.config.prehideSelectors;
  }
  get isHidingRule() {
    return this.config.isHidingRule;
  }
  async _runRulesParallel(tab, rules) {
    const detections = await Promise.all(
      rules.map((rule) => evaluateRule(rule, tab))
    );
    return detections.every((r) => !!r);
  }
  async _runRulesSequentially(tab, rules) {
    for (const rule of rules) {
      const result = await evaluateRule(rule, tab);
      if (!result && !rule.optional) {
        return false;
      }
    }
    return true;
  }
  async detectCmp(tab) {
    if (this.config.detectCmp) {
      return this._runRulesParallel(tab, this.config.detectCmp);
    }
    return false;
  }
  async detectPopup(tab) {
    if (this.config.detectPopup) {
      return this._runRulesParallel(tab, this.config.detectPopup);
    }
    return false;
  }
  detectFrame(tab, frame) {
    if (this.config.frame) {
      return frame.url.startsWith(this.config.frame);
    }
    return false;
  }
  async optOut(tab) {
    if (this.config.optOut) {
      return this._runRulesSequentially(tab, this.config.optOut);
    }
    return false;
  }
  async optIn(tab) {
    if (this.config.optIn) {
      return this._runRulesSequentially(tab, this.config.optIn);
    }
    return false;
  }
  async openCmp(tab) {
    if (this.config.openCmp) {
      return this._runRulesSequentially(tab, this.config.openCmp);
    }
    return false;
  }
  async test(tab) {
    if (this.config.test) {
      return this._runRulesSequentially(tab, this.config.test);
    }
    return super.test(tab);
  }
}

/**
 * This code is in most parts copied from https://github.com/cavi-au/Consent-O-Matic/blob/master/Extension/Tools.js
 * which is licened under the MIT.
 */
class Tools {
  static setBase(base) {
    Tools.base = base;
  }
  static findElement(options, parent = null, multiple = false) {
    let possibleTargets = null;
    if (parent != null) {
      possibleTargets = Array.from(parent.querySelectorAll(options.selector));
    } else {
      if (Tools.base != null) {
        possibleTargets = Array.from(
          Tools.base.querySelectorAll(options.selector)
        );
      } else {
        possibleTargets = Array.from(
          document.querySelectorAll(options.selector)
        );
      }
    }
    if (options.textFilter != null) {
      possibleTargets = possibleTargets.filter((possibleTarget) => {
        let textContent = possibleTarget.textContent.toLowerCase();
        if (Array.isArray(options.textFilter)) {
          let foundText = false;
          for (let text of options.textFilter) {
            if (textContent.indexOf(text.toLowerCase()) !== -1) {
              foundText = true;
              break;
            }
          }
          return foundText;
        } else if (options.textFilter != null) {
          return textContent.indexOf(options.textFilter.toLowerCase()) !== -1;
        }
      });
    }
    if (options.styleFilters != null) {
      possibleTargets = possibleTargets.filter((possibleTarget) => {
        let styles = window.getComputedStyle(possibleTarget);
        let keep = true;
        for (let styleFilter of options.styleFilters) {
          let option = styles[styleFilter.option];
          if (styleFilter.negated) {
            keep = keep && option !== styleFilter.value;
          } else {
            keep = keep && option === styleFilter.value;
          }
        }
        return keep;
      });
    }
    if (options.displayFilter != null) {
      possibleTargets = possibleTargets.filter((possibleTarget) => {
        if (options.displayFilter) {
          //We should be displayed
          return possibleTarget.offsetHeight !== 0;
        } else {
          //We should not be displayed
          return possibleTarget.offsetHeight === 0;
        }
      });
    }
    if (options.iframeFilter != null) {
      possibleTargets = possibleTargets.filter((possibleTarget) => {
        if (options.iframeFilter) {
          //We should be inside an iframe
          return window.location !== window.parent.location;
        } else {
          //We should not be inside an iframe
          return window.location === window.parent.location;
        }
      });
    }
    if (options.childFilter != null) {
      possibleTargets = possibleTargets.filter((possibleTarget) => {
        let oldBase = Tools.base;
        Tools.setBase(possibleTarget);
        let childResults = Tools.find(options.childFilter);
        Tools.setBase(oldBase);
        return childResults.target != null;
      });
    }
    if (multiple) {
      return possibleTargets;
    } else {
      if (possibleTargets.length > 1) {
        console.warn(
          "Multiple possible targets: ",
          possibleTargets,
          options,
          parent
        );
      }
      return possibleTargets[0];
    }
  }
  static find(options, multiple = false) {
    let results = [];
    if (options.parent != null) {
      let parent = Tools.findElement(options.parent, null, multiple);
      if (parent != null) {
        if (parent instanceof Array) {
          parent.forEach((p) => {
            let targets = Tools.findElement(options.target, p, multiple);
            if (targets instanceof Array) {
              targets.forEach((target) => {
                results.push({
                  parent: p,
                  target: target,
                });
              });
            } else {
              results.push({
                parent: p,
                target: targets,
              });
            }
          });
          return results;
        } else {
          let targets = Tools.findElement(options.target, parent, multiple);
          if (targets instanceof Array) {
            targets.forEach((target) => {
              results.push({
                parent: parent,
                target: target,
              });
            });
          } else {
            results.push({
              parent: parent,
              target: targets,
            });
          }
        }
      }
    } else {
      let targets = Tools.findElement(options.target, null, multiple);
      if (targets instanceof Array) {
        targets.forEach((target) => {
          results.push({
            parent: null,
            target: target,
          });
        });
      } else {
        results.push({
          parent: null,
          target: targets,
        });
      }
    }
    if (results.length === 0) {
      results.push({
        parent: null,
        target: null,
      });
    }
    if (multiple) {
      return results;
    } else {
      if (results.length !== 1) {
        console.warn(
          "Multiple results found, even though multiple false",
          results
        );
      }
      return results[0];
    }
  }
}
Tools.base = null;

function matches(config) {
  const result = Tools.find(config);
  if (config.type === "css") {
    return !!result.target;
  } else if (config.type === "checkbox") {
    return !!result.target && result.target.checked;
  }
}

// get or create a style container for CSS overrides
function getStyleElementUtil() {
  const styleOverrideElementId = "autoconsent-css-rules";
  const styleSelector = `style#${styleOverrideElementId}`;
  const existingElement = document.querySelector(styleSelector);
  if (existingElement && existingElement instanceof HTMLStyleElement) {
    return existingElement;
  } else {
    const parent =
      document.head ||
      document.getElementsByTagName("head")[0] ||
      document.documentElement;
    const css = document.createElement("style");
    css.id = styleOverrideElementId;
    parent.appendChild(css);
    return css;
  }
}
// hide elements with a CSS rule
function hideElementsUtil(selectors, method) {
  const hidingSnippet = method === "display" ? `display: none` : `opacity: 0`;
  const rule = `${selectors.join(
    ","
  )} { ${hidingSnippet} !important; z-index: -1 !important; pointer-events: none !important; } `;
  const styleEl = getStyleElementUtil();
  if (styleEl instanceof HTMLStyleElement) {
    styleEl.innerText += rule;
    return selectors.length > 0;
  }
  return false;
}

const DEBUG = false;
class Tab {
  constructor(page, url, frames) {
    // puppeteer doesn't have tab IDs
    this.id = 1;
    this.page = page;
    this.url = url;
    this.frames = frames;
    this._utilsSnippet = `
      ${getStyleElementUtil.toString()}
      ${hideElementsUtil.toString()}
    `;
  }
  async elementExists(selector, frameId = 0) {
    const elements = await this.frames[frameId].$$(selector);
    return elements.length > 0;
  }
  async clickElement(selector, frameId = 0) {
    if (await this.elementExists(selector, frameId)) {
      try {
        const result = await this.frames[frameId].evaluate((s) => {
          try {
            document.querySelector(s).click();
            return true;
          } catch (e) {
            return e.toString();
          }
        }, selector);
        DEBUG && console.log("[click]", selector, result);
        return result;
      } catch (e) {
        return false;
      }
    }
    return false;
  }
  async clickElements(selector, frameId = 0) {
    const elements = await this.frames[frameId].$$(selector);
    await this.frames[frameId].evaluate((s) => {
      const elem = document.querySelectorAll(s);
      elem.forEach((e) => e.click());
    }, selector);
    return true;
  }
  async elementsAreVisible(selector, check, frameId = 0) {
    if (!(await this.elementExists(selector, frameId))) {
      return false;
    }
    const visible = await this.frames[frameId].$$eval(selector, (nodes) =>
      nodes.map(
        (n) =>
          n.offsetParent !== null ||
          window.getComputedStyle(n).display !== "none"
      )
    );
    if (visible.length === 0) {
      return false;
    } else if (check === "any") {
      return visible.some((r) => r);
    } else if (check === "none") {
      return visible.every((r) => !r);
    }
    return visible.every((r) => r);
  }
  async getAttribute(selector, attribute, frameId = 0) {
    const elem = await this.frames[frameId].$(selector);
    if (elem) {
      return (await elem.getProperty(attribute)).jsonValue();
    }
  }
  async eval(script, frameId = 0) {
    const result = await this.frames[frameId].evaluate(script);
    return result;
  }
  async waitForElement(selector, timeout, frameId = 0) {
    const interval = 200;
    const times = Math.ceil(timeout / interval);
    return waitFor(
      () => this.elementExists(selector, frameId),
      times,
      interval
    );
  }
  async waitForThenClick(selector, timeout, frameId = 0) {
    if (await this.waitForElement(selector, timeout, frameId)) {
      return await this.clickElement(selector, frameId);
    }
    return false;
  }
  async hideElements(selectors, frameId = 0, method = "display") {
    return await this.frames[frameId].evaluate(`(() => {
      ${this._utilsSnippet}
      return hideElementsUtil(${JSON.stringify(selectors)}, '${method}');
    })()`);
  }
  undoHideElements(frameId) {
    return Promise.resolve(true);
  }
  async goto(url) {
    return this.page.goto(url);
  }
  wait(ms) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), ms);
    });
  }
  matches(options) {
    const script = `(() => {
      const Tools = ${Tools.toString()};
      const matches = ${matches.toString()};
      return matches(${JSON.stringify(options)})
    })();
    `;
    return this.frames[0].evaluate(script);
  }
  executeAction(config, param) {
    throw new Error("Method not implemented.");
  }
}

async function detectDialog(tab, retries, rules) {
  let breakEarly = false;
  const found = await new Promise(async (resolve) => {
    let earlyReturn = false;
    await Promise.all(
      rules.map(async (r, index) => {
        try {
          if (await r.detectCmp(tab)) {
            earlyReturn = true;
            enableLogs && console.log(`Found CMP in [${tab.id}]: ${r.name}`);
            resolve(index);
          }
        } catch (e) {
          breakEarly = true;
        }
      })
    );
    if (!earlyReturn) {
      resolve(-1);
    }
  });
  if (found === -1 && retries > 0 && !breakEarly) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = detectDialog(tab, retries - 1, rules);
        resolve(result);
      }, 500);
    });
  }
  return found > -1 ? rules[found] : null;
}

class TabConsent {
  constructor(tab, ruleCheckPromise) {
    this.tab = tab;
    this.optOutStatus = null;
    this.checked = ruleCheckPromise;
    ruleCheckPromise.then((rule) => (this.rule = rule));
  }
  getCMPName() {
    if (this.rule) {
      return this.rule.name;
    }
    return null;
  }
  async isPopupOpen(retries = 1, interval = 1000) {
    const isOpen = await this.rule.detectPopup(this.tab);
    if (!isOpen && retries > 0) {
      return new Promise((resolve) =>
        setTimeout(
          () => resolve(this.isPopupOpen(retries - 1, interval)),
          interval
        )
      );
    }
    return isOpen;
  }
  async doOptOut() {
    try {
      enableLogs &&
        console.log(`doing opt out ${this.getCMPName()} in tab ${this.tab.id}`);
      this.optOutStatus = await this.rule.optOut(this.tab);
      return this.optOutStatus;
    } catch (e) {
      console.error("error during opt out", e);
      this.optOutStatus = e;
      throw e;
    } finally {
      if (!this.rule.isHidingRule) {
        if (this.getCMPName().startsWith("com_")) {
          this.tab.wait(5000).then(() => this.tab.undoHideElements());
        } else {
          await this.tab.undoHideElements();
        }
      }
    }
  }
  async doOptIn() {
    try {
      return this.rule.optIn(this.tab);
    } finally {
      if (!this.rule.isHidingRule) {
        await this.tab.undoHideElements();
      }
    }
  }
  hasTest() {
    return !!this.rule.hasSelfTest;
  }
  async testOptOutWorked() {
    return this.rule.test(this.tab);
  }
  async applyCosmetics(selectors) {
    const hidden = await this.tab.hideElements(selectors);
    return hidden;
  }
}

// hide rules not specific to a single CMP rule
const globalHidden = [
  "#didomi-popup,.didomi-popup-container,.didomi-popup-notice,.didomi-consent-popup-preferences,#didomi-notice,.didomi-popup-backdrop,.didomi-screen-medium",
];
async function prehideElements(tab, rules) {
  const selectors = rules.reduce((selectorList, rule) => {
    if (rule.prehideSelectors) {
      return [...selectorList, ...rule.prehideSelectors];
    }
    return selectorList;
  }, globalHidden);
  await tab.hideElements(selectors, undefined, "opacity");
}

class TrustArc extends AutoConsentBase {
  constructor() {
    super("TrustArc");
    this.prehideSelectors = [
      ".trustarc-banner-container",
      ".truste_popframe,.truste_overlay,.truste_box_overlay,#truste-consent-track",
    ];
  }
  detectFrame(_, frame) {
    return frame.url.startsWith("https://consent-pref.trustarc.com/?");
  }
  async detectCmp(tab) {
    if (
      tab.frame &&
      tab.frame.url.startsWith("https://consent-pref.trustarc.com/?")
    ) {
      return true;
    }
    return tab.elementExists("#truste-show-consent,#truste-consent-track");
  }
  async detectPopup(tab) {
    return (
      (await tab.elementsAreVisible(
        "#truste-consent-content,.truste-consent-content,#trustarc-banner-overlay"
      )) ||
      (tab.frame &&
        (await tab.waitForElement(
          "#defaultpreferencemanager",
          5000,
          tab.frame.id
        )))
    );
  }
  async openFrame(tab) {
    if (await tab.elementExists("#truste-show-consent")) {
      await tab.clickElement("#truste-show-consent");
    }
  }
  async navigateToSettings(tab, frameId) {
    // wait for it to load
    await waitFor(
      async () => {
        return (
          (await tab.elementExists(".shp", frameId)) ||
          (await tab.elementsAreVisible(".advance", "any", frameId)) ||
          tab.elementExists(".switch span:first-child", frameId)
        );
      },
      10,
      500
    );
    // splash screen -> hit more information
    if (await tab.elementExists(".shp", frameId)) {
      await tab.clickElement(".shp", frameId);
    }
    await tab.waitForElement(".prefPanel", 5000, frameId);
    // go to advanced settings if not yet shown
    if (await tab.elementsAreVisible(".advance", "any", frameId)) {
      await tab.clickElement(".advance", frameId);
    }
    // takes a while to load the opt-in/opt-out buttons
    return await waitFor(
      () => tab.elementsAreVisible(".switch span:first-child", "any", frameId),
      5,
      1000
    );
  }
  async optOut(tab) {
    // await tab.hideElements(['.truste_overlay', '.truste_box_overlay', '.trustarc-banner', '.truste-banner']);
    if (await tab.elementExists("#truste-consent-required")) {
      return tab.clickElement("#truste-consent-required");
    }
    if (!tab.frame) {
      await tab.clickElement("#truste-show-consent");
      await waitFor(
        async () =>
          !!tab.frame &&
          (await tab.elementsAreVisible(".mainContent", "any", tab.frame.id)),
        50,
        100
      );
    }
    const frameId = tab.frame.id;
    await waitFor(
      () => tab.eval("document.readyState === 'complete'", frameId),
      20,
      100
    );
    tab.hideElements([
      ".truste_popframe",
      ".truste_overlay",
      ".truste_box_overlay",
      "#truste-consent-track",
    ]);
    if (await tab.elementExists(".rejectAll", frameId)) {
      return tab.clickElement(".rejectAll", frameId);
    }
    if (await tab.waitForElement("#catDetails0", 1000, frameId)) {
      await tab.clickElement("#catDetails0", frameId);
      return tab.clickElement(".submit", frameId);
    }
    if (await tab.elementExists(".required", frameId)) {
      await tab.clickElement(".required", frameId);
    } else {
      await this.navigateToSettings(tab, frameId);
      await tab.clickElements(
        ".switch span:nth-child(1):not(.active)",
        frameId
      );
      await tab.clickElement(".submit", frameId);
    }
    try {
      await tab.waitForThenClick("#gwt-debug-close_id", 20000, tab.frame.id);
    } catch (e) {
      // ignore frame disappearing
    }
    return true;
  }
  async optIn(tab) {
    if (!tab.frame) {
      await this.openFrame(tab);
      await waitFor(() => !!tab.frame, 10, 200);
    }
    const frameId = tab.frame.id;
    await this.navigateToSettings(tab, frameId);
    await tab.clickElements(".switch span:nth-child(2)", frameId);
    await tab.clickElement(".submit", frameId);
    await waitFor(
      () => tab.elementExists("#gwt-debug-close_id", frameId),
      300,
      1000
    );
    await tab.clickElement("#gwt-debug-close_id", frameId);
    return true;
  }
  async openCmp(tab) {
    await tab.eval("truste.eu.clickListener()");
    return true;
  }
  async test() {
    // TODO: find out how to test TrustArc
    return true;
  }
}

class Cookiebot extends AutoConsentBase {
  constructor() {
    super("Cybotcookiebot");
    this.prehideSelectors = [
      "#CybotCookiebotDialog,#dtcookie-container,#cookiebanner,#cb-cookieoverlay",
    ];
  }
  async detectCmp(tab) {
    try {
      return await tab.eval(
        'typeof window.CookieConsent === "object" && typeof window.CookieConsent.name === "string"'
      );
    } catch (e) {
      return false;
    }
  }
  detectPopup(tab) {
    return tab.elementExists(
      "#CybotCookiebotDialog,#dtcookie-container,#cookiebanner,#cb-cookiebanner"
    );
  }
  async optOut(tab) {
    if (await tab.elementExists(".cookie-alert-extended-detail-link")) {
      await tab.clickElement(".cookie-alert-extended-detail-link");
      await tab.waitForElement(".cookie-alert-configuration", 1000);
      await tab.clickElements(".cookie-alert-configuration-input:checked");
      return tab.clickElement(".cookie-alert-extended-button-secondary");
    }
    if (await tab.elementExists("#dtcookie-container")) {
      return tab.clickElement(".h-dtcookie-decline");
    }
    if (await tab.elementExists(".cookiebot__button--settings")) {
      await tab.clickElement(".cookiebot__button--settings");
    }
    if (
      await tab.elementsAreVisible(
        "#CybotCookiebotDialogBodyButtonDecline",
        "all"
      )
    ) {
      return await tab.clickElement("#CybotCookiebotDialogBodyButtonDecline");
    }
    if (await tab.elementExists(".cookiebanner__link--details")) {
      await tab.clickElement(".cookiebanner__link--details");
    }
    await tab.clickElements(
      '.CybotCookiebotDialogBodyLevelButton:checked:enabled,input[id*="CybotCookiebotDialogBodyLevelButton"]:checked:enabled'
    );
    if (await tab.elementExists("#CybotCookiebotDialogBodyButtonDecline")) {
      await tab.clickElement("#CybotCookiebotDialogBodyButtonDecline");
    }
    if (
      await tab.elementExists(
        "input[id^=CybotCookiebotDialogBodyLevelButton]:checked"
      )
    ) {
      await tab.clickElements(
        "input[id^=CybotCookiebotDialogBodyLevelButton]:checked"
      );
    }
    if (
      await tab.elementExists("#CybotCookiebotDialogBodyButtonAcceptSelected")
    ) {
      await tab.clickElement("#CybotCookiebotDialogBodyButtonAcceptSelected");
    } else {
      await tab.clickElements(
        "#CybotCookiebotDialogBodyLevelButtonAccept,#CybotCookiebotDialogBodyButtonAccept,#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection"
      );
    }
    // some sites have custom submit buttons with no obvious selectors. In this case we just call the submitConsent API.
    if (await tab.eval("CookieConsent.hasResponse !== true")) {
      await tab.eval("Cookiebot.dialog.submitConsent() || true");
      await tab.wait(500);
    }
    // site with 3rd confirm settings modal
    if (await tab.elementExists("#cb-confirmedSettings")) {
      await tab.eval("endCookieProcess()");
    }
    return true;
  }
  async optIn(tab) {
    if (await tab.elementExists("#dtcookie-container")) {
      return tab.clickElement(".h-dtcookie-accept");
    }
    await tab.clickElements(
      ".CybotCookiebotDialogBodyLevelButton:not(:checked):enabled"
    );
    await tab.clickElement("#CybotCookiebotDialogBodyLevelButtonAccept");
    await tab.clickElement("#CybotCookiebotDialogBodyButtonAccept");
    return true;
  }
  async openCmp(tab) {
    await tab.eval("CookieConsent.renew() || true");
    return tab.waitForElement("#CybotCookiebotDialog", 10000);
  }
  async test(tab) {
    return tab.eval("CookieConsent.declined === true");
  }
}

class SourcePoint extends AutoConsentBase {
  constructor() {
    super("Sourcepoint");
    this.ccpaMode = false;
    this.prehideSelectors = [
      "div[id^='sp_message_container_'],.message-overlay",
    ];
  }
  detectFrame(_, frame) {
    try {
      const url = new URL(frame.url);
      if (
        url.searchParams.has("message_id") &&
        url.hostname === "ccpa-notice.sp-prod.net"
      ) {
        this.ccpaMode = true;
        return true;
      }
      return (
        (url.pathname === "/index.html" ||
          url.pathname === "/privacy-manager/index.html") &&
        url.searchParams.has("message_id") &&
        url.searchParams.has("requestUUID")
      );
    } catch (e) {
      return false;
    }
  }
  async detectCmp(tab) {
    return (
      (await tab.elementExists("div[id^='sp_message_container_']")) ||
      !!tab.frame
    );
  }
  async detectPopup(tab) {
    return await tab.elementsAreVisible("div[id^='sp_message_container_']");
  }
  async optIn(tab) {
    return tab.clickElement(".sp_choice_type_11", tab.frame.id);
  }
  isManagerOpen(tab) {
    return (
      tab.frame &&
      new URL(tab.frame.url).pathname === "/privacy-manager/index.html"
    );
  }
  async optOut(tab) {
    try {
      tab.hideElements(["div[id^='sp_message_container_']"]);
      if (!this.isManagerOpen(tab)) {
        if (!(await waitFor(() => !!tab.frame, 30, 100))) {
          throw "Frame never opened";
        }
        if (
          !(await tab.elementExists("button.sp_choice_type_12", tab.frame.id))
        ) {
          // do not sell button
          return tab.clickElement("button.sp_choice_type_13", tab.frame.id);
        }
        await success(
          tab.clickElement("button.sp_choice_type_12", tab.frame.id)
        );
        await waitFor(
          () =>
            new URL(tab.frame.url).pathname === "/privacy-manager/index.html",
          200,
          100
        );
      }
      await tab.waitForElement(".type-modal", 20000, tab.frame.id);
      // reject all button is offered by some sites
      try {
        const path = await Promise.race([
          tab
            .waitForElement(".sp_choice_type_REJECT_ALL", 2000, tab.frame.id)
            .then((r) => 0),
          tab
            .waitForElement(".reject-toggle", 2000, tab.frame.id)
            .then(() => 1),
          tab.waitForElement(".pm-features", 2000, tab.frame.id).then((r) => 2),
        ]);
        if (path === 0) {
          await tab.wait(1000);
          return await success(
            tab.clickElement(".sp_choice_type_REJECT_ALL", tab.frame.id)
          );
        } else if (path === 1) {
          await tab.clickElement(".reject-toggle", tab.frame.id);
        } else {
          await tab.waitForElement(".pm-features", 10000, tab.frame.id);
          await tab.clickElements(".checked > span", tab.frame.id);
          if (await tab.elementExists(".chevron", tab.frame.id)) {
            await tab.clickElement(".chevron", tab.frame.id);
          }
        }
      } catch (e) {}
      return await tab.clickElement(
        ".sp_choice_type_SAVE_AND_EXIT",
        tab.frame.id
      );
    } finally {
      tab.undoHideElements();
    }
  }
  async test(tab) {
    await tab.eval("__tcfapi('getTCData', 2, r => window.__rcsResult = r)");
    return tab.eval(
      "Object.values(window.__rcsResult.purpose.consents).every(c => !c)"
    );
  }
}

// Note: JS API is also available:
// https://help.consentmanager.net/books/cmp/page/javascript-api
class ConsentManager extends AutoConsentBase {
  constructor() {
    super("consentmanager.net");
    this.prehideSelectors = ["#cmpbox,#cmpbox2"];
  }
  detectCmp(tab) {
    return tab.elementExists("#cmpbox");
  }
  detectPopup(tab) {
    return tab.elementsAreVisible("#cmpbox .cmpmore", "any");
  }
  async optOut(tab) {
    if (await tab.elementExists(".cmpboxbtnno")) {
      return tab.clickElement(".cmpboxbtnno");
    }
    if (await tab.elementExists(".cmpwelcomeprpsbtn")) {
      await tab.clickElements(".cmpwelcomeprpsbtn > a[aria-checked=true]");
      return await tab.clickElement(".cmpboxbtnsave");
    }
    await tab.clickElement(".cmpboxbtncustom");
    await tab.waitForElement(".cmptblbox", 2000);
    await tab.clickElements(".cmptdchoice > a[aria-checked=true]");
    return tab.clickElement(".cmpboxbtnyescustomchoices");
  }
  async optIn(tab) {
    return tab.clickElement(".cmpboxbtnyes");
  }
}

// Note: JS API is also available:
// https://help.consentmanager.net/books/cmp/page/javascript-api
class Evidon extends AutoConsentBase {
  constructor() {
    super("Evidon");
  }
  detectCmp(tab) {
    return tab.elementExists("#_evidon_banner");
  }
  detectPopup(tab) {
    return tab.elementsAreVisible("#_evidon_banner");
  }
  async optOut(tab) {
    if (await tab.elementExists("#_evidon-decline-button")) {
      return tab.clickElement("#_evidon-decline-button");
    }
    tab.hideElements([
      "#evidon-prefdiag-overlay",
      "#evidon-prefdiag-background",
    ]);
    await tab.clickElement("#_evidon-option-button");
    await tab.waitForElement("#evidon-prefdiag-overlay", 5000);
    return tab.clickElement("#evidon-prefdiag-decline");
  }
  async optIn(tab) {
    return tab.clickElement("#_evidon-accept-button");
  }
}

class Onetrust extends AutoConsentBase {
  constructor() {
    super("Onetrust");
    this.prehideSelectors = [
      "#onetrust-banner-sdk,#onetrust-consent-sdk,.optanon-alert-box-wrapper,.onetrust-pc-dark-filter,.js-consent-banner",
    ];
  }
  detectCmp(tab) {
    return tab.elementExists("#onetrust-banner-sdk,.optanon-alert-box-wrapper");
  }
  detectPopup(tab) {
    return tab.elementsAreVisible(
      "#onetrust-banner-sdk,.optanon-alert-box-wrapper"
    );
  }
  async optOut(tab) {
    if (await tab.elementExists("#onetrust-pc-btn-handler")) {
      // "show purposes" button inside a popup
      await success(tab.clickElement("#onetrust-pc-btn-handler"));
    } else {
      // otherwise look for a generic "show settings" button
      await success(
        tab.clickElement(".ot-sdk-show-settings,button.js-cookie-settings")
      );
    }
    await success(tab.waitForElement("#onetrust-consent-sdk", 2000));
    await success(tab.wait(1000));
    await tab.clickElements(
      "#onetrust-consent-sdk input.category-switch-handler:checked,.js-editor-toggle-state:checked"
    ); // optional step
    await success(
      tab.waitForThenClick(
        ".save-preference-btn-handler,.js-consent-save",
        1000
      )
    );
    // popup doesn't disappear immediately
    await waitFor(
      async () => !(await tab.elementsAreVisible("#onetrust-banner-sdk")),
      10,
      500
    );
    return true;
  }
  async optIn(tab) {
    return tab.clickElement("onetrust-accept-btn-handler,js-accept-cookies");
  }
  async test(tab) {
    return tab.eval(
      "window.OnetrustActiveGroups.split(',').filter(s => s.length > 0).length <= 1"
    );
  }
}

const rules = [
  new TrustArc(),
  new Cookiebot(),
  new SourcePoint(),
  new ConsentManager(),
  new Evidon(),
  new Onetrust(),
];
function createAutoCMP(config) {
  return new AutoConsent(config);
}

const rules$1 = rules;

class ConsentOMaticCMP {
  constructor(name, config) {
    this.name = name;
    this.config = config;
    this.methods = new Map();
    config.methods.forEach((methodConfig) => {
      if (methodConfig.action) {
        this.methods.set(methodConfig.name, methodConfig.action);
      }
    });
    this.hasSelfTest = this.methods.has("TEST_CONSENT");
  }
  async detectCmp(tab) {
    return (
      await Promise.all(
        this.config.detectors.map((detectorConfig) =>
          tab.matches(detectorConfig.presentMatcher)
        )
      )
    ).some((matched) => matched);
  }
  async detectPopup(tab) {
    return (
      await Promise.all(
        this.config.detectors.map((detectorConfig) =>
          tab.matches(detectorConfig.showingMatcher)
        )
      )
    ).some((matched) => matched);
  }
  async executeAction(tab, method, param) {
    if (this.methods.has(method)) {
      return tab.executeAction(this.methods.get(method), param);
    }
    return true;
  }
  async optOut(tab) {
    await this.executeAction(tab, "HIDE_CMP");
    await this.executeAction(tab, "OPEN_OPTIONS");
    await this.executeAction(tab, "HIDE_CMP");
    await this.executeAction(tab, "DO_CONSENT", []);
    await this.executeAction(tab, "SAVE_CONSENT");
    return true;
  }
  async optIn(tab) {
    await this.executeAction(tab, "HIDE_CMP");
    await this.executeAction(tab, "OPEN_OPTIONS");
    await this.executeAction(tab, "HIDE_CMP");
    await this.executeAction(tab, "DO_CONSENT", ["D", "A", "B", "E", "F", "X"]);
    await this.executeAction(tab, "SAVE_CONSENT");
    return true;
  }
  async openCmp(tab) {
    await this.executeAction(tab, "HIDE_CMP");
    await this.executeAction(tab, "OPEN_OPTIONS");
    return true;
  }
  test(tab) {
    return this.executeAction(tab, "TEST_CONSENT");
  }
  detectFrame(tab, frame) {
    return false;
  }
}

function attachToPage(page, url, rules, retries = 1, prehide = true) {
  const frames = {
    0: page.mainFrame(),
  };
  const tab = new Tab(page, url, frames);
  async function onFrame(frame) {
    const allFrames = await page.frames();
    allFrames.forEach((frame, frameId) => {
      const frameMatch = rules.findIndex((r) =>
        r.detectFrame(tab, {
          url: frame.url(),
        })
      );
      if (frameMatch > -1) {
        tab.frame = {
          type: rules[frameMatch].name,
          url: frame.url(),
          id: frameId,
        };
        frames[frameId] = frame;
      }
    });
  }
  page.on("framenavigated", onFrame);
  page.frames().forEach(onFrame);
  if (prehide) {
    prehideElements(tab, rules);
  }
  return new TabConsent(tab, detectDialog(tab, retries, rules));
}

exports.ConsentOMaticCMP = ConsentOMaticCMP;
exports.Tab = Tab;
exports.TabConsent = TabConsent;
exports.attachToPage = attachToPage;
exports.createAutoCMP = createAutoCMP;
exports.detectDialog = detectDialog;
exports.rules = rules$1;
exports.waitFor = waitFor;
