import './App.css';
import React, { useState, useMemo, useCallback, useTransition, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const intialProducts = Array.from({ length: 100000 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.floor(Math.random() * 100) + 1,
}));

function App() {
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const handleSearchChange = useCallback((e) => {
    startTransition(() => {
      setSearch(e.target.value);
      setCurrentPage(1); // Reset ke halaman pertama saat mencari
    });
  }, []);

  const filteredProducts = useMemo(() => {
    return intialProducts.filter((product) => product.name.toLowerCase().includes(deferredSearch.toLowerCase()));
  }, [deferredSearch]);

  const totalPrice = useMemo(() => {
    return filteredProducts.reduce((total, product) => total + product.price, 0);
  }, [filteredProducts]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Product Search</h1>
      <input type="text" placeholder="Search products..." onChange={handleSearchChange} style={{ marginBottom: '20px', padding: '10px', width: '300px' }} />

      {isPending ? <p>Loading...</p> : null}

      <ul>
        <AnimatePresence>
          {paginatedProducts.map((product) => (
            <motion.li key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.1 }}>
              {product.name} - ${product.price}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ marginRight: '10px' }}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ marginLeft: '10px' }}>
          Next
        </button>
      </div>

      <h2>Total Price: ${totalPrice}</h2>
    </div>
  );
}

export default App;
