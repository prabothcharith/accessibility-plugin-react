"use client";

import type { CSSProperties, ReactNode } from "react";
import { FeatureIcon } from "../FeatureIcon";

export type FeatureStatus =
  "idle" | "active" | "error" | "unavailable" | "permission-required";

export interface FeatureCardProps {
  id?: string;
  featureKey?: string;
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  statusBadge?: string;
  status?: FeatureStatus;
  errorMessage?: string;
  unavailableMessage?: string;
  permissionMessage?: string;
  onRequestPermission?: () => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  largeControls?: boolean;
}

export function FeatureCard({
  id,
  featureKey,
  icon,
  title,
  description,
  statusBadge,
  status = "idle",
  errorMessage,
  unavailableMessage,
  permissionMessage,
  onRequestPermission,
  children,
  className = "",
  style,
  largeControls = false,
}: FeatureCardProps) {
  const cardTitle = typeof title === "string" ? title : undefined;

  return (
    <div
      id={id}
      role="group"
      aria-label={cardTitle}
      className={`arap-feature arap-feature-card ${status !== "idle" ? `arap-feature-${status}` : ""} ${largeControls ? "arap-large-controls" : ""} ${className}`}
      style={style}
    >
      <div className="arap-card-header">
        <span className="arap-label">
          {icon ?? (featureKey ? <FeatureIcon name={featureKey} /> : null)}
          <span className="arap-card-title">{title}</span>
        </span>
        {statusBadge && (
          <span className="arap-status-badge" aria-hidden="true">
            {statusBadge}
          </span>
        )}
      </div>

      {description && <p className="arap-card-desc">{description}</p>}

      {status === "error" && errorMessage && (
        <div className="arap-card-alert arap-card-error" role="alert">
          <span className="arap-alert-icon" aria-hidden="true">
            ⚠️
          </span>
          <span>{errorMessage}</span>
        </div>
      )}

      {status === "unavailable" && unavailableMessage && (
        <div className="arap-card-alert arap-card-unavailable" role="status">
          <span className="arap-alert-icon" aria-hidden="true">
            ℹ️
          </span>
          <span>{unavailableMessage}</span>
        </div>
      )}

      {status === "permission-required" && permissionMessage && (
        <div className="arap-card-alert arap-card-permission" role="status">
          <span className="arap-alert-icon" aria-hidden="true">
            🔒
          </span>
          <div className="arap-permission-content">
            <span>{permissionMessage}</span>
            {onRequestPermission && (
              <button
                type="button"
                className="arap-permission-btn"
                onClick={onRequestPermission}
              >
                Allow permission
              </button>
            )}
          </div>
        </div>
      )}

      <div className="arap-card-content">{children}</div>
    </div>
  );
}

export default FeatureCard;
