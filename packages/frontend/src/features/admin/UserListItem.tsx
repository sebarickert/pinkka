import { User, UserStar } from 'lucide-react'
import type { FC } from 'react'
import { cn } from '@/lib/utils'
import { DeleteUserDialog } from '@/features/admin/DeleteUserDialog'
import { authClient } from '@/lib/auth-client'
import { FinancerMigrationDialog } from '@/features/admin/FinancerMigrationDialog'

type Props = {
  id: string
  email: string
  name: string
  role?: string
}
export const UserListItem: FC<Props> = ({ id, email, name, role }) => {
  const { data } = authClient.useSession()

  return (
    <div
      className={cn(
        'grid grid-cols-[auto_1fr_auto] items-center gap-4 pr-2',
        'hover:bg-layer',
        'group',
      )}
    >
      <div
        className={cn(
          'size-14 inline-flex items-center justify-center bg-layer',
          data?.user.id !== id && 'group-hover:bg-accent',
          data?.user.id === id && 'bg-blue',
        )}
      >
        {role === 'admin' ? <UserStar /> : <User />}
      </div>
      <div className="grid">
        <span className="truncate font-medium text-sm">{email}</span>
        <span className="text-muted-foreground text-xs">
          <span className="sr-only">User name</span>
          <span>{name}</span>
        </span>
      </div>
      <div className="inline-flex group-hover:*:text-foreground!">
        <FinancerMigrationDialog user={{ id, name, email }} />
        {data?.user.id !== id && <DeleteUserDialog userId={id} />}
      </div>
    </div>
  )
}
