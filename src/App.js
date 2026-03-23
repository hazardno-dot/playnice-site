import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import "./App.css";

const PRODUCTS = [
  {
    id: 1,
    name: "Afnan 9PM",
    size: "10ml",
    price: 9,
    image: "https://via.placeholder.com/300x300?text=Afnan+9PM",
  },
  {
    id: 2,
    name: "Turathi Blue",
    size: "10ml",
    price: 9,
    image: "https://via.placeholder.com/300x300?text=Turathi+Blue",
  },
  {
    id: 3,
    name: "Cedrat Boise",
    size: "10ml",
    price: 14,
    image: "https://via.placeholder.com/300x300?text=Cedrat+Boise",
  },
  {
    id: 4,
    name: "Club de Nuit Intense",
    size: "10ml",
    price: 8,
    image: "https://via.placeholder.com/300x300?text=CDN+Intense",
  },
];

function App() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("playnice_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("playnice_cart", JSON.stringify(cart));
  }, [cart]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            PlayNice
          </Link>

          <nav className="nav">
            <Link to="/">Shop</Link>
            <Link to="/cart">Korpa ({cartCount})</Link>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={<ShopPage products={PRODUCTS} addToCart={addToCart} />}
          />
          <Route
            path="/cart"
            element={
              <CartPage
                cart={cart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
            }
          />
          <Route
            path="/checkout"
            element={<CheckoutPage cart={cart} clearCart={clearCart} />}
          />
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </main>
    </div>
  );
}

function ShopPage({ products, addToCart }) {
  const [addedId, setAddedId] = useState(null);

  const handleAdd = (product) => {
    addToCart(product);
    setAddedId(product.id);

    setTimeout(() => {
      setAddedId(null);
    }, 1200);
  };

  return (
    <div className="container">
      <h1 className="page-title">Shop</h1>

      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <img src={product.image} alt={product.name} className="product-image" />

            <div className="product-info">
              <h2>{product.name}</h2>
              <p>{product.size}</p>
              <strong>€{product.price}</strong>
            </div>

            <button className="primary-btn" onClick={() => handleAdd(product)}>
              {addedId === product.id ? "Added ✓" : "Add to cart"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CartPage({ cart, updateQuantity, removeFromCart }) {
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = cart.length > 0 ? 3.5 : 0;
  const total = subtotal + shipping;

  return (
    <div className="container">
      <h1 className="page-title">Korpa</h1>

      {cart.length === 0 ? (
        <div className="empty-state">
          <p>Tvoja korpa je trenutno prazna.</p>
          <Link to="/" className="primary-btn inline-btn">
            Nazad na shop
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} className="cart-item-image" />

                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>{item.size}</p>
                  <p>€{item.price}</p>
                </div>

                <div className="cart-controls">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  €{(item.price * item.quantity).toFixed(2)}
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Ukloni
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Pregled porudžbine</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Dostava</span>
              <span>€{shipping.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Ukupno</span>
              <span>€{total.toFixed(2)}</span>
            </div>

            <button
              className="primary-btn checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Nastavi na obračun
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckoutPage({ cart, clearCart }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    note: "",
    paymentMethod: "cash_on_delivery",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/cart");
    }
  }, [cart, navigate]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = cart.length > 0 ? 3.5 : 0;
  const total = subtotal + shipping;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "Unesi ime";
    if (!formData.lastName.trim()) newErrors.lastName = "Unesi prezime";
    if (!formData.phone.trim()) newErrors.phone = "Unesi telefon";
    if (!formData.city.trim()) newErrors.city = "Unesi grad";
    if (!formData.address.trim()) newErrors.address = "Unesi adresu";

    if (!formData.email.trim()) {
      newErrors.email = "Unesi email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email nije ispravan";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const orderData = {
      customer: formData,
      items: cart,
      subtotal,
      shipping,
      total,
      createdAt: new Date().toISOString(),
    };

    console.log("ORDER DATA:", orderData);

    localStorage.setItem("playnice_last_order", JSON.stringify(orderData));
    clearCart();
    navigate("/success");
  };

  return (
    <div className="container">
      <h1 className="page-title">Obračun</h1>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Podaci za dostavu</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Ime</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label>Prezime</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>

            <div className="form-group">
              <label>Telefon</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Grad</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
              {errors.city && <span className="error-text">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label>Adresa</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Napomena za dostavu</label>
            <textarea
              name="note"
              rows="4"
              value={formData.note}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Način plaćanja</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
            >
              <option value="cash_on_delivery">Plaćanje pouzećem</option>
              <option value="bank_transfer">Uplata na račun</option>
            </select>
          </div>

          <button type="submit" className="primary-btn checkout-btn">
            Potvrdi porudžbinu
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Tvoja porudžbina</h2>

          {cart.map((item) => (
            <div className="checkout-item" key={item.id}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>€{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="summary-row">
            <span>Subtotal</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Dostava</span>
            <span>€{shipping.toFixed(2)}</span>
          </div>

          <div className="summary-row total-row">
            <span>Ukupno</span>
            <span>€{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessPage() {
  return (
    <div className="container">
      <div className="success-box">
        <h1>Porudžbina uspešno poslata</h1>
        <p>Hvala ti na porudžbini. Kontaktiraćemo te uskoro radi potvrde.</p>
        <Link to="/" className="primary-btn inline-btn">
          Nazad na shop
        </Link>
      </div>
    </div>
  );
}

export default App;
