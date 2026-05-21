import React, { useState, useEffect } from 'react';

function POS() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [weightInput, setWeightInput] = useState({});

  useEffect(() => {
    // Fetch products from SQLite via Electron IPC
    window.electronAPI.getProducts().then(setItems);
  }, []);

  const addToCart = (item) => {
    const weight = parseFloat(weightInput[item.id] || 0);
    if (weight <= 0) {
      alert('Please enter a valid weight');
      return;
    }

    const newItem = {
      ...item,
      weight,
      subtotal: item.price_per_kg * weight,
    };

    setCart([...cart, newItem]);
    setWeightInput({ ...weightInput, [item.id]: '' });
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const result = await window.electronAPI.saveTransaction({
        total,
        items: cart
      });

      if (result.success) {
        alert(`Transaction #${result.transactionId} saved to local database! Total: ₱${total.toFixed(2)}`);
        setCart([]);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to save transaction locally.');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <div style={{ flex: 1 }}>
        <h3>Items</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
          {items.map((item) => (
            <div key={item.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', background: '#fff' }}>
              <strong>{item.name}</strong>
              <p>₱{item.price_per_kg}/kg</p>
              <input
                type="number"
                placeholder="kg"
                value={weightInput[item.id] || ''}
                onChange={(e) => setWeightInput({ ...weightInput, [item.id]: e.target.value })}
                style={{ width: '100%', marginBottom: '0.5rem', padding: '0.3rem' }}
              />
              <button
                onClick={() => addToCart(item)}
                style={{ width: '100%', padding: '0.5rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: '350px', background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3>Cart</h3>
        <div style={{ minHeight: '300px' }}>
          {cart.length === 0 ? (
            <p style={{ color: '#888' }}>Cart is empty</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {cart.map((item, index) => (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                  <div>
                    <strong>{item.name}</strong>
                    <br />
                    <small>{item.weight}kg x ₱{item.price_per_kg}</small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    ₱{item.subtotal.toFixed(2)}
                    <br />
                    <button onClick={() => removeFromCart(index)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ marginTop: '1rem', borderTop: '2px solid #333', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
            <span>Total:</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '1rem',
              background: cart.length === 0 ? '#ccc' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1.1rem',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default POS;
