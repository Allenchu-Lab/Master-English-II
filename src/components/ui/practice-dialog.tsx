"use client";

import { Modal } from "@heroui/react/modal";
import { forwardRef, useImperativeHandle, useState, type ReactNode } from "react";

export interface PracticeDialogHandle {
  showModal(): void;
  close(): void;
}

// Preserve the existing confirmation handlers while HeroUI owns focus and dismissal.
export const PracticeDialog = forwardRef<PracticeDialogHandle, {
  children: ReactNode;
  className?: string;
  "aria-labelledby": string;
  "aria-describedby"?: string;
}>(function PracticeDialog({ children, className = "", ...labels }, ref) {
  const [open, setOpen] = useState(false);
  useImperativeHandle(ref, () => ({ showModal: () => setOpen(true), close: () => setOpen(false) }), []);
  return <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
    <Modal.Container size="sm" placement="center">
      <Modal.Dialog {...labels} className={`practice-confirmation ${className}`}>{children}</Modal.Dialog>
    </Modal.Container>
  </Modal.Backdrop>;
});

// Use HeroUI's heading slot for dialog naming and consistent title semantics.
export const PracticeDialogTitle = Modal.Heading;
