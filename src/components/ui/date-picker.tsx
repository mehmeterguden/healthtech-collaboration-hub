"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon, Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  setDate: (date?: Date) => void
  placeholder?: string
  className?: string
  label?: string
  showTime?: boolean
  time?: string
  setTime?: (time: string) => void
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Select date",
  className,
  label = "Date",
  showTime = false,
  time,
  setTime,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <FieldGroup className={cn("w-full flex-row items-end gap-2", className)}>
      <Field className="flex-1">
        {label && <FieldLabel className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">{label}</FieldLabel>}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between font-medium bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all h-11 px-4 rounded-2xl",
                !date && "text-slate-500"
              )}
            >
              <div className="flex items-center gap-3 truncate">
                <CalendarIcon className="h-4 w-4 text-primary opacity-70" />
                {date ? (
                  <span className="text-white">{format(date, "MMMM d, yyyy")}</span>
                ) : (
                  <span>{placeholder}</span>
                )}
              </div>
              <ChevronDownIcon className="h-4 w-4 opacity-30" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 bg-transparent border-none shadow-none mt-2" 
            align="start"
            sideOffset={8}
          >
            <Calendar
              selected={date}
              onSelect={(d) => {
                setDate(d)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </Field>

      {showTime && setTime && (
        <Field className="w-32">
          <FieldLabel className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Time</FieldLabel>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="h-11 bg-white/[0.03] border-white/5 rounded-2xl appearance-none [&::-webkit-calendar-picker-indicator]:hidden focus:ring-primary/20 text-center font-bold text-white tracking-wide"
          />
        </Field>
      )}
    </FieldGroup>
  )
}
