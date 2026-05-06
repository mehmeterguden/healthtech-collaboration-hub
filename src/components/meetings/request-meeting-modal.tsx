"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Send,
  CalendarDays
} from "lucide-react";
import { format } from "date-fns";
import { meetingsApi } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface RequestMeetingModalProps {
  postId: string;
  receiverId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export function RequestMeetingModal({
  postId,
  receiverId,
  open,
  onOpenChange,
  onSuccess,
}: RequestMeetingModalProps) {
  const [message, setMessage] = useState("");
  const [slots, setSlots] = useState<Slot[]>([
    { id: "1", date: "", startTime: "10:00", endTime: "11:00" }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addSlot = () => {
    if (slots.length >= 3) {
      toast.error("You can suggest up to 3 time slots.");
      return;
    }
    setSlots([
      ...slots,
      { 
        id: Math.random().toString(36).substr(2, 9), 
        date: "", 
        startTime: "10:00", 
        endTime: "11:00" 
      }
    ]);
  };

  const removeSlot = (id: string) => {
    if (slots.length <= 1) return;
    setSlots(slots.filter(s => s.id !== id));
  };

  const updateSlot = (id: string, field: keyof Slot, value: string) => {
    setSlots(slots.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please add a message to your request.");
      return;
    }

    const invalidSlots = slots.some(s => !s.date || !s.startTime || !s.endTime);
    if (invalidSlots) {
      toast.error("Please fill in all date and time fields.");
      return;
    }

    setSubmitting(true);
    try {
      await meetingsApi.create({
        postId,
        receiverId,
        message,
        proposedSlots: slots.map(({ date, startTime, endTime }) => ({
          date,
          startTime,
          endTime,
        })),
      });
      toast.success("Meeting request sent successfully!");
      onOpenChange(false);
      setMessage("");
      setSlots([{ id: "1", date: "", startTime: "10:00", endTime: "11:00" }]);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Failed to send meeting request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 rounded-2xl border-border bg-card">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <CalendarDays className="h-4 w-4" />
            </div>
            Request a Meeting
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Propose a few time slots. The other person will choose one to confirm.
          </p>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Personal Message
            </Label>
            <Textarea
              id="message"
              placeholder="Hi! I'd like to discuss the project details with you..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-20 bg-accent/30 border-border focus:ring-1 ring-primary/20 rounded-xl resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Proposed Time Slots
              </Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={addSlot}
                className="h-7 text-[10px] font-bold text-primary hover:bg-primary/5 gap-1 rounded-full"
                disabled={slots.length >= 3}
              >
                <Plus className="h-3 w-3" />
                ADD SLOT
              </Button>
            </div>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {slots.map((slot, index) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="relative group p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-primary/40 transition-all duration-300"
                  >
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-colors">
                          <CalendarIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <Input
                            type="date"
                            value={slot.date}
                            onChange={(e) => updateSlot(slot.id, "date", e.target.value)}
                            className="h-10 bg-slate-950/50 border-white/10 rounded-xl text-xs focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-colors">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateSlot(slot.id, "startTime", e.target.value)}
                            className="h-10 bg-slate-950/50 border-white/10 rounded-xl text-xs focus:ring-primary/20"
                          />
                          <span className="text-muted-foreground text-xs">—</span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateSlot(slot.id, "endTime", e.target.value)}
                            className="h-10 bg-slate-950/50 border-white/10 rounded-xl text-xs focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>

                    {slots.length > 1 && (
                      <button
                        onClick={() => removeSlot(slot.id)}
                        className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-accent/10 border-t border-border mt-2">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="rounded-xl font-semibold text-xs"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="rounded-xl px-6 font-bold text-xs gap-2 shadow-lg shadow-primary/20 glow"
          >
            {submitting ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Send Meeting Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
