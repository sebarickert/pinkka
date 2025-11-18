import { Link, useNavigate } from '@tanstack/react-router'
import { TextAlignJustify } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const UserMenu = () => {
  const navigate = useNavigate()
  const { data } = authClient.useSession()
  const isAdmin = data?.user.role === 'admin'

  const handleLogout = async () => {
    await authClient.signOut()
    navigate({ to: '/' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          accentColor="ghost"
          size="large"
          className="text-foreground! focus-visible:ring-inset"
          aria-label="Open"
        >
          <TextAlignJustify />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <Link to="/app/categories">
            <DropdownMenuItem>Categories</DropdownMenuItem>
          </Link>
          {isAdmin && (
            <Link to="/app/admin">
              <DropdownMenuItem>Admin</DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuGroup>
        <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
