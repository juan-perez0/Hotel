'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BotonRetroceso() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.rol === 'ADMIN') setIsAdmin(true);
        }
      } catch(e) {}
    };
    checkRole();
  }, []);

  if (!isAdmin) return null;

  return (
    <div style={{ marginBottom: '20px' }}>
      <Link href="/admin" className="premium-btn" style={{ background: '#1E293B', display: 'inline-flex', alignItems: 'center', width: 'auto', padding: '10px 18px', gap: '10px', fontSize: '14px', margin: 0, textDecoration: 'none', borderRadius: '30px' }}>
        <span style={{ fontSize: '16px' }}>←</span> Volver al Panel Principal (Admin)
      </Link>
    </div>
  );
}
