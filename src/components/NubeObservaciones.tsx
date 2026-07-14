'use client';

import { useState, useEffect } from 'react';

type Observacion = { numero: string; notas_empleada: string };
type Reserva = { id: number; fecha: string; notas: string };

export default function NubeObservaciones() {
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const resObs = await fetch('/api/recepcion/observaciones');
        if (resObs.ok) setObservaciones(await resObs.json());
      } catch (e) {}

      try {
        const resRes = await fetch('/api/recepcion/reservas');
        if (resRes.ok) setReservas(await resRes.json());
      } catch (e) {}
    };

    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, []);

  const total = observaciones.length + reservas.length;
  if (total === 0) return null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
      }}
    >
      {/* Panel expandible — solo visible al hacer hover */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(12px)',
        padding: hovered ? '20px' : '0px',
        borderRadius: '16px',
        boxShadow: hovered ? '0 10px 30px rgba(0,0,0,0.15)' : 'none',
        width: '320px',
        maxHeight: hovered ? '480px' : '0px',
        overflowY: 'auto',
        overflowX: 'hidden',
        border: hovered ? '1px solid #E2E8F0' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'max-height 0.35s ease, padding 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease',
        opacity: hovered ? 1 : 0,
        pointerEvents: hovered ? 'auto' : 'none',
      }}>

        {/* Sección Reservas */}
        {reservas.length > 0 && (
          <div>
            <h3 style={{ fontSize: '14px', color: '#1E293B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6', boxShadow: '0 0 8px #93C5FD', flexShrink: 0 }}></span>
              Notificaciones de Reservas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {reservas.map((res) => (
                <div key={res.id} style={{ background: '#EFF6FF', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid #3B82F6' }}>
                  <strong style={{ fontSize: '12px', color: '#1E40AF', display: 'block', marginBottom: '3px' }}>Fecha: {res.fecha}</strong>
                  <p style={{ fontSize: '11px', color: '#1D4ED8', margin: 0, wordBreak: 'break-word' }}>{res.notas}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sección Observaciones Limpieza */}
        {observaciones.length > 0 && (
          <div>
            <h3 style={{ fontSize: '14px', color: '#1E293B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 8px #FCD34D', flexShrink: 0 }}></span>
              Observaciones de Limpieza
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {observaciones.map((obs, idx) => (
                <div key={idx} style={{ background: '#FFF7ED', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid #F59E0B' }}>
                  <strong style={{ fontSize: '12px', color: '#92400E', display: 'block', marginBottom: '3px' }}>Habitación {obs.numero}</strong>
                  <p style={{ fontSize: '11px', color: '#B45309', margin: 0, fontStyle: 'italic', wordBreak: 'break-word' }}>"{obs.notas_empleada}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botón flotante — siempre visible */}
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
        boxShadow: '0 4px 16px rgba(99,102,241,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
        position: 'relative',
        flexShrink: 0,
      }}>
        {/* Icono campana */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 17H9V18.5C9 19.88 10.12 21 11.5 21H12.5C13.88 21 15 19.88 15 18.5V17Z" fill="white"/>
          <path d="M12 3C12 3 8 5 8 11V15L6 17H18L16 15V11C16 5 12 3 12 3Z" fill="white" opacity="0.9"/>
          <circle cx="12" cy="4" r="1.5" fill="white"/>
        </svg>

        {/* Badge con el número de notificaciones */}
        <div style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          background: '#EF4444',
          color: 'white',
          fontSize: '11px',
          fontWeight: 700,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}>
          {total}
        </div>
      </div>
    </div>
  );
}
