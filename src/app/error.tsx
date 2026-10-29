"use client"

// import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Error({
  error,
  // reset,
}: {
  error: Error & { digest?: string }
  // reset: () => void
}) {
  // React.useEffect(() => {
  //   console.error(error)
  // }, [error])

  return (
    <Card className="mx-auto max-w-md text-red-500">
      <CardHeader>
        <CardTitle>出错了</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center">{error.message}</p>
      </CardContent>
      {/* <CardFooter>
        <Button onClick={() => reset()}>再试一次</Button>
      </CardFooter> */}
    </Card>
  )
}
