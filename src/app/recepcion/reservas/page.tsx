'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Habitacion = {
  id: number;
  numero: string;
  piso: number;
  estado: string;
};

type Reserva = {
  id: number;
  fecha: string; // YYYY-MM-DD
  notas: string;
  habitacionId: number | null;
  habitacion?: Habitacion | null;
};

export default function ReservasCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);

  const [selectedFecha, setSelectedFecha] = useState<string | null>(null);
  const [notas, setNotas] = useState('');
  const [selectedHabitacionId, setSelectedHabitacionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchReservas = async () => {
    try {
      const res = await fetch('/api/recepcion/reservas');
      if (res.ok) setReservas(await res.json());
    } catch(e) {}
  };

  const fetchHabitaciones = async () => {
    try {
      const res = await fetch('/api/recepcion/habitaciones');
      if (res.ok) setHabitaciones(await res.json());
    } catch(e) {}
  };

  useEffect(() => {
    fetchReservas();
    fetchHabitaciones();
  }, []);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const days = [];
  for (let i = 0; i < (firstDayIndex === 0 ? 6 : firstDayIndex - 1); i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const handleDayClick = (day: number) => {
    const fecha = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedFecha(fecha);
    const existing = reservas.find(r => r.fecha === fecha);
    setNotas(existing ? existing.notas : '');
    setSelectedHabitacionId(existing?.habitacionId ? String(existing.habitacionId) : '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFecha) return;
    setLoading(true);

    const res = await fetch('/api/recepcion/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fecha: selectedFecha,
        notas,
        habitacionId: selectedHabitacionId || null,
      }),
    });

    if (res.ok) {
      await fetchReservas();
      await fetchHabitaciones();
      setSelectedFecha(null);
    } else {
      alert('Error al guardar reserva.');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedFecha) return;
    if (!confirm('¿Eliminar esta reservación? La habitación quedará como Disponible.')) return;
    setDeleteLoading(true);

    const res = await fetch('/api/recepcion/reservas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha: selectedFecha }),
    });

    if (res.ok) {
      await fetchReservas();
      await fetchHabitaciones();
      setSelectedFecha(null);
    } else {
      alert('Error al eliminar reserva.');
    }
    setDeleteLoading(false);
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  // Habitaciones disponibles o reservadas + la ya asignada a esta fecha
  const reservaActual = reservas.find(r => r.fecha === selectedFecha);
  const habitacionesParaSelector = habitaciones.filter(h =>
    h.estado === 'DISPONIBLE' || h.estado === 'RESERVADA' || h.id === reservaActual?.habitacionId
  );

  const estadoColor: Record<string, string> = {
    DISPONIBLE: '#10B981',
    OCUPADA: '#EF4444',
    REQUIERE_LIMPIEZA: '#F97316',
    LIMPIEZA: '#8B5CF6',
    MANTENIMIENTO: '#F59E0B',
    RESERVADA: '#A855F7',
  };

  const estadoLabel: Record<string, string> = {
    DISPONIBLE: 'Disponible',
    OCUPADA: 'Ocupada',
    REQUIERE_LIMPIEZA: 'Requiere Limpieza',
    LIMPIEZA: 'En Limpieza',
    MANTENIMIENTO: 'Mantenimiento',
    RESERVADA: 'Reservada',
  };

  // Colores de fondo/texto para los chips de estado
  const estadoBg: Record<string, { bg: string; color: string; border: string }> = {
    DISPONIBLE:       { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
    OCUPADA:          { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
    REQUIERE_LIMPIEZA:{ bg: '#FFEDD5', color: '#C2410C', border: '#FED7AA' },
    LIMPIEZA:         { bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD' },
    MANTENIMIENTO:    { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
    RESERVADA:        { bg: '#F3E8FF', color: '#7C3AED', border: '#DDD6FE' },
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '40px',
      position: 'relative',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Fondo imagen */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "url('/hotel-bg.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.50,
        zIndex: 0,
      }} />

      <div style={{ width: '100%', maxWidth: '1100px', position: 'relative', zIndex: 1 }}>
        
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', color: '#1E293B', marginBottom: '8px' }}>Libreta de Reservaciones</h1>
            <p style={{ color: '#64748B' }}>Anota pre-reservas futuras y asigna habitaciones automáticamente.</p>
          </div>
          <div>
            <Link href="/recepcion" className="premium-btn" style={{ background: '#334155', textDecoration: 'none', margin: 0, padding: '10px 20px', width: 'auto' }}>
              ← Volver a Recepción
            </Link>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: selectedFecha ? '2fr 1.2fr' : '1fr', gap: '30px', transition: 'all 0.3s ease' }}>
          
          {/* Tarjeta del Calendario */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
            padding: '30px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.8)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <button onClick={() => changeMonth(-1)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 600, cursor: 'pointer' }}>← Mes Anterior</button>
               <h2 style={{ fontSize: '22px', margin: 0 }}>{monthNames[currentMonth]} {currentYear}</h2>
               <button onClick={() => changeMonth(1)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Mes Siguiente →</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center', fontWeight: 'bold', color: '#64748B', marginBottom: '10px' }}>
              <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
              {days.map((day, idx) => {
                if (!day) return <div key={idx} style={{ minHeight: '90px', background: 'transparent' }} />;
                
                const fecha = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const reservaDelDia = reservas.find(r => r.fecha === fecha && r.notas.trim() !== '');
                const isSelected = selectedFecha === fecha;

                return (
                  <div 
                    key={idx} 
                    onClick={() => handleDayClick(day)}
                    style={{ 
                      minHeight: '90px', 
                      background: isSelected ? '#DBEAFE' : (reservaDelDia ? '#FFF7ED' : '#F8FAFC'),
                      border: `2px solid ${isSelected ? '#3B82F6' : (reservaDelDia ? '#FED7AA' : '#E2E8F0')}`,
                      borderRadius: '8px', 
                      padding: '8px', 
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: isSelected ? '0 4px 12px rgba(59,130,246,0.2)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '16px', color: '#1E293B', marginBottom: '4px' }}>{day}</div>
                    {reservaDelDia && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ background: '#F59E0B', color: 'white', fontSize: '9px', padding: '2px 4px', borderRadius: '4px', fontWeight: 'bold' }}>
                          ★ Reserva
                        </div>
                        {reservaDelDia.habitacion && (
                          <div style={{ background: '#3B82F6', color: 'white', fontSize: '9px', padding: '2px 4px', borderRadius: '4px', fontWeight: 'bold' }}>
                            🛏 Hab. {reservaDelDia.habitacion.numero}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '20px', color: '#64748B', fontSize: '14px', textAlign: 'center' }}>
              Presiona sobre un día del calendario para agregar o ver reservaciones.
            </div>
          </div>

          {/* Panel lateral de edición */}
          {selectedFecha && (
            <div style={{
              background: '#F0F9FF',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
              padding: '30px',
              width: '100%',
              border: '1px solid #BAE6FD',
              height: 'fit-content',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #BAE6FD', paddingBottom: '12px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', color: '#0369A1', margin: 0 }}>Reservación del Día</h2>
                <button onClick={() => setSelectedFecha(null)} style={{ background: 'transparent', border: 'none', fontSize: '22px', color: '#0369A1', cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>

              <div style={{ background: '#E0F2FE', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px' }}>
                <p style={{ fontWeight: 700, color: '#0284C7', margin: 0, fontSize: '15px' }}>{selectedFecha}</p>
              </div>
              
              <form onSubmit={handleSave}>

                {/* Selector de Habitación */}
                <div className="form-group">
                  <label style={{ color: '#0369A1', fontWeight: 600 }}>🛏 Habitación Pre-Reservada</label>
                  <select
                    className="premium-input"
                    value={selectedHabitacionId}
                    onChange={e => setSelectedHabitacionId(e.target.value)}
                    style={{ border: '1px solid #7DD3FC', marginTop: '6px' }}
                  >
                    <option value="">— Sin habitación asignada —</option>
                    {habitacionesParaSelector.map(h => (
                      <option key={h.id} value={h.id}>
                        Hab. {h.numero} — Piso {h.piso} ({estadoLabel[h.estado] ?? h.estado})
                      </option>
                    ))}
                  </select>
                  {selectedHabitacionId && (
                    <p style={{ fontSize: '12px', color: '#0369A1', marginTop: '6px', fontStyle: 'italic' }}>
                      ⚡ Al guardar, la habitación cambiará automáticamente a estado <strong>Pre-Reservada</strong>.
                    </p>
                  )}
                </div>

                {/* Estado del mapa de habitaciones */}
                {habitaciones.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#0369A1', marginBottom: '8px' }}>Estado actual de habitaciones:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {habitaciones.map(h => {
                        const chip = estadoBg[h.estado] ?? { bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' };
                        const iconos: Record<string, string> = {
                          DISPONIBLE: 'OK', OCUPADA: '●', REQUIERE_LIMPIEZA: '!',
                          LIMPIEZA: 'L', MANTENIMIENTO: 'M', RESERVADA: 'R',
                        };
                        return (
                          <span key={h.id} style={{
                            padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                            background: chip.bg, color: chip.color, border: `1px solid ${chip.border}`,
                          }}>
                            {h.numero}
                            <span style={{ fontSize: '9px', marginLeft: '4px', opacity: 0.85 }}>
                              {iconos[h.estado] ?? '?'}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notas */}
                <div className="form-group">
                  <label style={{ color: '#0369A1', fontWeight: 600 }}>📝 Notas de la Reserva</label>
                  <textarea 
                    className="premium-input" 
                    style={{ minHeight: '140px', resize: 'vertical', border: '1px solid #7DD3FC', marginTop: '6px' }}
                    value={notas}
                    onChange={e => setNotas(e.target.value)}
                    placeholder="Ej: Sr. Martinez, 2 personas, hab doble, entra 2PM."
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="premium-btn" disabled={loading} style={{ background: '#0284C7', flex: 1, margin: 0 }}>
                    {loading ? 'Guardando...' : '💾 Guardar Reserva'}
                  </button>
                  {reservas.find(r => r.fecha === selectedFecha) && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className="premium-btn"
                      style={{ background: '#EF4444', flex: 1, margin: 0 }}
                    >
                      {deleteLoading ? 'Eliminando...' : '🗑 Eliminar Reserva'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
