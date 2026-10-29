import { ItemGroup } from "@/components/ui/item"

import { UserItem } from "./user-item"
import { RouterOutputs } from "@/trpc/routers"

export function UserList({
  users,
}: {
  users: RouterOutputs["user"]["list"]["users"]
}) {
  return (
    <ItemGroup>
      {users.map((user) => {
        return <UserItem key={user.id} user={user} />
      })}
    </ItemGroup>
  )
}
