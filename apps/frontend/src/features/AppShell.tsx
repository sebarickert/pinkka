import type { FC } from 'react'
import { Header } from '@/features/Header'
import { Container } from '@/components/Container'
import { MobileNavigation } from '@/features/MobileNavigation'

interface Props {
  children: React.ReactNode
}

export const AppShell: FC<Props> = ({ children }) => {
  return (
    <div className="max-lg:pb-(--gutter-bottom)">
      <Header />
      <MobileNavigation className="lg:hidden" />
      <Container
        as="main"
        className="pt-6 lg:pt-12 pb-safe-offset-12 mt-(--gutter-top)"
      >
        {children}
      </Container>
    </div>
  )
}
