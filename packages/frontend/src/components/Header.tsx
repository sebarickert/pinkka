import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { UserMenu } from '@/components/UserMenu'

export const Header = () => {
  return (
    <header>
      <Container className="flex justify-end items-center gap-12 h-14 px-0">
        {/* <Button type="button">Add Transaction</Button> */}
        <UserMenu />
      </Container>
    </header>
  )
}
