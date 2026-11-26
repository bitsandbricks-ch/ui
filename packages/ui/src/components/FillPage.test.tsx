import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { DataTable } from './DataTable'
import { FillPage } from './FillPage'

describe('FillPage', () => {
  it('marks the page and keeps its own class and props', () => {
    renderWithApp(<FillPage className="mine" data-testid="page"><p>Hello</p></FillPage>)
    const page = screen.getByTestId('page')
    expect(page).toHaveClass('bnb-fill-page', 'mine')
    expect(page).toHaveTextContent('Hello')
  })

  it('wraps a filling table so it can take the room left', () => {
    const rows = [{ id: 'a' }, { id: 'b' }]
    const { container } = renderWithApp(
      <FillPage>
        <DataTable fill rows={rows} rowKey={(r) => r.id} label="Things" urlState={false}
          columns={[{ id: 'id', header: 'Id', cell: (r) => r.id }]} />
      </FillPage>,
    )
    expect(container.querySelector('.bnb-fill-page > .bnb-dt-fill .bnb-dt-scroll')).not.toBeNull()
    expect(screen.getByRole('table', { name: 'Things' })).toBeInTheDocument()
    // It scrolls on its own, so the keyboard must reach it.
    expect(screen.getByRole('region', { name: 'Things' })).toHaveAttribute('tabindex', '0')
  })

  it('leaves a table without fill as it was', () => {
    const { container } = renderWithApp(
      <DataTable rows={[{ id: 'a' }]} rowKey={(r) => r.id} label="Things" urlState={false}
        columns={[{ id: 'id', header: 'Id', cell: (r) => r.id }]} />,
    )
    expect(container.querySelector('.bnb-dt-fill')).toBeNull()
    expect(container.querySelector('.bnb-dt-scroll')).not.toHaveAttribute('tabindex')
  })
})
