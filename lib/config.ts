/*
 * formEndpoint : a free form backend URL (Formspree, Web3Forms, Getform). Leave empty to open the
 *                visitor's email app instead; nothing is stored anywhere.
 * contactEmail : where volunteer, story and organisation submissions go.
 */
export const config = {
  formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT || "",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@dorothy.in",
};
