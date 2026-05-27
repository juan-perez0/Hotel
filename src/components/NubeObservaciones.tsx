'use client';

import { useState, useEffect } from 'react';

type Observacion = { numero: string; notas_empleada: string };

export default function NubeObservaciones() {
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);

  useEffect(() => {
    const fetchObs = async () => {
      try {
        const res = await fetch('/api/recepcion/observaciones');
        if (res.ok) setObservaciones(await res.json());
      } catch(e) {}
    };
    fetchObs();
    const interval = setInterval(fetchObs, 15000);
    return () => clearInterval(interval);
  }, []);

  if (observaciones.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '30px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '20px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      width: '320px',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 50,
      border: '1px solid #E2E8F0'
    }}>
      <h3 style={{ fontSize: '15px', color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 8px #FCD34D' }}></span>
        Observaciones de Limpieza
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {observaciones.map((obs, idx) => (
          <div key={idx} style={{ background: '#FFF7ED', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #F59E0B' }}>
            <strong style={{ fontSize: '13px', color: '#92400E', display: 'block', marginBottom: '4px' }}>Habitación {obs.numero}</strong>
            <p style={{ fontSize: '12px', color: '#B45309', margin: 0, fontStyle: 'italic', wordBreak: 'break-word' }}>"{obs.notas_empleada}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}
