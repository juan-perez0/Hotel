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
  tipo_acomodacion?: string;
  numero_acompanantes?: number;
};

type Toast = { mensaje: string; exito: boolean } | null;

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
    valor_pagado: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal de check-out
  const [checkoutHuesped, setCheckoutHuesped] = useState<Huesped | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const mostrarToast = (mensaje: string, exito: boolean) => {
    setToast({ mensaje, exito });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchData = async () => {
    const resH = await fetch('/api/recepcion/habitaciones');
    if (resH.ok) setHabitaciones(await resH.json());
    const resG = await fetch('/api/recepcion/huespedes');
    if (resG.ok) setHuespedes(await resG.json());
  };

  useEffect(() => { fetchData(); }, []);

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

  const confirmarCheckOut = async () => {
    if (!checkoutHuesped) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/recepcion/huespedes/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: checkoutHuesped.id, habitacionId: checkoutHuesped.habitacionId }),
      });
      if (res.ok) {
        const numHab = checkoutHuesped.habitacion?.numero ?? '—';
        setCheckoutHuesped(null);
        await fetchData();
        mostrarToast(`Check-Out completado. Habitación ${numHab} cambiada a: Requiere Limpieza`, true);
      } else {
        setCheckoutHuesped(null);
        mostrarToast('Error al procesar el Check-Out.', false);
      }
    } catch {
      setCheckoutHuesped(null);
      mostrarToast('Error de red al procesar el Check-Out.', false);
    }
    setCheckoutLoading(false);
  };

  const disponibles = habitaciones.filter(h => h.estado === 'DISPONIBLE' || h.estado === 'RESERVADA');
  const huespedesActivos = huespedes.filter(h => !h.check_out);
  const huespedesHistoricos = huespedes.filter(h => h.check_out).slice(0, 10);

  const estadoPaleta: Record<string, { bg: string; color: string; border: string; label: string }> = {
    DISPONIBLE:        { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0', label: 'Disponible' },
    OCUPADA:           { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA', label: 'Ocupada' },
    REQUIERE_LIMPIEZA: { bg: '#FFEDD5', color: '#C2410C', border: '#FED7AA', label: 'Requiere Limpieza' },
    LIMPIEZA:          { bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD', label: 'En Limpieza' },
    MANTENIMIENTO:     { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A', label: 'Mantenimiento' },
    RESERVADA:         { bg: '#F3E8FF', color: '#7C3AED', border: '#DDD6FE', label: 'Reservada' },
  };

  return (
    <div className="premium-container" style={{ alignItems: 'flex-start', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '1600px' }}>
        <BotonRetroceso />

        {/* Toast de notificación */}
        {toast && (
          <div style={{
            position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
            background: toast.exito ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${toast.exito ? '#6EE7B7' : '#FECACA'}`,
            color: toast.exito ? '#065F46' : '#991B1B',
            padding: '14px 28px', borderRadius: '12px', fontWeight: 600, fontSize: '15px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 9999,
            animation: 'fadeIn 0.3s ease',
            whiteSpace: 'nowrap',
          }}>
            {toast.mensaje}
          </div>
        )}

        {/* Modal de confirmación de Check-Out */}
        {checkoutHuesped && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000,
            backdropFilter: 'blur(4px)',
          }}>
            <div style={{
              background: 'white', borderRadius: '16px', padding: '40px',
              maxWidth: '460px', width: '90%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
              animation: 'fadeIn 0.2s ease',
            }}>
              {/* Indicador visual */}
              <div style={{
                width: '4px', background: '#F97316', borderRadius: '4px',
                height: '40px', margin: '0 auto 24px auto',
              }} />

              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1E293B', textAlign: 'center', marginBottom: '6px' }}>
                Confirmar Check-Out
              </h2>
              <p style={{ color: '#64748B', textAlign: 'center', fontSize: '14px', marginBottom: '28px' }}>
                Revisa los datos antes de confirmar la salida del huésped
              </p>

              {/* Datos del huésped */}
              <div style={{
                background: '#F8FAFC', borderRadius: '12px', padding: '20px',
                marginBottom: '20px', border: '1px solid #E2E8F0',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Huésped</p>
                    <p style={{ fontWeight: 700, color: '#1E293B', fontSize: '15px', margin: 0 }}>
                      {checkoutHuesped.nombres} {checkoutHuesped.apellidos}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Documento</p>
                    <p style={{ fontWeight: 600, color: '#334155', margin: 0 }}>
                      {checkoutHuesped.tipo_identificacion} {checkoutHuesped.numero_identificacion}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Habitación</p>
                    <p style={{ fontWeight: 700, color: '#4338CA', fontSize: '20px', margin: 0 }}>
                      #{checkoutHuesped.habitacion?.numero ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Fecha Check-In</p>
                    <p style={{ fontWeight: 600, color: '#334155', margin: 0 }}>
                      {new Date(checkoutHuesped.check_in).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Aviso de cambio de estado */}
              <div style={{
                background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px',
                padding: '14px 18px', marginBottom: '28px',
              }}>
                <p style={{ fontSize: '13px', color: '#92400E', fontWeight: 500, margin: 0, lineHeight: '1.5' }}>
                  La habitación <strong>#{checkoutHuesped.habitacion?.numero}</strong> pasará
                  automáticamente al estado <strong>Requiere Limpieza</strong>.
                </p>
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setCheckoutHuesped(null)}
                  disabled={checkoutLoading}
                  style={{
                    flex: 1, padding: '13px', borderRadius: '10px',
                    border: '1px solid #E2E8F0', background: 'white',
                    color: '#475569', fontWeight: 600, fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarCheckOut}
                  disabled={checkoutLoading}
                  style={{
                    flex: 1, padding: '13px', borderRadius: '10px', border: 'none',
                    background: checkoutLoading ? '#94A3B8' : '#F97316',
                    color: 'white', fontWeight: 700, fontSize: '14px',
                    cursor: checkoutLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {checkoutLoading ? 'Procesando...' : 'Confirmar Salida'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', color: '#1E293B', marginBottom: '8px' }}>Modulo de Recepcion</h1>
            <p style={{ color: '#64748B' }}>Gestion de Huespedes, Pagos y Habitaciones.</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link href="/recepcion/reservas" className="premium-btn" style={{ background: '#3B82F6', margin: 0, padding: '10px 20px', width: 'auto', textDecoration: 'none' }}>
              Calendario de Reservas
            </Link>
            <button onClick={handleLogout} className="premium-btn" style={{ background: '#EF4444', margin: 0, padding: '10px 20px', width: 'auto' }}>
              Cerrar Sesion
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) minmax(500px, 1.2fr)', gap: '30px' }}>

          {/* Formulario Check-In */}
          <div className="premium-card" style={{ height: 'fit-content' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '24px', paddingBottom: '10px', borderBottom: '1px solid #E2E8F0' }}>
              Realizar Check-In
            </h2>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleCheckIn} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Tipo Documento</label>
                <select name="tipo_identificacion" className="premium-input" value={formData.tipo_identificacion} onChange={handleChange}>
                  <option value="CC">Cedula de Ciudadania (CC)</option>
                  <option value="CE">Cedula de Extranjeria (CE)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="RC">Registro Civil (RC)</option>
                  <option value="PASAPORTE">Pasaporte</option>
                  <option value="NIT">Identificacion Tributaria (NIT)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Numero Documento *</label>
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
                <label>Habitacion *</label>
                <select name="habitacionId" className="premium-input" value={formData.habitacionId} onChange={handleChange} required>
                  <option value="">Seleccione Disponible / Reservada</option>
                  {disponibles.map(h => (
                    <option key={h.id} value={h.id}>
                      Hab. {h.numero} (Piso {h.piso}){h.estado === 'RESERVADA' ? ' — Pre-Reservada' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Acomodacion</label>
                <select name="tipo_acomodacion" className="premium-input" value={formData.tipo_acomodacion} onChange={handleChange}>
                  <option value="SENCILLA">Sencilla</option>
                  <option value="DOBLE">Doble</option>
                  <option value="MULTIPLE">Multiple</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Acompanantes</label>
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

          {/* Columna derecha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

            {/* Mapa de habitaciones */}
            <div className="premium-card">
              <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Mapa de Habitaciones</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px' }}>
                {habitaciones.length === 0 && (
                  <span style={{ color: '#64748B', fontSize: '14px' }}>No hay habitaciones. Pide a un Admin que las cree.</span>
                )}
                {habitaciones.map(h => {
                  const pal = estadoPaleta[h.estado] ?? { bg: '#F1F5F9', color: '#334155', border: '#CBD5E1', label: h.estado };
                  return (
                    <div key={h.id} title={`Habitacion ${h.numero} - ${pal.label}`} style={{
                      padding: '10px 4px', textAlign: 'center', borderRadius: '8px',
                      fontSize: '13px', fontWeight: 700,
                      background: pal.bg, color: pal.color, border: `1px solid ${pal.border}`,
                    }}>
                      {h.numero}
                      <div style={{ fontSize: '9px', fontWeight: 500, marginTop: '3px', opacity: 0.8 }}>
                        {pal.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Leyenda */}
              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {Object.entries(estadoPaleta).map(([key, pal]) => (
                  <span key={key} style={{
                    fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px',
                    background: pal.bg, color: pal.color, border: `1px solid ${pal.border}`,
                  }}>{pal.label}</span>
                ))}
              </div>
            </div>

            {/* Tabla de huespedes activos */}
            <div className="premium-card" style={{ padding: '0', overflowX: 'auto' }}>
              <div style={{
                padding: '20px 24px', borderBottom: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <h2 style={{ fontSize: '18px', color: '#1E293B', margin: 0 }}>Huespedes Activos</h2>
                <span style={{
                  background: '#DBEAFE', color: '#1D4ED8',
                  fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px',
                }}>
                  {huespedesActivos.length} en el hotel
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ background: '#F8FAFC' }}>
                  <tr style={{ color: '#475569' }}>
                    <th style={{ padding: '12px 24px', fontWeight: 600 }}>Huesped</th>
                    <th style={{ padding: '12px 24px', fontWeight: 600 }}>Hab.</th>
                    <th style={{ padding: '12px 24px', fontWeight: 600 }}>Check-In</th>
                    <th style={{ padding: '12px 24px', fontWeight: 600 }}>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {huespedesActivos.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#94A3B8' }}>
                        No hay huespedes alojados actualmente.
                      </td>
                    </tr>
                  )}
                  {huespedesActivos.map(h => (
                    <tr key={h.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 600, color: '#1E293B' }}>{h.nombres} {h.apellidos}</div>
                        <div style={{ color: '#94A3B8', fontSize: '12px', marginTop: '2px' }}>
                          {h.tipo_identificacion} {h.numero_identificacion}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          background: '#E0E7FF', color: '#4338CA',
                          padding: '5px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '15px',
                        }}>
                          #{h.habitacion ? h.habitacion.numero : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#475569', fontSize: '13px' }}>
                        {new Date(h.check_in).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                      </td>
                      <td style={{ padding: '12px 24px' }}>
                        <button
                          onClick={() => setCheckoutHuesped(h)}
                          style={{
                            padding: '8px 18px', borderRadius: '8px',
                            background: '#FFF7ED', color: '#C2410C', fontWeight: 700,
                            fontSize: '13px', cursor: 'pointer',
                            border: '1px solid #FED7AA',
                          }}
                        >
                          Check-Out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Historial reciente */}
            {huespedesHistoricos.length > 0 && (
              <div className="premium-card">
                <h2 style={{ fontSize: '16px', color: '#64748B', marginBottom: '12px' }}>Historial Reciente</h2>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {huespedesHistoricos.map(h => (
                    <div key={h.id} style={{
                      padding: '10px 0', borderBottom: '1px solid #F1F5F9',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px',
                    }}>
                      <div>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{h.nombres} {h.apellidos}</span>
                        {h.habitacion && (
                          <span style={{
                            marginLeft: '8px', background: '#F1F5F9', color: '#64748B',
                            padding: '2px 6px', borderRadius: '4px', fontSize: '11px',
                          }}>
                            Hab. {h.habitacion.numero}
                          </span>
                        )}
                      </div>
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>
                        {new Date(h.check_out!).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        <NubeObservaciones />
      </div>
    </div>
  );
}
