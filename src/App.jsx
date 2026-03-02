import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import AdminGuard from './components/AdminGuard';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Library from './pages/Library';
import Plans from './pages/Plans';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import AdminUpload from './pages/AdminUpload';
import Settings from './pages/Settings';

function App() {
  // v1.2.4 - White Label Player Fix
  console.log("Karaoke Studio v1.2.4 - Player Polished");
  return (
    <Router>
      <div className="fixed top-0 left-0 z-[9999] bg-primary text-white text-[10px] px-2 font-bold pointer-events-none tracking-tighter shadow-md">v1.2.4 SYNC</div>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="cart" element={<Cart />} />
          <Route path="plans" element={<Plans />} />

          {/* Rotas Protegidas */}
          <Route element={<AuthGuard />}>
            <Route path="library" element={<Library />} />
            <Route path="settings" element={<Settings />} />
            <Route path="checkout" element={<Checkout />} />
            {/* Rotas Administrativas */}
            <Route element={<AdminGuard />}>
              <Route path="/upload" element={<AdminUpload />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
