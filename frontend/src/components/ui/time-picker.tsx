import * as React from "react";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string; // "HH:mm" format (24-hour)
  onChange: (time: string) => void;
  disabled?: boolean;
  placeholder?: string;
  hasError?: boolean;
  className?: string;
  id?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "08:00",
  hasError = false,
  className,
  id,
}) => {
  const [open, setOpen] = React.useState(false);

  // Parse current value
  const parseTime = (val: string) => {
    const parts = (val || "").split(":");
    const h = parts[0] ? parts[0].padStart(2, "0") : "08";
    const m = parts[1] ? parts[1].padStart(2, "0") : "00";
    return { hour: h, minute: m };
  };

  const { hour: selectedHour, minute: selectedMinute } = parseTime(value);

  const hoursContainerRef = React.useRef<HTMLDivElement>(null);
  const minutesContainerRef = React.useRef<HTMLDivElement>(null);

  const hoursList = React.useMemo(
    () => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")),
    [],
  );
  const minutesList = React.useMemo(
    () => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")),
    [],
  );

  // Auto-scroll selected item to center when popover opens
  React.useEffect(() => {
    if (open) {
      const scrollTimer = setTimeout(() => {
        const itemHeight = 36;
        const containerHeight = 160;

        if (hoursContainerRef.current) {
          const hourIndex = parseInt(selectedHour, 10);
          if (!isNaN(hourIndex)) {
            const top = hourIndex * itemHeight - (containerHeight - itemHeight) / 2;
            hoursContainerRef.current.scrollTo({
              top: Math.max(0, top),
              behavior: "smooth",
            });
          }
        }

        if (minutesContainerRef.current) {
          const minuteIndex = parseInt(selectedMinute, 10);
          if (!isNaN(minuteIndex)) {
            const top =
              minuteIndex * itemHeight - (containerHeight - itemHeight) / 2;
            minutesContainerRef.current.scrollTo({
              top: Math.max(0, top),
              behavior: "smooth",
            });
          }
        }
      }, 50);

      return () => clearTimeout(scrollTimer);
    }
  }, [open, selectedHour, selectedMinute]);

  const handleHourClick = (h: string) => {
    onChange(`${h}:${selectedMinute}`);
  };

  const handleMinuteClick = (m: string) => {
    onChange(`${selectedHour}:${m}`);
  };

  const handleNow = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    onChange(`${h}:${m}`);
  };

  const handleClear = () => {
    onChange("00:00");
  };

  const handleOk = () => {
    onChange(`${selectedHour}:${selectedMinute}`);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(raw);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    if (!raw) {
      onChange("08:00");
      return;
    }
    const match = raw.match(/^([0-1]?[0-9]|2[0-3]):?([0-5]?[0-9])?$/);
    if (match) {
      const h = match[1].padStart(2, "0");
      const m = (match[2] || "00").padStart(2, "0");
      onChange(`${h}:${m}`);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("relative w-full", className)}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-xl border bg-background px-3.5 text-xs transition-all cursor-pointer hover:border-border",
              hasError
                ? "border-destructive focus-within:ring-2 focus-within:ring-destructive/30"
                : "border-border/70 focus-within:ring-2 focus-within:ring-ring/40",
              disabled && "opacity-50 pointer-events-none bg-muted/40",
            )}
          >
            <input
              id={id}
              type="text"
              value={value}
              disabled={disabled}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder={placeholder}
              maxLength={5}
              className="w-full bg-transparent font-mono text-xs text-foreground focus:outline-none cursor-pointer placeholder:text-muted-foreground/60"
            />
            <Clock className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
          </div>
        </PopoverTrigger>

        {/* REUI Styled Time Picker Popover */}
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-56 p-0 bg-[#18181b] dark:bg-[#18181b] text-zinc-100 border border-zinc-800 shadow-2xl rounded-2xl overflow-hidden"
        >
          {/* Header: Hour & Minute */}
          <div className="grid grid-cols-2 pt-3 pb-2 text-center text-xs font-medium text-zinc-400 border-b border-zinc-800/80">
            <div>Hour</div>
            <div>Minute</div>
          </div>

          {/* Dual Scroll Columns */}
          <div className="grid grid-cols-2 divide-x divide-zinc-800/80 h-44">
            {/* Hour Column */}
            <div
              ref={hoursContainerRef}
              className="h-full overflow-y-auto px-2 py-1 space-y-1 scrollbar-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {hoursList.map((h) => {
                const isSelected = h === selectedHour;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHourClick(h)}
                    className={cn(
                      "w-full h-8 flex items-center justify-center font-mono text-sm rounded-xl transition-all cursor-pointer",
                      isSelected
                        ? "bg-zinc-100 text-zinc-950 font-bold shadow-xs"
                        : "text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/60 font-medium",
                    )}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            {/* Minute Column */}
            <div
              ref={minutesContainerRef}
              className="h-full overflow-y-auto px-2 py-1 space-y-1 scrollbar-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {minutesList.map((m) => {
                const isSelected = m === selectedMinute;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMinuteClick(m)}
                    className={cn(
                      "w-full h-8 flex items-center justify-center font-mono text-sm rounded-xl transition-all cursor-pointer",
                      isSelected
                        ? "bg-zinc-100 text-zinc-950 font-bold shadow-xs"
                        : "text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/60 font-medium",
                    )}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer: Now, Clear, OK */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-800/80 bg-zinc-900/60">
            <button
              type="button"
              onClick={handleNow}
              className="text-xs font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer select-none"
            >
              Now
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer select-none"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleOk}
              className="text-xs font-bold text-zinc-100 hover:text-white transition-colors cursor-pointer select-none"
            >
              OK
            </button>
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
};

export default TimePicker;
