import React, { useState, useMemo, useCallback, useTransition, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const initialProducts = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.floor(Math.random() * 100) + 1,
}));

function App() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('name-asc');
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });
  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);
  const [editingProduct, setEditingProduct] = useState(null); // Menyimpan produk yang sedang diedit

  const itemsPerPage = 10;

  const handleSearchChange = useCallback((e) => {
    startTransition(() => {
      setSearch(e.target.value);
      setCurrentPage(1); // Reset ke halaman pertama saat mencari
    });
  }, []);

  const handleSortChange = useCallback((e) => {
    setSortOption(e.target.value);
  }, []);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Nama dan harga produk harus diisi!');
      return;
    }
    const id = products.length + 1;
    setProducts((prev) => [...prev, { id, name: newProduct.name, price: parseFloat(newProduct.price) }]);
    setNewProduct({ name: '', price: '' });
  };

  const handleDeleteProduct = (id) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    if (sortOption === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'name-desc') {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOption === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    }
    return sorted;
  }, [products, sortOption]);

  const filteredProducts = useMemo(() => {
    return sortedProducts.filter((product) => product.name.toLowerCase().includes(deferredSearch.toLowerCase()));
  }, [sortedProducts, deferredSearch]);

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

  const handleSaveEdit = () => {
    if (!editingProduct.name || !editingProduct.price) {
      alert('Nama dan harga produk tidak boleh kosong!');
      return;
    }

    setProducts((prev) => prev.map((product) => (product.id === editingProduct.id ? editingProduct : product)));
    setEditingProduct(null); // Tutup form edit
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Product Search</h1>
      <div style={{ marginBottom: '20px' }}>
        <input type="text" placeholder="Search products..." onChange={handleSearchChange} value={search} style={{ marginRight: '10px', padding: '10px', width: '300px' }} />
        <select onChange={handleSortChange} value={sortOption} style={{ padding: '10px' }}>
          <option value="name-asc">Sort by Name (A-Z)</option>
          <option value="name-desc">Sort by Name (Z-A)</option>
          <option value="price-asc">Sort by Price (Low to High)</option>
          <option value="price-desc">Sort by Price (High to Low)</option>
        </select>
      </div>
      {isPending && <p>Loading...</p>}

      <ul>
        <AnimatePresence>
          {paginatedProducts.map((product) => (
            <motion.li key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ marginBottom: '10px' }}>
              {product.name} - ${product.price.toFixed(2)}{' '}
              <button
                onClick={() => setEditingProduct(product)} // Mengatur produk yang akan diedit
                style={{ marginLeft: '10px' }}
              >
                Edit
              </button>
              <button onClick={() => handleDeleteProduct(product.id)} style={{ marginLeft: '10px', color: 'red' }}>
                Delete
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {editingProduct && (
        <div style={{ marginTop: '20px', border: '1px solid gray', padding: '20px', borderRadius: '10px' }}>
          <h3>Edit Product</h3>
          <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} style={{ marginRight: '10px', padding: '10px' }} />
          <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} style={{ marginRight: '10px', padding: '10px' }} />
          <button onClick={() => handleSaveEdit()} style={{ marginRight: '10px', padding: '10px' }}>
            Save
          </button>
          <button onClick={() => setEditingProduct(null)} style={{ padding: '10px', backgroundColor: 'red', color: 'white' }}>
            Cancel
          </button>
        </div>
      )}

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

      <h2>Total Price: ${totalPrice.toFixed(2)}</h2>

      {/* Add Product */}
      <div style={{ marginTop: '20px' }}>
        <h3>Add New Product</h3>
        <input type="text" placeholder="Product name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} style={{ marginRight: '10px', padding: '10px' }} />
        <input type="number" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} style={{ marginRight: '10px', padding: '10px' }} />
        <button onClick={handleAddProduct} style={{ padding: '10px' }}>
          Add Product
        </button>
      </div>
      {/* End Add Product */}
    </div>
  );
}

export default App;
