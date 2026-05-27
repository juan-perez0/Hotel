import Link from 'next/link';

export default function AccesoDenegado() {
  return (
    <div className="premium-container">
      <div className="premium-card" style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--danger)' }}>Acceso Denegado</h1>
        <p className="subtitle">No tienes permisos para ver esta página.</p>
        <Link href="/" className="premium-btn" style={{ display: 'block', marginTop: '20px' }}>
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
