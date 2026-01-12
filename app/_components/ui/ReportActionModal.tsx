"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useReportAction } from "@/app/dashboard/bm/queries/reports/useReportAction";
import { ReportStatus } from "@/app/types/report";
import { ACTION_CONFIG } from "@/lib/modalActionConfig";
import React from "react";
import Button from "./Button";
import Error from "./Error";
import Input from "./Input";
import Spinner from "./Spinner";

type ReportAction = "approve" | "decline";

interface ModalProps {
  action: ReportAction;
  isLoading?: boolean;
  status?: ReportStatus;
  hideTrigger?: boolean;
}
const schema = z.object({
  remarks: z.string().min(1, "Remarks are required"),
});

type RemarkData = z.infer<typeof schema>;

export function ReportActionModal({
  action,
  isLoading,
  status,
  hideTrigger,
}: ModalProps) {
  const [open, setOpen] = React.useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<RemarkData>({
    resolver: zodResolver(schema),
  });

  const { reportAction, isPending: isSubmitting } = useReportAction(
    action,
    setError,
    reset,
    () => setOpen(false)
  );

  const { title, description, triggerText, submitText, variant } =
    ACTION_CONFIG[action];

  return (
    <Dialog
      open={open}
      onOpenChange={(open:any) => {
        setOpen(open);
        if (!open) reset();
      }}
    >
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button
            type="button"
            fullWidth
            variant={variant}
            disabled={isLoading}
          >
            {triggerText}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e:any) => isSubmitting && e.preventDefault()}
      >
        <form onSubmit={handleSubmit((data) => reportAction(data))}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input
                id="remarks"
                autoFocus
                placeholder="Enter your remarks"
                {...register("remarks")}
              />
              {errors.remarks && <Error error={errors.remarks.message} />}
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <DialogClose asChild>
              <Button type="button" fullWidth variant="secondary">
                Cancel
              </Button>
            </DialogClose>

            <Button
              fullWidth={true}
              variant={variant}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? <Spinner /> : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
