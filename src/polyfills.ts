/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 */

// Zone.js is required by Angular
import 'zone.js';

// Polyfills for older browsers
import 'core-js/features/reflect';
import 'core-js/features/promise';
import 'core-js/features/object/assign';
import 'core-js/features/array/from';
import 'core-js/features/array/find';
import 'core-js/features/array/includes';
import 'core-js/features/string/includes';
import 'core-js/features/string/starts-with';
import 'core-js/features/string/ends-with';

// Polyfill for Element.prototype.matches
if (!Element.prototype.matches) {
  Element.prototype.matches =
    (Element.prototype as any).msMatchesSelector ||
    (Element.prototype as any).webkitMatchesSelector;
}

// Polyfill for Element.prototype.closest
if (!Element.prototype.closest) {
  Element.prototype.closest = function (s: string) {
    let el: Element | null = this;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement;
    } while (el !== null);
    return null;
  };
}

// Polyfill for NodeList.prototype.forEach
if (window.NodeList && !NodeList.prototype.forEach) {
  (NodeList.prototype as any).forEach = Array.prototype.forEach;
}

// Polyfill for CustomEvent
if (typeof window.CustomEvent !== 'function') {
  const CustomEvent = function (event: string, params: any) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(
      event,
      params.bubbles,
      params.cancelable,
      params.detail
    );
    return evt;
  };
  CustomEvent.prototype = window.Event.prototype;
  (window as any).CustomEvent = CustomEvent;
}
