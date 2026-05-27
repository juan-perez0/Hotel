'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BotonRetroceso from '@/components/BotonRetroceso';
import NubeObservaciones from '@/components/NubeObservaciones';

type Habitacion = {
  id: number;
  numero: string;
  piso: number;
  estado: string;
};

type Huesped = {
  id: number;
  nombres: string;
  apellidos: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  check_in: string;
  check_out: string | null;
  habitacionId: number | null;
  habitacion?: Habitacion;
  valor_pagado: number;
};

export default function RecepcionDashboard() {
  const router = useRouter();
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  
  const [formData, setFormData] = useState({
    tipo_identificacion: 'CC',
    numero_identificacion: '',
    nombres: '',
    apellidos: '',
    ciudad_residencia: '',
    ciudad_procedencia: '',
    habitacionId: '',
    motivo_viaje: '',
    numero_acompanantes: 0,
    tipo_acomodacion: 'SENCILLA',
    valor_pagado: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    const resHabitaciones = await fetch('/api/recepcion/habitaciones');
    if (resHabitaciones.ok) setHabitaciones(await resHabitaciones.json());
    
    const resHuespedes = await fetch('/api/recepcion/huespedes');
    if (resHuespedes.ok) setHuespedes(await resHuespedes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.habitacionId) {
      setError('Debes seleccionar una habitación disponible.');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/recepcion/huespedes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ ...formData, numero_identificacion: '', nombres: '', apellidos: '', valor_pagado: 0, habitacionId: '' });
      fetchData();
    } else {
      const data = await res.json();
      setError(data.error || 'Error al procesar check-in');
    }
    setLoading(false);
  };

  const procesarCheckOut = async (huesped: Huesped) => {
    if (!confirm(`¿Confirmas el Check-Out de ${huesped.nombres}? La habitación pasará a estado REQUIERE LIMPIEZA.`)) return;
    
    try {
      await fetch('/api/recepcion/huespedes/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: huesped.id, habitacionId: huesped.habitacionId }),
      });
      fetchData();
    } catch(e) {
      alert('Error al realizar Check-out');
    }
  };

  const disponibles = habitaciones.filter(h => h.estado === 'DISPONIBLE');
  const huespedesActivos = huespedes.filter(h => !h.check_out);
  const huespedesHistoricos = huespedes.filter(h => h.check_out).slice(0, 10);

  return (
    <div className="premium-container" style={{ alignItems: 'flex-start', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '1600px' }}>
        <BotonRetroceso />
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', color: '#1E293B', marginBottom: '8px' }}>Módulo de Recepción</h1>
            <p style={{ color: '#64748B' }}>Gestión de Huéspedes, Pagos y Habitaciones.</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link href="/recepcion/reservas" className="premium-btn" style={{ background: '#3B82F6', margin: 0, padding: '10px 20px', width: 'auto', textDecoration: 'none' }}>
              📅 Calendario de Reservas
            </Link>
            <button onClick={handleLogout} className="premium-btn" style={{ background: '#EF4444', margin: 0, padding: '10px 20px', width: 'auto' }}>
              Cerrar Sesión
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) minmax(500px, 1.2fr)', gap: '30px' }}>
          
          <div className="premium-card" style={{ height: 'fit-content' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '24px', paddingBottom: '10px', borderBottom: '1px solid #E2E8F0' }}>Realizar Check-In</h2>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleCheckIn} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Tipo Docto.</label>
                <select name="tipo_identificacion" className="premium-input" value={formData.tipo_identificacion} onChange={handleChange}>
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="RC">Registro Civil (RC)</option>
                  <option value="PASAPORTE">Pasaporte</option>
                  <option value="NIT">Identificación Tributaria (NIT)</option>
                </select>
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Número Documento *</label>
                <input name="numero_identificacion" type="text" className="premium-input" required value={formData.numero_identificacion} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Nombres *</label>
                <input name="nombres" type="text" className="premium-input" required value={formData.nombres} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Apellidos *</label>
                <input name="apellidos" type="text" className="premium-input" required value={formData.apellidos} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Ciudad Residencia</label>
                <input name="ciudad_residencia" type="text" className="premium-input" value={formData.ciudad_residencia} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Ciudad Procedencia</label>
                <input name="ciudad_procedencia" type="text" className="premium-input" value={formData.ciudad_procedencia} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Habitación *</label>
                <select name="habitacionId" className="premium-input" value={formData.habitacionId} onChange={handleChange} required>
                  <option value="">Seleccione Disponible</option>
                  {disponibles.map(h => (
                    <option key={h.id} value={h.id}>Hab. {h.numero} (Piso {h.piso})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Acomodación</label>
                <select name="tipo_acomodacion" className="premium-input" value={formData.tipo_acomodacion} onChange={handleChange}>
                  <option value="SENCILLA">Sencilla</option>
                  <option value="DOBLE">Doble</option>
                  <option value="MULTIPLE">Múltiple</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Acompañantes</label>
                <input name="numero_acompanantes" type="number" min="0" className="premium-input" value={formData.numero_acompanantes} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Valor Pagado ($) *</label>
                <input name="valor_pagado" type="number" min="0" className="premium-input" required value={formData.valor_pagado} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                <label>Motivo de Viaje</label>
                <input name="motivo_viaje" type="text" className="premium-input" value={formData.motivo_viaje} onChange={handleChange} />
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                <button type="submit" className="premium-btn" disabled={loading} style={{ background: '#3B82F6' }}>
                  {loading ? 'Procesando...' : 'Completar Check-In'}
                </button>
              </div>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            <div className="premium-card">
              <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Mapa de Habitaciones</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '8px' }}>
                {habitaciones.length === 0 && <span style={{ color: '#64748B', fontSize: '14px' }}>No hay habitaciones. Pide a un Admin que las cree.</span>}
                {habitaciones.map(h => (
                  <div key={h.id} title={`Habitación ${h.numero} - ${h.estado}`} style={{
                    padding: '10px 4px', textAlign: 'center', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                    background: h.estado === 'DISPONIBLE' ? '#D1FAE5' : (h.estado === 'OCUPADA' ? '#FEF2F2' : (h.estado === 'REQUIERE_LIMPIEZA' ? '#FFEDD5' : '#FEF3C7')),
                    color: h.estado === 'DISPONIBLE' ? '#065F46' : (h.estado === 'OCUPADA' ? '#991B1B' : (h.estado === 'REQUIERE_LIMPIEZA' ? '#C2410C' : '#92400E')),
                    border: `1px solid ${h.estado === 'DISPONIBLE' ? '#A7F3D0' : (h.estado === 'OCUPADA' ? '#FECACA' : (h.estado === 'REQUIERE_LIMPIEZA' ? '#FED7AA' : '#FDE68A'))}`
                  }}>
                    {h.numero}
                  </div>
                ))}
              </div>
            </div>

            <div className="premium-card" style={{ padding: '0', overflowX: 'auto' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0' }}>
                <h2 style={{ fontSize: '18px', color: '#1E293B' }}>Huéspedes Activos (En el Hotel)</h2>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ background: '#F8FAFC' }}>
                  <tr style={{ color: '#475569' }}>
                    <th style={{ padding: '12px 24px', fontWeight: 600 }}>Huésped / Docto</th>
                    <th style={{ padding: '12px 24px', fontWeight: 600 }}>Habit.</th>
                    <th style={{ padding: '12px 24px', fontWeight: 600 }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {huespedesActivos.length === 0 && <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>No hay huéspedes alojados ahora.</td></tr>}
                  {huespedesActivos.map(h => (
                    <tr key={h.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 500 }}>{h.nombres} {h.apellidos}</div>
                        <div style={{ color: '#64748B', fontSize: '12px' }}>{h.tipo_identificacion} - {h.numero_identificacion}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ background: '#E0E7FF', color: '#4338CA', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          #{h.habitacion ? h.habitacion.numero : 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <button onClick={() => procesarCheckOut(h)} className="premium-btn" style={{ margin: 0, padding: '6px 12px', background: '#F97316', fontSize: '12px', width: 'auto' }}>
                          Realizar Check-Out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="premium-card">
              <h2 style={{ fontSize: '16px', color: '#64748B' }}>Historial Reciente</h2>
              <div style={{ marginTop: '10px', fontSize: '14px' }}>
                {huespedesHistoricos.map(h => (
                  <div key={h.id} style={{ padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <strong>{h.nombres} {h.apellidos}</strong> (Salió: {new Date(h.check_out!).toLocaleString()})
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
        <NubeObservaciones />
      </div>
    </div>
  );
}
