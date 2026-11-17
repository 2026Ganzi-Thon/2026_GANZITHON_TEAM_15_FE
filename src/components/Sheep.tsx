import type { ReactNode } from 'react'

// The wireframe supplies three wool silhouettes; the five domain stages reuse
// these until the final five-stage illustration set is delivered.
const silhouettes = ['10-7-img7', '10-7-img7', '10-7-img2', '10-7-img3', '10-11-img2']
export function Sheep({ stage = 1, size = 132, added = 0, accessories, stageAssets }: { stage?: number; size?: number; added?: number; accessories?: ReactNode; stageAssets?: [string, string, string, string, string] }) {
  const safeStage = Math.max(1, Math.min(5, Math.trunc(stage) || 1))
  return <span className={`sheep sheep-stage-${safeStage}`} style={{ width: size, height: size * 0.934 }} role="img" aria-label={`${safeStage}단계 양`}>
    <img key={safeStage} className="sheep-body" src={stageAssets?.[safeStage - 1] ?? `/assets/figma/${silhouettes[safeStage - 1]}.svg`} alt="" width={size} height={size * 0.934} />
    {accessories && <span className="sheep-accessories">{accessories}</span>}
    {added > 0 && <span key={`${safeStage}-${added}`} className="sheep-added">+{added}</span>}
  </span>
}
