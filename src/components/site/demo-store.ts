import { useSyncExternalStore } from "react";
import { INITIAL_PROJECTS, STORAGE_KEY, loadState, reducer, type Action, type Project } from "./demo-data";

let state: Project[] = INITIAL_PROJECTS;
let loaded = false;
let saveError = false;
const listeners = new Set<() => void>();

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = loadState(window.localStorage);
}

export function dispatch(a: Action) {
  ensureLoaded();
  state = reducer(state, a);
  try {
    if (a.type === "reset") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    saveError = false;
  } catch {
    saveError = true;
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  ensureLoaded();
  listeners.add(l);
  // first subscription after hydration may have loaded stored data
  queueMicrotask(l);
  return () => listeners.delete(l);
}

export function useProjects() {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL_PROJECTS);
}

export const hasSaveError = () => saveError;
