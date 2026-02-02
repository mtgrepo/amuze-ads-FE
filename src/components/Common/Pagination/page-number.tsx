"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const pageSizes = [
  { value: "all", label: "All" },
  { value: "5", label: "5" },
  { value: "10", label: "10" },
  { value: "20", label: "20" },
];

type PageSizeProps = {
  pageSize: number | "all";
  totalRows: number;
  onChange: (size: number | "all") => void;
};

export function PageSizeComponent({ pageSize, onChange }: PageSizeProps) {
  const [open, setOpen] = React.useState(false);

  const selectedValue = pageSize === "all" ? "all" : String(pageSize);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-fit p-1">
          {pageSizes.find((p) => p.value === selectedValue)?.label ?? "All"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[140px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {pageSizes.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => {
                    onChange(item.value === "all" ? "all" : Number(item.value));
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedValue === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
