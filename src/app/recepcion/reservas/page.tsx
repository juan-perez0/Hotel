'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Reserva = {
  fecha: string; // YYYY-MM-DD
  notas: string;
};

export default function ReservasCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservas, setReservas] = useState<Reserva[]>([]);
  
  const [selectedFecha, setSelectedFecha] = useState<string | null>(null);
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReservas = async () => {
    try {
      const res = await fetch('/api/recepcion/reservas');
      if (res.ok) setReservas(await res.json());
    } catch(e) {}
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const days = [];
  // Agregamos celdas vacías al principio del mes
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
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFecha) return;
    setLoading(true);

    const res = await fetch('/api/recepcion/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha: selectedFecha, notas }),
    });

    if (res.ok) {
      await fetchReservas();
      setSelectedFecha(null);
    } else {
      alert('Error al guardar reserva.');
    }
    setLoading(false);
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="premium-container" style={{ alignItems: 'flex-start', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', color: '#1E293B', marginBottom: '8px' }}>Libreta de Reservaciones</h1>
            <p style={{ color: '#64748B' }}>Anota y gestiona pre-reservas futuras interactivamente.</p>
          </div>
          <div>
            <Link href="/recepcion" className="premium-btn" style={{ background: '#334155', textDecoration: 'none', margin: 0, padding: '10px 20px', width: 'auto' }}>
              ← Volver a Recepción
            </Link>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: selectedFecha ? '2fr 1.2fr' : '1fr', gap: '30px', transition: 'all 0.3s ease' }}>
          
          <div className="premium-card" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <button onClick={() => changeMonth(-1)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 600 }}>← Mes Anterior</button>
               <h2 style={{ fontSize: '22px', m: 0 }}>{monthNames[currentMonth]} {currentYear}</h2>
               <button onClick={() => changeMonth(1)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 600 }}>Mes Siguiente →</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center', fontWeight: 'bold', color: '#64748B', marginBottom: '10px' }}>
              <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
              {days.map((day, idx) => {
                if (!day) return <div key={idx} style={{ minHeight: '100px', background: 'transparent' }} />;
                
                const fecha = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasReserva = reservas.some(r => r.fecha === fecha && r.notas.trim() !== '');

                return (
                  <div 
                    key={idx} 
                    onClick={() => handleDayClick(day)}
                    style={{ 
                      minHeight: '100px', 
                      background: selectedFecha === fecha ? '#DBEAFE' : '#F8FAFC', 
                      border: `2px solid ${selectedFecha === fecha ? '#3B82F6' : '#E2E8F0'}`,
                      borderRadius: '8px', 
                      padding: '10px', 
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: selectedFecha === fecha ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '18px', color: '#1E293B', marginBottom: '8px' }}>{day}</div>
                    {hasReserva && (
                      <div style={{ background: '#F59E0B', color: 'white', fontSize: '10px', padding: '4px', borderRadius: '4px', fontWeight: 'bold', width: 'fit-content' }}>
                        ★ Hay Reservas
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

          {selectedFecha && (
            <div className="premium-card" style={{ height: 'fit-content', background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #BAE6FD', paddingBottom: '12px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', color: '#0369A1' }}>Reservaciones del Día</h2>
                <button onClick={() => setSelectedFecha(null)} style={{ background: 'transparent', border: 'none', fontSize: '20px', color: '#0369A1' }}>×</button>
              </div>
              <p style={{ fontWeight: 600, color: '#0284C7', marginBottom: '16px' }}>Fecha: {selectedFecha}</p>
              
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label style={{ color: '#0369A1' }}>Detalle su anotación cruda:</label>
                  <textarea 
                    className="premium-input" 
                    style={{ minHeight: '200px', resize: 'vertical', border: '1px solid #7DD3FC' }}
                    value={notas}
                    onChange={e => setNotas(e.target.value)}
                    placeholder="Ej: Sr. Martinez 2 personas Hab doble entra 2PM."
                  />
                </div>
                <button type="submit" className="premium-btn" disabled={loading} style={{ background: '#0284C7' }}>
                  {loading ? 'Guardando...' : 'Guardar Agenda'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
