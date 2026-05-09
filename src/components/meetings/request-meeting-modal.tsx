"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  Plus, 
  Trash2, 
  Send,
  CalendarDays,
  ShieldCheck,
  Calendar as CalendarIcon
} from "lucide-react";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { meetingsApi } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

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
  onSuccess 
}: RequestMeetingModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Hi! I'd like to discuss a potential collaboration on your project.");
  const [slots, setSlots] = useState<Slot[]>([
    { id: "1", date: "", startTime: "10:00", endTime: "11:00" }
  ]);
  const [ndaAccepted, setNdaAccepted] = useState(false);

  const addSlot = () => {
    if (slots.length < 3) {
      setSlots([...slots, { 
        id: Math.random().toString(36).substr(2, 9), 
        date: "", 
        startTime: "10:00", 
        endTime: "11:00" 
      }]);
    }
  };

  const removeSlot = (id: string) => {
    if (slots.length > 1) {
      setSlots(slots.filter(s => s.id !== id));
    }
  };

  const updateSlot = (id: string, field: keyof Slot, value: string) => {
    setSlots(slots.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async () => {
    if (!ndaAccepted) {
      toast.error("Please accept the confidentiality agreement");
      return;
    }

    const invalidSlot = slots.find(s => !s.date || !s.startTime || !s.endTime);
    if (invalidSlot) {
      toast.error("Please fill in all slot details");
      return;
    }

    setLoading(true);
    try {
      await meetingsApi.create({
        postId,
        receiverId,
        message,
        proposedSlots: slots.map(s => ({
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
        ndaAccepted: true,
      });
      toast.success("Meeting request sent!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#0B0F1A] border-white/5 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="bg-gradient-to-br from-primary/10 via-transparent to-transparent p-8">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white tracking-tight">Request a Meeting</DialogTitle>
                <p className="text-slate-400 text-sm">Propose a few time slots for a brief introductory call.</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Introduction Message</Label>
              </div>
              <Textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Briefly explain why you're interested..."
                className="min-h-[100px] bg-white/[0.03] border-white/5 rounded-2xl focus:ring-primary/20 focus:border-primary/30 transition-all text-white placeholder:text-slate-600 p-4"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Proposed Time Slots</Label>
                </div>
                <Button 
                  onClick={addSlot} 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3 rounded-xl text-primary hover:bg-primary/10 font-bold text-[10px] gap-1.5"
                  disabled={slots.length >= 3}
                >
                  <Plus className="h-3.5 w-3.5" />
                  ADD SLOT
                </Button>
              </div>

              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {slots.map((slot, index) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative bg-white/[0.02] border border-white/5 rounded-[2rem] p-4 hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Slot Number Indicator */}
                        <div className="hidden md:flex flex-col items-center justify-center w-14 bg-white/5 rounded-2xl border border-white/5">
                          <span className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Slot</span>
                          <span className="text-xl font-black text-white leading-none">{index + 1}</span>
                        </div>

                        <div className="flex-1 space-y-4">
                          <DatePicker
                            date={slot.date ? new Date(slot.date) : undefined}
                            setDate={(d) => updateSlot(slot.id, "date", d ? format(d, "yyyy-MM-dd") : "")}
                            placeholder="Pick a date"
                            label="Suggested Date"
                          />
                          
                          <FieldGroup className="flex-row gap-4">
                            <Field className="flex-1">
                              <FieldLabel className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Clock className="h-3 w-3" /> Start Time
                              </FieldLabel>
                              <Input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateSlot(slot.id, "startTime", e.target.value)}
                                className="h-11 bg-white/[0.03] border-white/5 rounded-xl text-center font-bold text-white focus:ring-primary/20 appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                              />
                            </Field>
                            <Field className="flex-1">
                              <FieldLabel className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Clock className="h-3 w-3" /> End Time
                              </FieldLabel>
                              <Input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateSlot(slot.id, "endTime", e.target.value)}
                                className="h-11 bg-white/[0.03] border-white/5 rounded-xl text-center font-bold text-white focus:ring-primary/20 appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                              />
                            </Field>
                          </FieldGroup>
                        </div>

                        {slots.length > 1 && (
                          <div className="flex md:flex-col items-center justify-center gap-2">
                            <button
                              onClick={() => removeSlot(slot.id)}
                              className="h-10 w-10 flex items-center justify-center text-slate-600 hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all border border-white/5 group-hover:border-destructive/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="p-5 bg-primary/5 border border-primary/10 rounded-3xl flex items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Accept NDA</h4>
                  <p className="text-[11px] text-slate-400">I agree to maintain confidentiality regarding project details.</p>
                </div>
              </div>
              <Switch 
                checked={ndaAccepted}
                onCheckedChange={setNdaAccepted}
                className="data-[state=checked]:bg-primary"
              />
            </motion.div>
          </div>
        </div>

        <div className="p-8 bg-black/20 border-t border-white/5 flex items-center justify-end gap-4">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="rounded-2xl px-6 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl px-8 h-12 gap-2 shadow-lg shadow-primary/20 transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                SENDING...
              </span>
            ) : (
              <>
                <Send className="h-4 w-4" />
                SEND MEETING REQUEST
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
