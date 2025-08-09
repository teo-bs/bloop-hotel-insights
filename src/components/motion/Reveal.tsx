import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  offset?: number; // px from bottom of viewport to trigger
}

export default function Reveal({
  as: Comp = "div",
  className,
  offset = 80,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: `0px 0px -${offset}px 0px` }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [offset]);

  return (
    <Comp
      ref={ref as any}
      className={cn(
        "transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}
