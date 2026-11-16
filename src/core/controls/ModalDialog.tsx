"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { WidgetPortal } from "../WidgetPortal";

export interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  id?: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  closeLabel?: string;
  size?: "md" | "lg" | "full";
  trapFocus?: boolean;
  lockScroll?: boolean;
  closeOnBackdrop?: boolean;
  ariaModal?: boolean;
  disableEscapeClose?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  returnFocusTo?: RefObject<HTMLElement | null>;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ModalDialog({
  isOpen,
  onClose,
  id,
  title,
  subtitle,
  icon,
  closeLabel = "Close",
  size = "full",
  trapFocus = true,
  lockScroll = true,
  closeOnBackdrop = true,
  ariaModal = true,
  disableEscapeClose = false,
  initialFocusRef,
  returnFocusTo,
  footer,
  className = "",
  children,
}: ModalDialogProps) {
  const autoId = useId();
  const titleId = `${id ?? autoId}-title`;
  const descId = subtitle ? `${id ?? autoId}-desc` : undefined;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;
      const focusTimer = window.setTimeout(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else if (closeBtnRef.current) {
          closeBtnRef.current.focus();
        } else {
          dialogRef.current?.focus();
        }
      }, 20);
      return () => window.clearTimeout(focusTimer);
    }

    if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
      const target = returnFocusTo?.current;
      if (target && target.isConnected) {
        target.focus();
      }
    }
  }, [isOpen, initialFocusRef, returnFocusTo]);

  useEffect(() => {
    if (!isOpen || !lockScroll || typeof document === "undefined") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, lockScroll]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (disableEscapeClose) return;
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (trapFocus && event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusable = Array.from(
          dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter(
          (el) => el.offsetParent !== null || el === document.activeElement,
        );

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (!dialog.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [isOpen, trapFocus, disableEscapeClose]);

  if (!isOpen) return null;

  return (
    <WidgetPortal>
      <div
        className="arap-modal-overlay"
        onClick={(e) => {
          if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          id={id}
          ref={dialogRef}
          role="dialog"
          aria-modal={ariaModal}
          aria-labelledby={titleId}
          aria-describedby={descId}
          className={`arap-modal arap-modal-${size} ${className}`.trim()}
          tabIndex={-1}
        >
          <div className="arap-modal-header">
            <div className="arap-modal-title-group">
              {icon && (
                <span className="arap-modal-header-icon" aria-hidden="true">
                  {icon}
                </span>
              )}
              <div className="arap-modal-heading-text">
                <h2 id={titleId} className="arap-modal-title">
                  {title}
                </h2>
                {subtitle && (
                  <p id={descId} className="arap-modal-subtitle">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              className="arap-close-btn arap-modal-close-btn"
              onClick={onClose}
              aria-label={closeLabel}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="arap-modal-body">{children}</div>

          {footer && <div className="arap-modal-footer">{footer}</div>}
        </div>
      </div>
    </WidgetPortal>
  );
}

export default ModalDialog;
