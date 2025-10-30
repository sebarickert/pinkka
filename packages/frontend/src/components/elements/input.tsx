import type { FC, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  children: string;
};

export const Input: FC<Props> = ({ className, children, ...rest }) => {
  return (
    <div className={cn(className, "grid space-y-3")}>
      <label className="leading-none" htmlFor={rest.id}>
        {children}
      </label>
      <input
        {...rest}
        className="theme-field block w-full py-2 px-4 h-14 text-base/7"
      />
    </div>
  );
};
