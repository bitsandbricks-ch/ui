import { SimpleGrid } from '@mantine/core'
import type { ReactNode } from 'react'

/** Cards side by side: one column on phones, two on small screens, `columns` from medium up.
 *  From Hubra. */
export function CardGrid({ children, columns = 3 }: { children: ReactNode; columns?: number }) {
  return (
    <SimpleGrid cols={{ base: 1, xs: Math.min(2, columns), md: columns }} spacing="md">
      {children}
    </SimpleGrid>
  )
}
