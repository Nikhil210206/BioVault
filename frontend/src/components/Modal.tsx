import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { modalSlide, buttonTap, useMotionSafe } from "@/lib/motionSystem";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

const Modal = ({ isOpen, onClose, title, children, maxWidth = "md" }: ModalProps) => {
  const { shouldReduce } = useMotionSafe();

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduce ? 0.01 : 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              {...(shouldReduce ? { initial: {}, animate: {}, exit: {} } : modalSlide)}
              transition={{ duration: shouldReduce ? 0.01 : 0.3, ease: "easeOut" }}
              className={`relative w-full ${maxWidthClasses[maxWidth]} bg-card rounded-2xl shadow-[var(--shadow-elevated)] pointer-events-auto`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "modal-title" : undefined}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 id="modal-title" className="text-xl font-semibold">
                    {title}
                  </h2>
                  <motion.button
                    {...(shouldReduce ? {} : buttonTap)}
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              )}

              {/* Content */}
              <div className="p-6">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
