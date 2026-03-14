import "./App.css";
import Navbar from "./assets/index/navbar";
import { Route, Routes } from "react-router-dom";
import Body from "./assets/index/body";
import Cards from "./assets/index/cards";
import Para from "./assets/index/para";
import Footer from "./assets/index/footer";
import Categories from "./assets/categories/main";
import CategoryProducts from "./assets/categories/CategoryProducts";
import ProductDetails from "./assets/categories/ProductDetails";
import Contact from "./assets/contact/main";
import WhyUs from "./assets/why-us/main";
import Login from "./assets/index/login";
import Sign from "./assets/index/sign";
import CartPage from "./assets/index/cart";
import CheckoutPage from "./assets/index/checkout";
import ProfilePage from "./assets/index/profile";
import RequireAuth from "./assets/index/RequireAuth";
import AdminApp from "./admin/Adminapp";
import RequireAdmin from "./admin/RequireAdmin";
import AdminLogin from "./admin/Pages/AdminLogin";

function App() {
  return (
    <div>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="bg-[url(https://images.unsplash.com/photo-1484788984921-03950022c9ef?q=80&w=2132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] pt-1 bg-cover bg-center">
                  <Navbar />
                  <Body />
                </div>

                <Cards />
                <Para />
                <Footer />
              </>
            }
          />

          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:categoryKey" element={<CategoryProducts />} />
          <Route path="/product/:productId" element={<ProductDetails />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/why-us" element={<WhyUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Sign />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

          <Route path="/admin/*" element={<RequireAdmin><AdminApp /></RequireAdmin>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
