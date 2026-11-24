import type { Meta, StoryObj } from '@storybook/react-vite'
import { tokens } from './index'

// The tokens as they look in the current theme (switch Theme and Accent in the toolbar).
const swatch = (name: string) => (
  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 220 }}>
    <span style={{ width: 36, height: 36, borderRadius: 8, background: `var(--bnb-${name})`, border: '1px solid var(--bnb-line)' }} />
    <code style={{ fontSize: 13 }}>--bnb-{name}</code>
  </div>
)

function Tokens() {
  return (
    <div style={{ display: 'grid', gap: 28, color: 'var(--bnb-fg)' }}>
      <section>
        <h2>Neutrals</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>{Object.keys(tokens.neutrals.light).map(swatch)}</div>
      </section>
      <section>
        <h2>Accent</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>{['accent', 'accent-hover', 'accent-soft', 'on-accent'].map(swatch)}</div>
      </section>
      <section>
        <h2>Status (never themed)</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>{Object.keys(tokens.status.light).flatMap((s) => [swatch(s), swatch(`${s}-soft`)])}</div>
      </section>
      <section>
        <h2>Radii</h2>
        <div style={{ display: 'flex', gap: 16 }}>
          {Object.entries(tokens.radius).map(([k, v]) => (
            <div key={k} style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 48, borderRadius: v, background: 'var(--bnb-surface)', border: '1px solid var(--bnb-line)' }} />
              <code style={{ fontSize: 12 }}>{k} {v}</code>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2>Type</h2>
        {Object.keys(tokens.fontSize).map((k) => (
          <div key={k} style={{ fontSize: `var(--bnb-fs-${k})` }}>{k}: The lantern lights the rack</div>
        ))}
        <div style={{ fontFamily: 'var(--bnb-font-mono)', fontSize: 'var(--bnb-fs-sm)' }}>mono: 198.51.100.10 sw-12 ge-0/0/1</div>
      </section>
      <section>
        <h2>Dot grid</h2>
        <div className="bnb-dot-grid" style={{ height: 120, borderRadius: 10, border: '1px solid var(--bnb-line)' }} />
      </section>
    </div>
  )
}

const meta: Meta = { title: 'Tokens', component: Tokens }
export default meta
export const All: StoryObj = {}
