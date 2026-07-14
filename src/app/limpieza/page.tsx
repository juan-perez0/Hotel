'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BotonRetroceso from '@/components/BotonRetroceso';

type Habitacion = {
  id: number;
  numero: string;
  piso: number;
  estado: string;
  notas_empleada: string | null;
};

export default function LimpiezaDashboard() {
  const router = useRouter();
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [estadoSelect, setEstadoSelect] = useState('LIMPIEZA');
  const [notas, setNotas] = useState('');

  const fetchHabitaciones = async () => {
    const res = await fetch('/api/limpieza/habitaciones');
    if (res.ok) setHabitaciones(await res.json());
  };

  useEffect(() => {
    fetchHabitaciones();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return setError('Selecciona una habitación para actualizar.');
    
    setLoading(true);
    setError('');

    const res = await fetch('/api/limpieza/habitaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedId, estado: estadoSelect, notas_empleada: notas }),
    });

    if (res.ok) {
      setSelectedId(null);
      setNotas('');
      fetchHabitaciones();
    } else {
      const data = await res.json();
      setError(data.error || 'Error al actualizar');
    }
    setLoading(false);
  };

  const seleccionar = (h: Habitacion) => {
    setSelectedId(h.id);
    setEstadoSelect(h.estado);
    setNotas(h.notas_empleada || '');
  };

  const pisosUnicos = Array.from(new Set(habitaciones.map(h => h.piso))).sort((a, b) => a - b);

  // Paleta de colores unificada para todos los estados
  const estadoPaleta: Record<string, { bg: string; color: string; label: string }> = {
    DISPONIBLE:        { bg: '#ECFDF5', color: '#047857', label: 'Disponible' },
    OCUPADA:           { bg: '#FEF2F2', color: '#B91C1C', label: 'Ocupada' },
    REQUIERE_LIMPIEZA: { bg: '#FFF7ED', color: '#C2410C', label: 'Requiere Limpieza' },
    LIMPIEZA:          { bg: '#EFF6FF', color: '#1D4ED8', label: 'En Limpieza' },
    MANTENIMIENTO:     { bg: '#F1F5F9', color: '#334155', label: 'Mantenimiento' },
    RESERVADA:         { bg: '#F3E8FF', color: '#7C3AED', label: 'Reservada' },
  };

  return (
    <div className="premium-container" style={{ alignItems: 'flex-start', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '1600px' }}>
        <BotonRetroceso />
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', color: '#1E293B', marginBottom: '8px' }}>Módulo de Limpieza y Mantenimiento</h1>
            <p style={{ color: '#64748B' }}>Actualiza el estado físico de las habitaciones ordenadas por piso.</p>
          </div>
          <div>
            <button onClick={handleLogout} className="premium-btn" style={{ background: '#EF4444', margin: 0, padding: '10px 20px', width: 'auto' }}>
              Cerrar Sesión
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2.5fr', gap: '30px' }}>
          
          {/* Panel de actualización */}
          <div className="premium-card" style={{ height: 'fit-content' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Actualizar Estado</h2>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Habitación Seleccionada</label>
                <div style={{
                  padding: '12px 16px', background: '#F8FAFC', borderRadius: '8px',
                  border: '1px solid #E2E8F0', fontWeight: 600,
                  color: selectedId ? '#1E293B' : '#94A3B8'
                }}>
                  {selectedId
                    ? `Hab. #${habitaciones.find(h => h.id === selectedId)?.numero}`
                    : 'Ninguna seleccionada'}
                </div>
              </div>

              {selectedId && (
                <>
                  <div className="form-group">
                    <label>Nuevo Estado Físico</label>
                    <select className="premium-input" value={estadoSelect} onChange={e => setEstadoSelect(e.target.value)}>
                      <option value="DISPONIBLE">Disponible — Limpia</option>
                      <option value="OCUPADA">Ocupada por Cliente (No Entrar)</option>
                      <option value="REQUIERE_LIMPIEZA">Requiere Limpieza (Check-Out)</option>
                      <option value="LIMPIEZA">Aseo en Progreso</option>
                      <option value="RESERVADA">Reservada (Pre-Reserva)</option>
                      <option value="MANTENIMIENTO">En Mantenimiento General</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Observaciones (Opcional)</label>
                    <textarea
                      className="premium-input"
                      rows={4}
                      value={notas}
                      onChange={e => setNotas(e.target.value)}
                      placeholder="Ej: Faltan toallas, jabones agotados..."
                      style={{ resize: 'none', fontFamily: 'inherit' }}
                    />
                  </div>

                  <button type="submit" className="premium-btn" disabled={loading} style={{ background: '#6366F1' }}>
                    {loading ? 'Guardando...' : 'Confirmar Cambios'}
                  </button>
                </>
              )}
            </form>
          </div>

          {/* Cuadrícula operativa */}
          <div className="premium-card" style={{ padding: '30px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Cuadrícula Operativa</h2>
            {habitaciones.length === 0 && (
              <p style={{ color: '#64748B' }}>Cargando datos o no hay habitaciones configuradas.</p>
            )}
            
            {pisosUnicos.map(piso => (
              <div key={piso} style={{ marginBottom: '30px' }}>
                <h3 style={{
                  fontSize: '18px', color: '#334155',
                  borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px'
                }}>
                  Planta / Piso {piso}
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
                  {habitaciones.filter(h => h.piso === piso).map(h => {
                    const pal = estadoPaleta[h.estado] ?? { bg: '#F1F5F9', color: '#334155', label: h.estado };
                    return (
                      <div
                        key={h.id}
                        onClick={() => seleccionar(h)}
                        style={{
                          cursor: 'pointer',
                          padding: '20px 10px',
                          textAlign: 'center',
                          borderRadius: '12px',
                          background: pal.bg,
                          color: pal.color,
                          border: `2px solid ${selectedId === h.id ? '#6366F1' : 'transparent'}`,
                          boxShadow: selectedId === h.id
                            ? '0 0 0 3px rgba(99, 102, 241, 0.2)'
                            : '0 2px 4px rgba(0,0,0,0.04)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>{h.numero}</div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                          {pal.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Leyenda y referencias */}
            <div style={{ marginTop: '30px', padding: '16px', background: '#F8FAFC', borderRadius: '8px', fontSize: '13px', color: '#64748B' }}>
              <strong style={{ color: '#475569', display: 'block', marginBottom: '10px' }}>Referencias de estado:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {Object.entries(estadoPaleta).map(([, pal]) => (
                  <span key={pal.label} style={{
                    fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px',
                    background: pal.bg, color: pal.color,
                  }}>
                    {pal.label}
                  </span>
                ))}
              </div>
              <p>Toca cualquier habitación de la cuadrícula para abrir el menú de modificación.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
