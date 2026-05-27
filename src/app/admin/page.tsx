'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NubeObservaciones from '@/components/NubeObservaciones';

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('RECEPCIONISTA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [numeroHabitacion, setNumeroHabitacion] = useState('');
  const [pisoHabitacion, setPisoHabitacion] = useState('1');
  const [loadingHabitacion, setLoadingHabitacion] = useState(false);
  const [errorHabitacion, setErrorHabitacion] = useState('');
  const [exitoHabitacion, setExitoHabitacion] = useState('');

  const [loadingExport, setLoadingExport] = useState(false);

  const fetchUsuarios = async () => {
    const res = await fetch('/api/admin/usuarios');
    if (res.ok) setUsuarios(await res.json());
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password, rol }),
    });

    if (res.ok) {
      setNombre(''); setEmail(''); setPassword('');
      fetchUsuarios();
    } else {
      const data = await res.json();
      setError(data.error || 'Error al crear usuario');
    }
    setLoading(false);
  };

  const handleCrearHabitacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingHabitacion(true);
    setErrorHabitacion('');
    setExitoHabitacion('');

    const res = await fetch('/api/recepcion/habitaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero: numeroHabitacion, piso: pisoHabitacion }),
    });

    if (res.ok) {
      setNumeroHabitacion('');
      setExitoHabitacion('Habitación creada correctamente');
      setTimeout(() => setExitoHabitacion(''), 3000);
    } else {
      const data = await res.json();
      setErrorHabitacion(data.error || 'Error al crear habitación');
    }
    setLoadingHabitacion(false);
  };

  const exportUsuariosAExcel = () => {
    const data = usuarios.map(u => ({
      ID: u.id,
      Nombre: u.nombre,
      Email: u.email,
      Rol: u.rol,
      'Fecha Creación': new Date(u.createdAt).toLocaleDateString()
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
    XLSX.writeFile(workbook, `Reporte_Usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportLimpiezasAExcel = async () => {
    setLoadingExport(true);
    try {
      const res = await fetch('/api/admin/reportes/limpieza');
      const limpiezas = await res.json();
      
      const data = limpiezas.map((l: any) => ({
        ID: l.id,
        Habitacion: l.habitacion?.numero || 'N/A',
        Piso: l.habitacion?.piso || 'N/A',
        'Empleada A cargo': l.empleada?.nombre || 'N/A',
        Email: l.empleada?.email || 'N/A',
        'Estado Anterior': l.estadoAnterior,
        'Estado Nuevo': l.estadoNuevo,
        Observaciones: l.observaciones,
        Fecha: new Date(l.fecha).toLocaleString()
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte_Aseo");
      XLSX.writeFile(workbook, `Auditoria_Limpieza_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch(e) {}
    setLoadingExport(false);
  };

  const exportHabitacionesAExcel = async () => {
    setLoadingExport(true);
    try {
      const res = await fetch('/api/recepcion/habitaciones');
      const habitaciones = await res.json();
      
      const data = habitaciones.map((h: any) => ({
        'Número': h.numero,
        Piso: h.piso,
        Estado: h.estado,
        Observaciones: h.notas_empleada,
        'Fecha Alta': new Date(h.createdAt).toLocaleDateString()
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Habitaciones");
      XLSX.writeFile(workbook, `Inventario_Habitaciones_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch(e) {}
    setLoadingExport(false);
  };

  return (
    <div className="premium-container" style={{ alignItems: 'flex-start', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '1600px' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', color: '#1E293B', marginBottom: '8px' }}>Panel de Administración</h1>
            <p style={{ color: '#64748B' }}>Gestión global del sistema interno</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
             <button onClick={handleLogout} className="premium-btn" style={{ background: '#EF4444', margin: 0, padding: '10px 20px', width: 'auto' }}>
               Cerrar Sesión
             </button>
          </div>
        </header>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', flexWrap: 'wrap', justifyContent: 'space-between' }}>
           <div>
             <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '12px' }}>Modos de Acceso Globales</h3>
             <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
               <Link href="/recepcion" className="premium-btn" style={{ background: '#3B82F6', textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '10px 20px', margin: 0 }}>
                 Acceder a Recepción
               </Link>
               <Link href="/limpieza" className="premium-btn" style={{ background: '#6366F1', textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '10px 20px', margin: 0 }}>
                 Acceder a Limpieza
               </Link>
             </div>
           </div>
           <div>
             <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '12px' }}>Descarga de Auditoría y Reportes (.xlsx)</h3>
             <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
               <button onClick={exportUsuariosAExcel} disabled={loadingExport} className="premium-btn" style={{ background: '#10B981', margin: 0, padding: '10px 20px', width: 'auto' }}>
                 ↓ Reporte Usuarios
               </button>
               <button onClick={exportLimpiezasAExcel} disabled={loadingExport} className="premium-btn" style={{ background: '#059669', margin: 0, padding: '10px 20px', width: 'auto' }}>
                 ↓ Auditoría Aseo / Limpieza
               </button>
               <button onClick={exportHabitacionesAExcel} disabled={loadingExport} className="premium-btn" style={{ background: '#047857', margin: 0, padding: '10px 20px', width: 'auto' }}>
                 ↓ Reporte Habitaciones
               </button>
             </div>
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '30px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="premium-card">
              <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Agregar Nueva Habitación</h2>
              {errorHabitacion && <div className="error-message">{errorHabitacion}</div>}
              {exitoHabitacion && <div style={{ background: '#D1FAE5', color: '#065F46', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', border: '1px solid #A7F3D0', textAlign: 'center' }}>{exitoHabitacion}</div>}
              
              <form onSubmit={handleCrearHabitacion} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  className="premium-input" 
                  placeholder="Ej: 101, 202A..."
                  required 
                  value={numeroHabitacion} 
                  onChange={e => setNumeroHabitacion(e.target.value)} 
                />
                <select className="premium-input" value={pisoHabitacion} onChange={e => setPisoHabitacion(e.target.value)} style={{ width: '120px' }}>
                  {[1,2,3,4,5].map(p => <option key={p} value={p}>Piso {p}</option>)}
                </select>
                <button type="submit" className="premium-btn" disabled={loadingHabitacion} style={{ width: 'auto', padding: '12px 20px', margin: 0, whiteSpace: 'nowrap' }}>
                  +
                </button>
              </form>
            </div>

            <div className="premium-card">
              <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Crear Nuevo Usuario</h2>
              {error && <div className="error-message">{error}</div>}
              
              <form onSubmit={handleCrearUsuario}>
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input className="premium-input" required value={nombre} onChange={e => setNombre(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email Corporativo</label>
                  <input type="email" className="premium-input" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Rol Asignado</label>
                  <select className="premium-input" value={rol} onChange={e => setRol(e.target.value)}>
                    <option value="RECEPCIONISTA">Recepcionista</option>
                    <option value="EMPLEADA">Empleada (Limpieza)</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Contraseña Temporaria</label>
                  <input type="password" className="premium-input" required value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <button type="submit" className="premium-btn" disabled={loading}>
                  {loading ? 'Procesando...' : 'Crear Usuario'}
                </button>
              </form>
            </div>
          </div>

          <div className="premium-card" style={{ maxWidth: '100%', overflowX: 'auto', padding: '0', height: 'fit-content' }}>
            <div style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Usuarios del Sistema</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#F8FAFC' }}>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '16px 30px', fontWeight: 600, fontSize: '14px' }}>Nombre</th>
                  <th style={{ padding: '16px 30px', fontWeight: 600, fontSize: '14px' }}>Email</th>
                  <th style={{ padding: '16px 30px', fontWeight: 600, fontSize: '14px' }}>Rol</th>
                  <th style={{ padding: '16px 30px', fontWeight: 600, fontSize: '14px' }}>Creación</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 && <tr><td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#94A3B8' }}>No hay usuarios o cargando...</td></tr>}
                {usuarios.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '20px 30px' }}>{u.nombre}</td>
                    <td style={{ padding: '20px 30px' }}>{u.email}</td>
                    <td style={{ padding: '20px 30px' }}>
                       <span style={{ 
                         background: u.rol === 'ADMIN' ? '#DBEAFE' : (u.rol === 'RECEPCIONISTA' ? '#FEF3C7' : '#E0E7FF'),
                         color: u.rol === 'ADMIN' ? '#1D4ED8' : (u.rol === 'RECEPCIONISTA' ? '#B45309' : '#4338CA'),
                         padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                         display: 'inline-block'
                       }}>{u.rol}</span>
                    </td>
                    <td style={{ padding: '20px 30px', color: '#64748B', fontSize: '14px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
        <NubeObservaciones />
      </div>
    </div>
  );
}
