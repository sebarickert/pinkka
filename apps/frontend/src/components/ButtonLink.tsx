import { forwardRef } from 'react'
import { createLink } from '@tanstack/react-router'
import type { LinkComponent } from '@tanstack/react-router'
import type { AnchorHTMLAttributes } from 'react'
import type { BaseButtonProps } from '@/components/Button'
import { getButtonClasses } from '@/components/Button'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & BaseButtonProps

const BaseButtonLink = forwardRef<HTMLAnchorElement, Props>((props, ref) => {
  const {
    size = 'default',
    accentColor = 'primary',
    className,
    ...rest
  } = props

  const classes = getButtonClasses({ size, accentColor, className })

  return <a ref={ref} {...rest} className={classes} />
})

const CreatedLinkComponent = createLink(BaseButtonLink)

export const ButtonLink: LinkComponent<typeof BaseButtonLink> = (props) => {
  return <CreatedLinkComponent preload={'intent'} {...props} />
}
