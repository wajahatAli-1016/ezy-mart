"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext.jsx";
import styles from "../page.module.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", category: "", tags: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showProducts, setShowProducts] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editForm, setEditForm] = useState({ name: "", description: "", price: "", stock: "", image: "", category: "", tags: "" })
  const [editImageFile, setEditImageFile] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState(null)
  const [saleModal, setSaleModal] = useState(null)
  const [saleForm, setSaleForm] = useState({ salePercentage: "", saleEndDate: "" })
  const [saleMessage, setSaleMessage] = useState("")

  // Guard: only allow specific admin user
  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }
    if (user.email !== "wajahataliq1224@gmail.com") {
      router.replace("/");
    }
  }, [user, router]);

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Fetch products and orders
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [resP, resO] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/orders"),
        ]);
        const [dataP, dataO] = await Promise.all([
          resP.json().catch(() => []),
          resO.json().catch(() => []),
        ]);
        setProducts(Array.isArray(dataP) ? dataP : []);
        setOrders(Array.isArray(dataO) ? dataO : []);
      } catch (err) {
        setProducts([]);
        setOrders([]);
      }
    };
    loadAll();
    // Poll orders so payment status reflects webhook updates
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = await res.json().catch(() => []);
        if (Array.isArray(data)) setOrders(data);
      } catch (_) {
        // ignore polling errors
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Add new product
  const addProduct = async (e) => {
    e.preventDefault();
    let imageDataUrl;
    if (imageFile) {
      try {
        imageDataUrl = await fileToDataUrl(imageFile);
      } catch (_) {
        alert("Failed to read selected image");
        return;
      }
    }
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: form.price === "" ? undefined : Number(form.price),
        stock: form.stock === "" ? undefined : Number(form.stock),
        image: imageDataUrl,
      }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Unknown error" }));
      alert(error.message || "Failed to add product");
      return;
    }
    const newProduct = await res.json();
    setProducts((prev) => [...(Array.isArray(prev) ? prev : []), newProduct]);
    setForm({ name: "", description: "", price: "", stock: "", category: "", tags: "" });
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => (Array.isArray(prev) ? prev.filter((p) => p._id !== id) : []));
  };

  // Open edit modal
  const openEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      image: product.image || "",
      category: product.category || "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : (product.tags || ""),
    });
    setEditImageFile(null);
    setEditImagePreview(product.image || null);
  };

  // Save edit
  const saveEdit = async (e) => {
    e?.preventDefault?.();
    if (!editingProduct) return;
    let imageDataUrl = editForm.image || "";
    if (editImageFile) {
      try {
        imageDataUrl = await fileToDataUrl(editImageFile);
      } catch (_) {
        alert("Failed to read selected image");
        return;
      }
    }
    const res = await fetch(`/api/products/${editingProduct._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        description: editForm.description,
        price: editForm.price === "" ? undefined : Number(editForm.price),
        stock: editForm.stock === "" ? undefined : Number(editForm.stock),
        image: imageDataUrl,
        category: editForm.category,
        tags: editForm.tags,
      }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Unknown error" }));
      alert(error.message || "Failed to update product");
      return;
    }
    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    setEditingProduct(null);
    setEditImageFile(null);
    if (editImagePreview) URL.revokeObjectURL?.(editImagePreview);
    setEditImagePreview(null);
  };

  // Open sale modal
  const openSaleModal = (product) => {
    setSaleModal(product);
    setSaleForm({
      salePercentage: product.salePercentage || "",
      saleEndDate: product.saleEndDate ? new Date(product.saleEndDate).toISOString().split('T')[0] : ""
    });
  };

  // Apply sale
  const applySale = async (e) => {
    e.preventDefault();
    if (!saleModal) return;

    // Validation
    if (!saleForm.salePercentage || saleForm.salePercentage < 1 || saleForm.salePercentage > 100) {
      alert("Please enter a valid sale percentage between 1 and 100");
      return;
    }

    if (!saleForm.saleEndDate) {
      alert("Please select a sale end date");
      return;
    }

    const endDate = new Date(saleForm.saleEndDate);
    if (endDate <= new Date()) {
      alert("Sale end date must be in the future");
      return;
    }

    const res = await fetch("/api/products/sale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: saleModal._id,
        salePercentage: Number(saleForm.salePercentage),
        saleEndDate: saleForm.saleEndDate,
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Unknown error" }));
      alert(error.message || "Failed to apply sale");
      return;
    }

    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    setSaleModal(null);
    setSaleForm({ salePercentage: "", saleEndDate: "" });
    setSaleMessage("Sale applied successfully!");
    setTimeout(() => setSaleMessage(""), 3000);
  };

  // Remove sale
  const removeSale = async (productId) => {
    const res = await fetch("/api/products/sale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: productId,
        salePercentage: 0,
        saleEndDate: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Unknown error" }));
      alert(error.message || "Failed to remove sale");
      return;
    }

    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    setSaleMessage("Sale removed successfully!");
    setTimeout(() => setSaleMessage(""), 3000);
  };

  return (
    <div className={styles.admin}>
      <Navbar />
      <div className={styles.adminContainer}>
      <h1 className={styles.adminHeading}>Admin Dashboard</h1>
      {saleMessage && (
        <div className={styles.successMessage}>
          {saleMessage}
        </div>
      )}
      <div className={styles.adminGrid}>
        <div className={styles.adminCard}>
          <div className={styles.adminCardHeader}>Add New Product</div>
          <div className={styles.adminCardBody}>
            <form onSubmit={addProduct} className={styles.adminForm}>
              <input className={styles.adminInput} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={styles.adminInput} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <input className={styles.adminInput} type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <input className={styles.adminInput} type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              <input className={styles.adminInput} placeholder="Category (e.g., shoes)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <input className={styles.adminInput} placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              <input className={styles.adminFile}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (imagePreview) URL.revokeObjectURL(imagePreview);
                  setImagePreview(file ? URL.createObjectURL(file) : null);
                }}
              />
              {imagePreview && (
                <img src={imagePreview} alt="Selected preview" className={styles.adminThumb} />
              )}
              <button type="submit" className={styles.adminButton}>Add Product</button>
            </form>
          </div>
        </div>

        <div className={styles.adminCard}>
          <div className={styles.adminCardHeader}>Orders</div>
          <div className={styles.adminCardBody}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Order</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>{o.user}</td>
                    <td>#{o._id.slice(-6)}</td>
                    <td>${o.totalAmount}</td>
                    <td>
                      <select
                        className={styles.adminSelect}
                        defaultValue={o.status}
                        onChange={async (e) => {
                          const status = e.target.value;
                          await fetch(`/api/orders/${o._id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status }),
                          });
                          setOrders((prev) => prev.map((oo) => (oo._id === o._id ? { ...oo, status } : oo)));
                        }}
                      >
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                        <option>Paid</option>
                      </select>
                    </td>
                    <td>
                      {o.status === "Paid" ? (
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>Paid</span>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>Unpaid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={styles.adminCard}>
        <div className={styles.adminCardHeader}>Products</div>
        <div className={styles.adminCardBody}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Sale</th>
                <th>Stock</th>
                <th>Tags</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.image && <img src={p.image} alt={p.name} className={styles.adminThumb} />}</td>
                  <td>{p.name}</td>
                  <td>{p.category || "-"}</td>
                  <td>${p.price}</td>
                  <td>
                    {p.isOnSale ? (
                      <div className={styles.saleInfo}>
                        <div className={styles.salePercentage}>
                          {p.salePercentage}% OFF
                        </div>
                        <div className={styles.salePrice}>
                          ${p.salePrice}
                        </div>
                        <div className={styles.saleEndDate}>
                          Ends: {new Date(p.saleEndDate).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      "No Sale"
                    )}
                  </td>
                  <td>{p.stock}</td>
                  <td>{Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags || "-")}</td>
                  <td>
                    <button className={styles.adminButton} onClick={() => openEdit(p)} style={{ marginRight: 8, marginBottom: 4 }}>Edit</button>
                    <button className={styles.adminButton} onClick={() => openSaleModal(p)} style={{ marginRight: 8, marginBottom: 4 }}>
                      {p.isOnSale ? "Edit Sale" : "Apply Sale"}
                    </button>
                    {p.isOnSale && (
                      <button
                        className={styles.adminButton}
                        onClick={() => removeSale(p._id)}
                        style={{ marginRight: 8, marginBottom: 4, backgroundColor: '#dc3545' }}
                      >
                        Remove Sale
                      </button>
                    )}
                    <button className={styles.adminButton} onClick={() => deleteProduct(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <h3>Edit Product</h3>
            <form onSubmit={saveEdit} className={styles.modalForm}>
              <input className={styles.adminInput} placeholder="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <input className={styles.adminInput} placeholder="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              <input className={styles.adminInput} type="number" placeholder="Price" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
              <input className={styles.adminInput} type="number" placeholder="Stock" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} />
              <input className={styles.adminInput} placeholder="Category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
              <input className={styles.adminInput} placeholder="Tags (comma separated)" value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} />
              <input
                className={styles.adminFile}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setEditImageFile(file);
                  setEditImagePreview(file ? URL.createObjectURL(file) : editForm.image || null);
                }}
              />
              {editImagePreview && (
                <img src={editImagePreview} alt="Preview" className={styles.adminThumb} />
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button type="submit" className={styles.adminButton}>Save</button>
                <button type="button" onClick={() => { setEditingProduct(null); setEditImageFile(null); if (editImagePreview) URL.revokeObjectURL?.(editImagePreview); setEditImagePreview(null); }} className={styles.adminButton}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sale Modal */}
      {saleModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <h3>Apply Sale - {saleModal.name}</h3>
            <form onSubmit={applySale} className={styles.modalForm}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Sale Percentage (%)
                </label>
                <input
                  className={styles.adminInput}
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Enter percentage (1-100)"
                  value={saleForm.salePercentage}
                  onChange={(e) => setSaleForm({ ...saleForm, salePercentage: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Sale End Date
                </label>
                <input
                  className={styles.adminInput}
                  type="date"
                  value={saleForm.saleEndDate}
                  onChange={(e) => setSaleForm({ ...saleForm, saleEndDate: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button type="submit" className={styles.adminButton}>Apply Sale</button>
                <button type="button" onClick={() => { setSaleModal(null); setSaleForm({ salePercentage: "", saleEndDate: "" }); }} className={styles.adminButton}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
      <Footer/>
    </div>
  );
}
