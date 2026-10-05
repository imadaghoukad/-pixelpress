"use client";

// Locally owned shadcn/ui-style primitives built on Radix (MIT).
import * as React from "react";
import {
  Dialog as DialogPrimitive,
  Tabs as TabsPrimitive,
  Slider as SliderPrimitive,
  Switch as SwitchPrimitive,
  Tooltip as TooltipPrimitive,
  Accordion as AccordionPrimitive,
  Progress as ProgressPrimitive,
  Select as SelectPrimitive,
  Slot,
} from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { en } from "@/lib/i18n";

const buttonVariants = cva("button", {
  variants: {
    variant: {
      default: "button-primary",
      secondary: "button-secondary",
      ghost: "button-ghost",
      outline: "button-outline",
      danger: "button-danger",
    },
    size: { default: "", sm: "button-sm", icon: "button-icon" },
  },
  defaultVariants: { variant: "default", size: "default" },
});
export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("card", className)} {...props} />;
}
export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("badge", className)} {...props} />;
}
export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn("input", className)} {...props} />;
}
export function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root className={cn("tabs", className)} {...props} />;
}
export function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List className={cn("tabs-list", className)} {...props} />
  );
}
export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn("tabs-trigger", className)}
      {...props}
    />
  );
}
export const TabsContent = TabsPrimitive.Content;
export function Slider({
  "aria-label": label,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root className="slider" {...props}>
      <SliderPrimitive.Track className="slider-track">
        <SliderPrimitive.Range className="slider-range" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="slider-thumb" aria-label={label} />
    </SliderPrimitive.Root>
  );
}
export function Switch(
  props: React.ComponentProps<typeof SwitchPrimitive.Root>,
) {
  return (
    <SwitchPrimitive.Root className="switch" {...props}>
      <SwitchPrimitive.Thumb className="switch-thumb" />
    </SwitchPrimitive.Root>
  );
}
export function Select({
  value,
  onValueChange,
  options,
  label,
  id,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  label: string;
  id?: string;
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        className="select-trigger"
        aria-label={label}
        id={id}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon>
          <ChevronDown size={15} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="select-content"
          position="popper"
          sideOffset={5}
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="select-item"
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check size={14} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
export function Progress({ value, label }: { value: number; label: string }) {
  return (
    <ProgressPrimitive.Root
      className="progress"
      value={value}
      aria-label={label}
    >
      <ProgressPrimitive.Indicator
        className="progress-indicator"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
export function Tooltip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className="tooltip" sideOffset={6}>
            {text}
            <TooltipPrimitive.Arrow />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay" />
        <DialogPrimitive.Content
          className={cn("dialog-content", wide && "dialog-wide")}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById("tool-heading")?.focus();
          }}
        >
          <div className="dialog-heading">
            <div>
              <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
              <DialogPrimitive.Description>
                {description}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon" aria-label={en.close}>
                <X size={18} />
              </Button>
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export function Accordion({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <AccordionPrimitive.Root type="single" collapsible className="accordion">
      {items.map((item, i) => (
        <AccordionPrimitive.Item
          value={String(i)}
          key={item.question}
          className="accordion-item"
        >
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="accordion-trigger">
              {item.question}
              <ChevronDown size={16} />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="accordion-content">
            {item.answer}
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
