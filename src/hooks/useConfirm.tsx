import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { useState } from "react";

// 1. 定义 Hook(特殊技巧)
export const useConfirm = (
  title: string,
  message: string
): [() => Promise<boolean>, React.FC] => {
  const [promise, setPromise] = useState<{resolve: (value: boolean) => void  } | null>(null);

  const confirm = () =>new Promise<boolean>((resolve) => {
    setPromise({ resolve });
  });

  const handleClose = () => {
    setPromise(null);
  };

  const ConfirmDialog: React.FC = () => (
    <Dialog open={promise !== null} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-end mt-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              promise?.resolve(false);
              handleClose();
            }}
          >
            Cancel
          </Button>
          <Button
            className="cursor-pointer"
            onClick={() => {
              promise?.resolve(true);
              handleClose();
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [confirm, ConfirmDialog];
};
