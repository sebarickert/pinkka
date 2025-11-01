import { Fragment } from 'react'
import type { FC } from 'react'
import { Header } from '@/components/Header'
import { Container } from '@/components/Container'

interface Props {
  children: React.ReactNode
}

export const AppShell: FC<Props> = ({ children }) => {
  return (
    <Fragment>
      <Header />
      <Container as="main" className="py-12">
        {children}
      </Container>
    </Fragment>
  )
}
