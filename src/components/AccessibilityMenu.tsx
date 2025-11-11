import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccessibilityProvider, useAccessibility } from '../context/AccessibilityContext';
import { useAccessibilityStyles } from '../hooks/useAccessibilityStyles';
import { AccessibilityMenuProps } from '../types';
import styles from './AccessibilityMenu.module.css';

interface AccessibilityMenuContentProps {
  position: 'left' | 'right' | 'top' | 'bottom';
  children?: ReactNode;
}

function AccessibilityMenuContent({ position, children }: AccessibilityMenuContentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { dispatch } = useAccessibility();
  
  useAccessibilityStyles();

  const handleReset = () => {
    dispatch({ type: 'RESET_ALL' });
  };

  return (
    <motion.div
      className={`${styles.menuContainer} ${styles[position]}`}
      drag
      dragMomentum={false}
      dragElastic={0}
    >
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Accessibility Menu"
      >
        ♿
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.menu}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.menuHeader}>
              <h2 className={styles.menuTitle}>Accessibility</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close Menu"
              >
                ×
              </button>
            </div>

            <div className={styles.menuContent}>
              {children}
            </div>

            <button className={styles.resetButton} onClick={handleReset}>
              Reset All Settings
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function AccessibilityMenu({ 
  children, 
  position = 'right',
  storageKey 
}: AccessibilityMenuProps) {
  return (
    <AccessibilityProvider storageKey={storageKey}>
      <AccessibilityMenuContent position={position}>
        {children}
      </AccessibilityMenuContent>
    </AccessibilityProvider>
  );
}
