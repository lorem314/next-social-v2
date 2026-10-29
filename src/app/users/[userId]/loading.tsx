import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemHeader,
  ItemMedia,
  ItemTitle,
  ItemGroup,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <Item>
          <ItemMedia>
            <Skeleton className="size-12 rounded-full" />
          </ItemMedia>
          <ItemContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </ItemContent>
        </Item>
      </CardHeader>
    </Card>
  )
}
