/*
 * Dorothy, site configuration.
 *
 * formEndpoint : a free form backend URL (Formspree, Web3Forms, Getform). Leave empty to open
 *                the visitor's email app instead; nothing is stored anywhere.
 * contactEmail : where volunteer, story and organisation submissions go.
 * askEndpoint  : Dorothy AI retrieval service (BGE-M3). "" uses only the in-browser search.
 */
window.DOROTHY_CONFIG = {
  formEndpoint: "",
  contactEmail: "hello@dorothy.in",
  askEndpoint: "/api/ask",
};
