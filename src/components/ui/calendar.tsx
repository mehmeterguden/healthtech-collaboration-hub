"use client"

import * as React from "react"
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  className?: string
}

export function Calendar({ selected, onSelect, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date())

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  return (
    <div className={cn("w-full max-w-[320px] p-4 bg-[#111827] border border-white/10 rounded-3xl shadow-2xl select-none", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => {
          const isSelected = selected && isSameDay(day, selected)
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isCurrentDay = isToday(day)

          return (
            <button
              key={idx}
              onClick={() => onSelect?.(day)}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-xl text-sm transition-all relative group",
                !isCurrentMonth && "text-slate-700 opacity-30",
                isCurrentMonth && !isSelected && "text-slate-300 hover:bg-white/10 hover:text-white",
                isSelected && "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 scale-110 z-10",
                isCurrentDay && !isSelected && "text-primary border border-primary/20 bg-primary/5"
              )}
            >
              {format(day, "d")}
              {isCurrentDay && !isSelected && (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
