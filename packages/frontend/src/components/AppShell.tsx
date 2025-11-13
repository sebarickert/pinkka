import type { FC } from 'react'
import { Header } from '@/components/Header'
import { Container } from '@/components/Container'
import { MobileNavigation } from '@/components/MobileNavigation'

interface Props {
  children: React.ReactNode
}

export const AppShell: FC<Props> = ({ children }) => {
  return (
    <div className="max-lg:pb-(--gutter-bottom)">
      <Header />
      <MobileNavigation className="lg:hidden" />
      <Container as="main" className="py-12 mt-(--gutter-top)">
        {children}
      </Container>
    </div>
  )
}
