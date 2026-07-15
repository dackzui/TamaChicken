import type { CareAction, Needs } from './game'

interface CarePadProps {
  needs: Needs
  onCare: (action: CareAction) => void
  disabled?: boolean
  sick?: boolean
}

const ACTIONS: { id: CareAction; label: string; icon: string }[] = [
  { id: 'feed', label: 'Feed', icon: 'feed' },
  { id: 'bath', label: 'Bath', icon: 'bath' },
  { id: 'play', label: 'Play', icon: 'play' },
  { id: 'pet', label: 'Pet', icon: 'pet' },
  { id: 'sleep', label: 'Sleep', icon: 'sleep' },
  { id: 'meds', label: 'Meds', icon: 'meds' },
]

function barTone(value: number): string {
  if (value < 30) return 'low'
  if (value < 60) return 'mid'
  return 'high'
}

export function CarePad({ needs, onCare, disabled, sick = false }: CarePadProps) {
  return (
    <div className="care">
      <div className="meters" aria-label="Chicken needs">
        {(
          [
            ['Hunger', needs.hunger],
            ['Clean', needs.cleanliness],
            ['Happy', needs.happiness],
            ['Energy', needs.energy],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="meter">
            <span className="meter__label">{label}</span>
            <div className="meter__track">
              <div
                className={`meter__fill meter__fill--${barTone(value)}`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="actions">
        {ACTIONS.map((action) => {
          const isMeds = action.id === 'meds'
          const medsOff = isMeds && !sick
          return (
            <button
              key={action.id}
              type="button"
              className={`action action--${action.id} ${isMeds && sick ? 'action--urgent' : ''}`}
              disabled={disabled || medsOff}
              onClick={() => onCare(action.id)}
            >
              <span className={`action__glyph action__glyph--${action.icon}`} aria-hidden />
              <span className="action__label">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
