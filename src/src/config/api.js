const DEFAULT_API = "http://localhost:5000";

export function getApiBase() {
  return localStorage.getItem("API_BASE_URL") || DEFAULT_API;
}

export function setApiBase(url) {
  localStorage.setItem("API_BASE_URL", url);
}
