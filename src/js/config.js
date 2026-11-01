/*
 * Dorothy, site configuration. Everything here is optional; the site works with defaults.
 *
 * formEndpoint : a free form backend URL (Formspree, Web3Forms, Getform…). Leave empty to
 *                fall back to opening the visitor's email app, nothing is stored anywhere.
 * contactEmail : where volunteer / story / organisation submissions go.
 * aiEndpoint   : optional URL of the Dorothy AI worker (see /worker). When set, Dorothy AI
 *                sends the question + the verified passages it retrieved to the worker, which
 *                phrases a grounded answer. When empty, answers come straight from the
 *                verified knowledge base in the browser, free, private and offline-friendly.
 */
window.DOROTHY_CONFIG = {
  formEndpoint: "",
  contactEmail: "hello@dorothy.in",
  aiEndpoint: "",
};
