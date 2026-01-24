// import { ReactNode, RefObject } from "react";

// interface GlobalModalProps {
//   children: ReactNode;
//   modalRef: RefObject<HTMLDialogElement | null>;
//   title: string;
//   id: string;
//   close: () => void;
// }

// function GlobalModal({ children, modalRef, title, id, close }: GlobalModalProps) {
//   return (
//     <dialog
//       ref={modalRef}
//       id={id}
//       onCancel={close}
//       className="modal"
//       aria-labelledby={`${id}-title`}
//     >
//       <div className="max-w-lg bg-white modal-box ">
//         <h3 className="text-lg text-center text-neutral-700 font-semibold">{title}</h3>
        
//         {children}
//       </div>
//     </dialog>
//   );
// }

// export default GlobalModal;

"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GlobalModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function GlobalModal({
  open,
  onClose,
  title,
  children,
}: GlobalModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
}

