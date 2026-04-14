import { useXP } from '../../context/XPContext'

export default function XPPopupLayer() {
  const { popups } = useXP()

  return (
    <>
      {popups.map(popup => (
        <div
          key={popup.id}
          className="xp-popup select-none"
          style={{
            left: popup.x,
            top: popup.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {popup.amount > 0 ? `+${popup.amount} XP` : `${popup.amount} XP`}
        </div>
      ))}
    </>
  )
}
