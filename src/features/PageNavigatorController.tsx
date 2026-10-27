"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import {
  scanHeadings,
  scanLandmarks,
  navigateToElement,
  subscribePageStructure,
  type HeadingItem,
  type LandmarkItem,
} from "../core/pageNavigator";

export interface PageNavigatorControllerProps {
  className?: string;
  label?: string;
  description?: string;
  closeOnNavigate?: boolean;
}

/**
 * Controller to explore and navigate the page's semantic outline (Headings H1-H6 and Landmarks).
 * Safely transfers focus and scrolls to elements with temporary tabindex cleanup.
 * Truthfully displays empty states when pages lack headings or landmarks.
 * Automatically synchronizes with dynamic DOM / SPA route changes without observer loops.
 */
export function PageNavigatorController({
  className = "",
  label = "Page Navigator",
  description = "Explore headings and landmarks",
  closeOnNavigate = false,
}: PageNavigatorControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"headings" | "landmarks">(
    "headings",
  );
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [landmarks, setLandmarks] = useState<LandmarkItem[]>([]);
  const [search, setSearch] = useState("");

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const refreshStructure = useCallback(() => {
    setHeadings(scanHeadings());
    setLandmarks(scanLandmarks());
  }, []);

  const handleOpen = () => {
    refreshStructure();
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

  // Focus management when opening dialog
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  const handleNavigate = (element: HTMLElement) => {
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

  return (
    <div
      className={`arap-feature arap-feature-expandable ${className}`}
      role="group"
      aria-label={label}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <span className="arap-label">
          <FeatureIcon name="pageNavigator" />
          <span>
            <span style={{ display: "block" }}>{label}</span>
            {description && (
              <span
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 400,
                  color: "var(--arap-muted, #64748b)",
                  marginTop: "1px",
                }}
              >
                {description}
              </span>
            )}
          </span>
        </span>
        <button
          ref={triggerRef}
          className="arap-btn-sm"
          type="button"
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

      {isOpen && (
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
                }
              }}
            >
              <FeatureIcon name="landmarks" />
              <span>Landmarks ({landmarks.length})</span>
            </button>
          </div>

          <div className="arap-navigator-search-box">
            <input
              type="search"
              className="arap-navigator-search"
              placeholder={`Filter ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={`Filter ${activeTab}`}
            />
          </div>

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
                    {filteredHeadings.map((h, i) => (
                      <li key={`${h.id}-${i}`} className="arap-navigator-item">
                        <button
                          type="button"
                          className="arap-navigator-jump-btn"
                          style={{
                            paddingLeft: `${Math.max(8, (h.level - 1) * 12 + 8)}px`,
                          }}
                          onClick={() => handleNavigate(h.element)}
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
                    ))}
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
                    {filteredLandmarks.map((l, i) => (
                      <li key={`${l.id}-${i}`} className="arap-navigator-item">
                        <button
                          type="button"
                          className="arap-navigator-jump-btn"
                          onClick={() => handleNavigate(l.element)}
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
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const HeadingsNavigatorController = PageNavigatorController;
export const PageStructureController = PageNavigatorController;
export default PageNavigatorController;
