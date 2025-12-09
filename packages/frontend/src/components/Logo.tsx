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
      <rect x="200" y="350" width="600" height="400" fill="white" />
      <rect x="200" y="250" width="400" height="100" fill="#1064FE" />
    </svg>
  )
}
