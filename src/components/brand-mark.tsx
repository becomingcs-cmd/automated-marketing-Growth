export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-mark" aria-label="GrowthOS">
      <span className="brand-symbol" aria-hidden="true"><i /><i /><i /></span>
      {!compact && <span>Growth<span>OS</span></span>}
    </div>
  );
}

