"use client";

export function setStyle(
  element: HTMLElement,
  property: string,
  value: string
): void {
  element.style.setProperty(property, value);
}

export function removeStyle(element: HTMLElement, property: string): void {
  element.style.removeProperty(property);
}

export function addClass(element: HTMLElement, className: string): void {
  element.classList.add(className);
}

export function removeClass(element: HTMLElement, className: string): void {
  element.classList.remove(className);
}

export function toggleClass(
  element: HTMLElement,
  className: string,
  force?: boolean
): void {
  element.classList.toggle(className, force);
}

export function getRootElement(): HTMLElement {
  return document.documentElement;
}

export function getBodyElement(): HTMLElement {
  return document.body;
}

export function applyFilter(filterString: string): void {
  const root = getRootElement();
  if (filterString) {
    setStyle(root, "filter", filterString);
  } else {
    removeStyle(root, "filter");
  }
}

export function clearFilter(): void {
  removeStyle(getRootElement(), "filter");
}
