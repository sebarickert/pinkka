import type { FC } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

export const Logo: FC<Props> = ({ className }) => {
  return (
    <svg
      width="1000"
      height="1000"
      viewBox="0 0 1000 1000"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <path
        d="M688 352.998L688 647L816 647L816 225L688 352.998Z"
        fill="white"
      />
      <path
        d="M647.999 647L647.999 353L519.999 353L519.999 647L647.999 647Z"
        fill="white"
      />
      <path
        d="M479.999 647.002L479.999 353.002L351.999 353.002L351.999 647.002L479.999 647.002Z"
        fill="white"
      />
      <path
        d="M311.999 647.002L311.999 353L183.999 353L183.999 775L311.999 647.002Z"
        fill="white"
      />
    </svg>
  )
}
