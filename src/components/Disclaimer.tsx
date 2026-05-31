import React from 'react';

interface Props {
  type: 'critical' | 'web' | false;
}

const MESSAGES = {
  critical: 'For informational purposes only. Consult a qualified professional before making decisions.',
  web: 'Web sources may be outdated or inaccurate. Verify from authoritative sources.',
};

export default function Disclaimer({ type }: Props) {
  if (!type) return null;
  return (
    <div style={{
      fontSize: '12px',
      color: type === 'critical' ? '#f59e0b' : 'rgba(255,255,255,0.45)',
      marginTop: '10px',
      padding: '8px 12px',
      borderRadius: '8px',
      background: type === 'critical' ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${type === 'critical' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)'}`,
      lineHeight: 1.5,
    }}>
      {MESSAGES[type]}
    </div>
  );
}

