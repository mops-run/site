// The consent banner and the tracking of the README (Consent banner, Tracking). With "yes" stored, Customer.io's
// Data Pipelines snippet records the visit with its click IDs, and a form submission identifies the visitor and
// sends the event "Tell me more submitted" before the form posts.
const CHOICE = "mops-consent";
const UTM_TAGS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const CLICK_IDS = ["gclid", "gbraid", "wbraid", "fbclid", "li_fat_id", "msclkid", "ttclid"];
// The write key of the JavaScript source "mops.run" of the mops workspace; it only sends data, so it is public.
const WRITE_KEY = "b5c0a184e52452339783";
// The Data Pipelines host of the EU data centre.
const EDGE_URL = "https://cdp-eu.customer.io";
// The longest wait, in ms, for Customer.io to take the form event before the form posts anyway.
const FORM_WAIT = 1000;

function storedChoice() {
  try {
    return localStorage.getItem(CHOICE);
  } catch {
    return null;
  }
}

function storeChoice(choice) {
  try {
    localStorage.setItem(CHOICE, choice);
  } catch {
    // Without storage the banner asks again on the next visit.
  }
}

/** The parameters of the page's URL that have one of the names, as an object. */
function urlParameters(names) {
  const query = new URLSearchParams(location.search);
  return Object.fromEntries(names.filter((name) => query.has(name)).map((name) => [name, query.get(name)]));
}

/**
 * Customer.io's JavaScript source snippet, version 4.15.3, without its own page() call: window.cioanalytics queues
 * the calls until the script that load() adds takes them over.
 */
function loadCustomerIo() {
  // prettier-ignore
  !function(){var i="cioanalytics", analytics=(window[i]=window[i]||[]);if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.setAttribute('data-global-customerio-analytics-key', i);t.src=EDGE_URL+"/v1/analytics-js/snippet/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._writeKey=key;analytics._loadOptions=e};analytics.SNIPPET_VERSION="4.15.3";
    analytics.load(WRITE_KEY);
  }}();
  return window.cioanalytics;
}

function startTracking() {
  const analytics = loadCustomerIo();
  analytics.page(urlParameters(CLICK_IDS));
  const form = document.querySelector("#tell-me-more form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = form.elements.email.value;
    let posted = false;
    const post = () => {
      if (!posted) {
        posted = true;
        form.submit();
      }
    };
    analytics.identify(email, { email });
    analytics.track("Tell me more submitted", urlParameters([...UTM_TAGS, ...CLICK_IDS]), {}, post);
    setTimeout(post, FORM_WAIT);
  });
}

const choice = storedChoice();
if (choice === "yes") {
  startTracking();
} else if (choice === null) {
  const banner = document.getElementById("consent-banner");
  banner.hidden = false;
  banner.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    storeChoice(button.value);
    banner.hidden = true;
    if (button.value === "yes") startTracking();
  });
}
