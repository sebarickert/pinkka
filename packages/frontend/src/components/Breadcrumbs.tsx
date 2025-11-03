import { Link, isMatch, useMatches } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react/jsx-runtime'
import { cn } from '@/lib/utils'

export const Breadcrumbs = () => {
  const matches = useMatches()

  const crumbs = [
    {
      pathname: '/app/home',
      loaderData: { crumb: 'Home' },
    },
    ...matches.filter((match) => isMatch(match, 'loaderData.crumb')),
  ]

  return (
    <nav aria-label="Breadcrumb" data-slot="breadcrumbs">
      <ol
        className={cn(
          'flex flex-wrap items-center gap-1.5 wrap-break-word text-sm sm:gap-2.5',
        )}
      >
        {crumbs.map((match, index) => (
          <Fragment key={match.pathname}>
            <li className="inline-flex items-center gap-1.5">
              {index === crumbs.length - 1 ? (
                <span aria-current="page" role="link" aria-disabled="true">
                  {match.loaderData!.crumb}
                </span>
              ) : (
                <Link
                  to={match.pathname}
                  activeOptions={{ exact: true }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {match.loaderData!.crumb}
                </Link>
              )}
            </li>
            {index < crumbs.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}

const BreadcrumbSeparator = () => {
  return (
    <li role="presentation" aria-hidden="true" className="[&>svg]:size-3.5">
      <ChevronRight />
    </li>
  )
}
