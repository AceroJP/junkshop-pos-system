import React, { useState } from 'react';
import POS from './pages/POS';

function App() {
  const [currentPage, setCurrentPage] = useState('POS');

  return (
    <div className="app-container">
      <nav style={{ padding: '1rem', background: '#333', color: '#fff', display: 'flex', gap: '1rem' }}>
        <button onClick={() => setCurrentPage('POS')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: currentPage === 'POS' ? 'bold' : 'normal' }}>POS</button>
        <button onClick={() => setCurrentPage('Inventory')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: currentPage === 'Inventory' ? 'bold' : 'normal' }}>Inventory</button>
        <button onClick={() => setCurrentPage('Reports')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: currentPage === 'Reports' ? 'bold' : 'normal' }}>Reports</button>
      </nav>

      <main style={{ padding: '2rem' }}>
        {currentPage === 'POS' && <POS />}
        {currentPage === 'Inventory' && <div>Inventory Module (Coming Soon)</div>}
        {currentPage === 'Reports' && <div>Reports Module (Coming Soon)</div>}
      </main>
    </div>
  );
}

export default App;
