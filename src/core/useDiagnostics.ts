"use client";

import { useEffect, useState } from "react";
import {
  type DiagnosticsConfig,
  type DiagnosticsReport,
  runDiagnostics,
} from "./diagnostics";

/**
 * React hook to retrieve integration diagnostics.
 * In production environments, returns an empty report unless `config.force` is true.
 */
export function useDiagnostics(
  config: DiagnosticsConfig = {},
): DiagnosticsReport {
  const [report, setReport] = useState<DiagnosticsReport>(() =>
    runDiagnostics({ ...config, logToConsole: false }),
  );

  const force = config.force;
  const root = config.root;

  useEffect(() => {
    const timer = setTimeout(() => {
      setReport(
        runDiagnostics({ ...config, force, root, logToConsole: false }),
      );
    }, 0);
    return () => clearTimeout(timer);
  }, [force, root, config]);

  return report;
}
