import type { FC } from 'react'
import { Header } from '@/components/Header'
import { Container } from '@/components/Container'
import { Navigation } from '@/components/Navigation'

interface Props {
  children: React.ReactNode
}

export const AppShell: FC<Props> = ({ children }) => {
  return (
    <div className="max-lg:pb-(--gutter-bottom)">
      <Header />
      <Navigation />
      <Container as="main" className="py-12">
        {children}
      </Container>
    </div>
  )
}
