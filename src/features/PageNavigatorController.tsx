"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { ModalDialog } from "../core/controls/ModalDialog";
import {
  scanHeadings,
  scanLandmarks,
  scanLinks,
  navigateToElement,
  subscribePageStructure,
  type HeadingItem,
  type LandmarkItem,
  type LinkItem,
} from "../core/pageNavigator";

export interface PageNavigatorControllerProps {
  className?: string;
  label?: string;
  description?: string;
  closeOnNavigate?: boolean;
}

/**
 * Controller to explore and navigate the page's semantic outline (Headings H1-H6, Landmarks, and Links).
 * Safely transfers focus and scrolls to elements with temporary tabindex cleanup.
 * Truthfully displays empty states when pages lack headings, landmarks, or links.
 * Automatically synchronizes with dynamic DOM / SPA route changes without observer loops.
 */
export function PageNavigatorController({
  className = "",
  label = "Page Navigator",
  description = "Explore headings and landmarks",
  closeOnNavigate = false,
}: PageNavigatorControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "headings" | "landmarks" | "links"
  >("headings");
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [landmarks, setLandmarks] = useState<LandmarkItem[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeNavKey, setActiveNavKey] = useState<string | null>(null);
  const [navStatus, setNavStatus] = useState("");
  const searchInputId = useId();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const refreshStructure = useCallback(() => {
    setHeadings(scanHeadings());
    setLandmarks(scanLandmarks());
    setLinks(scanLinks());
  }, []);

  const handleOpen = () => {
    refreshStructure();
    setNavStatus("");
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // Subscribe to external DOM mutations while open
  useEffect(() => {
    if (!isOpen) return;
    return subscribePageStructure(refreshStructure);
  }, [isOpen, refreshStructure]);

  const handleNavigate = (
    element: HTMLElement,
    navKey: string,
    announceText: string,
  ) => {
    setActiveNavKey(navKey);
    setNavStatus(`Navigated to ${announceText}`);
    navigateToElement(element, {
      onComplete: () => {
        if (closeOnNavigate) {
          setIsOpen(false);
        }
      },
    });
  };

  const filteredHeadings = search.trim()
    ? headings.filter((h) =>
        h.text.toLowerCase().includes(search.toLowerCase()),
      )
    : headings;

  const filteredLandmarks = search.trim()
    ? landmarks.filter((l) =>
        l.label.toLowerCase().includes(search.toLowerCase()),
      )
    : landmarks;

  const filteredLinks = search.trim()
    ? links.filter(
        (lnk) =>
          lnk.text.toLowerCase().includes(search.toLowerCase()) ||
          lnk.href.toLowerCase().includes(search.toLowerCase()),
      )
    : links;

  return (
    <div
      className={`arap-feature arap-feature-expandable ${className}`}
      role="group"
      aria-label={label}
    >
      <div className="arap-feature-row-between">
        <span className="arap-label">
          <FeatureIcon name="pageNavigator" />
          <span>
            <span className="arap-label-title">{label}</span>
            {description && (
              <span className="arap-label-sub">{description}</span>
            )}
          </span>
        </span>
        <button
          ref={triggerRef}
          className="arap-btn-secondary arap-btn-compact"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls="arap-page-navigator-dialog"
          onClick={() => {
            if (isOpen) {
              handleClose();
            } else {
              handleOpen();
            }
          }}
        >
          {isOpen ? "Close" : "Explore"}
        </button>
      </div>

      <ModalDialog
        isOpen={isOpen}
        onClose={handleClose}
        id="arap-page-navigator-modal"
        title={label}
        subtitle={description}
        icon={<FeatureIcon name="pageNavigator" />}
        closeLabel="Close Page Navigator"
        size="full"
        trapFocus={false}
        lockScroll={false}
        ariaModal={false}
        initialFocusRef={dialogRef}
        returnFocusTo={triggerRef}
      >
        <div
          ref={dialogRef}
          id="arap-page-navigator-dialog"
          className="arap-navigator-dialog"
          role="region"
          aria-label="Page Structure Explorer"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              handleClose();
            }
          }}
        >
          <div
            className="arap-navigator-tabs"
            role="tablist"
            aria-label="Structure views"
          >
            <button
              id="arap-tab-headings"
              className={`arap-navigator-tab ${activeTab === "headings" ? "arap-navigator-tab-active" : ""}`}
              role="tab"
              aria-selected={activeTab === "headings"}
              aria-controls="arap-panel-headings"
              type="button"
              onClick={() => setActiveTab("headings")}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") {
                  document.getElementById("arap-tab-landmarks")?.focus();
                  setActiveTab("landmarks");
                }
              }}
            >
              <FeatureIcon name="headings" />
              <span>Headings ({headings.length})</span>
            </button>
            <button
              id="arap-tab-landmarks"
              className={`arap-navigator-tab ${activeTab === "landmarks" ? "arap-navigator-tab-active" : ""}`}
              role="tab"
              aria-selected={activeTab === "landmarks"}
              aria-controls="arap-panel-landmarks"
              type="button"
              onClick={() => setActiveTab("landmarks")}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  document.getElementById("arap-tab-headings")?.focus();
                  setActiveTab("headings");
                } else if (e.key === "ArrowRight") {
                  document.getElementById("arap-tab-links")?.focus();
                  setActiveTab("links");
                }
              }}
            >
              <FeatureIcon name="landmarks" />
              <span>Landmarks ({landmarks.length})</span>
            </button>
            <button
              id="arap-tab-links"
              className={`arap-navigator-tab ${activeTab === "links" ? "arap-navigator-tab-active" : ""}`}
              role="tab"
              aria-selected={activeTab === "links"}
              aria-controls="arap-panel-links"
              type="button"
              onClick={() => setActiveTab("links")}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  document.getElementById("arap-tab-landmarks")?.focus();
                  setActiveTab("landmarks");
                }
              }}
            >
              <FeatureIcon name="linkHighlight" />
              <span>Links ({links.length})</span>
            </button>
          </div>

          <div className="arap-navigator-search-box">
            <input
              id={searchInputId}
              name="arap-navigator-filter"
              type="search"
              className="arap-search-input arap-navigator-search"
              placeholder={`Filter ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={`Filter ${activeTab}`}
            />
            {search && (
              <button
                type="button"
                className="arap-search-clear"
                onClick={() => setSearch("")}
                aria-label={`Clear ${activeTab} filter`}
              >
                ×
              </button>
            )}
          </div>

          {navStatus && (
            <div
              className="arap-navigator-status"
              role="status"
              aria-live="polite"
            >
              {navStatus}
            </div>
          )}

          <div className="arap-navigator-content">
            {activeTab === "headings" && (
              <div
                id="arap-panel-headings"
                role="tabpanel"
                aria-labelledby="arap-tab-headings"
              >
                {filteredHeadings.length === 0 ? (
                  <div className="arap-navigator-empty" role="status">
                    {headings.length === 0
                      ? "No headings found on this page."
                      : "No matching headings."}
                  </div>
                ) : (
                  <ul className="arap-navigator-list" role="list">
                    {filteredHeadings.map((h, i) => {
                      const navKey = `h-${h.id}-${i}`;
                      const isActive = activeNavKey === navKey;
                      return (
                        <li key={navKey} className="arap-navigator-item">
                          <button
                            type="button"
                            className={`arap-navigator-jump-btn ${isActive ? "arap-is-active" : ""}`}
                            aria-current={isActive ? "location" : undefined}
                            style={{
                              paddingLeft: `${Math.max(12, (h.level - 1) * 14 + 12)}px`,
                            }}
                            onClick={() =>
                              handleNavigate(
                                h.element,
                                navKey,
                                `H${h.level}: ${h.text}`,
                              )
                            }
                          >
                            <span
                              className="arap-navigator-badge arap-navigator-badge-h"
                              aria-hidden="true"
                            >
                              H{h.level}
                            </span>
                            <span className="arap-navigator-item-text">
                              {h.text}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "landmarks" && (
              <div
                id="arap-panel-landmarks"
                role="tabpanel"
                aria-labelledby="arap-tab-landmarks"
              >
                {filteredLandmarks.length === 0 ? (
                  <div className="arap-navigator-empty" role="status">
                    {landmarks.length === 0
                      ? "No landmarks found on this page."
                      : "No matching landmarks."}
                  </div>
                ) : (
                  <ul className="arap-navigator-list" role="list">
                    {filteredLandmarks.map((l, i) => {
                      const navKey = `l-${l.id}-${i}`;
                      const isActive = activeNavKey === navKey;
                      return (
                        <li key={navKey} className="arap-navigator-item">
                          <button
                            type="button"
                            className={`arap-navigator-jump-btn ${isActive ? "arap-is-active" : ""}`}
                            aria-current={isActive ? "location" : undefined}
                            onClick={() =>
                              handleNavigate(
                                l.element,
                                navKey,
                                `${l.type} landmark: ${l.label}`,
                              )
                            }
                          >
                            <span
                              className="arap-navigator-badge arap-navigator-badge-l"
                              aria-hidden="true"
                            >
                              {l.type.toUpperCase()}
                            </span>
                            <span className="arap-navigator-item-text">
                              {l.label}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "links" && (
              <div
                id="arap-panel-links"
                role="tabpanel"
                aria-labelledby="arap-tab-links"
              >
                {filteredLinks.length === 0 ? (
                  <div className="arap-navigator-empty" role="status">
                    {links.length === 0
                      ? "No links found on this page."
                      : "No matching links."}
                  </div>
                ) : (
                  <ul className="arap-navigator-list" role="list">
                    {filteredLinks.map((lnk, i) => {
                      const navKey = `lnk-${lnk.id}-${i}`;
                      const isActive = activeNavKey === navKey;
                      return (
                        <li key={navKey} className="arap-navigator-item">
                          <button
                            type="button"
                            className={`arap-navigator-jump-btn ${isActive ? "arap-is-active" : ""}`}
                            aria-current={isActive ? "location" : undefined}
                            onClick={() =>
                              handleNavigate(
                                lnk.element,
                                navKey,
                                `link: ${lnk.text}`,
                              )
                            }
                          >
                            <span
                              className={`arap-navigator-badge ${lnk.isExternal ? "arap-navigator-badge-ext" : "arap-navigator-badge-link"}`}
                              aria-hidden="true"
                            >
                              {lnk.isExternal
                                ? "EXT"
                                : lnk.isHash
                                  ? "ANCHOR"
                                  : "LINK"}
                            </span>
                            <span className="arap-navigator-item-text">
                              <span>{lnk.text}</span>
                              {lnk.isAmbiguous && (
                                <span
                                  className="arap-navigator-badge arap-navigator-badge-warning"
                                  title="Uninformative link text (e.g. 'click here')"
                                >
                                  Ambiguous
                                </span>
                              )}
                              <span
                                className="arap-navigator-subtext"
                                aria-hidden="true"
                              >
                                {lnk.href}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}

export const HeadingsNavigatorController = PageNavigatorController;
export const PageStructureController = PageNavigatorController;
export default PageNavigatorController;
