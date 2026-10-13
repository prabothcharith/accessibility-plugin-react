import { createContext } from "react";
/** ResetController can live anywhere in JSX while its button occupies the fixed action bar. */
export const PanelActionsContext = createContext<HTMLElement | null>(null);
