import logo from './logo.svg';
import './App.css';
import React, { useState, useMemo, useCallback, useTransition, useDeferredValue } from 'react';

const intialProducts = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.round(Math.random() * 100) + 1,
}));

function App() {
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);

  const handleSearchChange = useCallback((e) => {
    startTransition(() => {
      setSearch(e.target.value);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    return intialProducts.filter((product) => product.name.toLowerCase().includes(deferredSearch.toLowerCase()));
  }, [deferredSearch]);

  const totalPrice = useMemo(() => {
    return filteredProducts.reduce((total, product) => total + product.price, 0);
  }, [filteredProducts]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Product Search</h1>
      <input type="text" placeholder="Search products..." onChange={handleSearchChange} style={{ marginBottom: '20px', padding: '10px', width: '300px' }} />

      {isPending ? <p>Loading...</p> : null}

      <ul>
        {filteredProducts.map((product) => (
          <ul>
            <li key={product.id}>
              {product.name} - ${product.price}
            </li>
          </ul>
        ))}
      </ul>
      <h2>Total Price: ${totalPrice}</h2>
    </div>
  );
}

export default App;
