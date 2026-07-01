/* NOVA - Premium Tech Store
   Vanilla JS SPA: routing, products, cart, wishlist, checkout, admin
*/

/* ---------- DATA ---------- */
const DEFAULT_PRODUCTS = [
  {id:1,name:"Nova Pro X1 Smartphone",cat:"Smartphones",price:899,old:1099,rating:4.8,emoji:"📱",desc:"Flagship smartphone with edge-to-edge OLED, triple camera and titanium frame."},
  {id:2,name:"Nova Lite 5G",cat:"Smartphones",price:499,old:599,rating:4.6,emoji:"📱",desc:"Affordable 5G phone with smooth 120Hz display and all-day battery."},
  {id:3,name:"Nova Ultra Fold",cat:"Smartphones",price:1499,old:1799,rating:4.7,emoji:"📱",desc:"Foldable display, multitasking powerhouse and stunning hinge design."},
  {id:4,name:"Nova Watch Series 8",cat:"Smartwatches",price:349,old:399,rating:4.7,emoji:"⌚",desc:"Health tracking, AMOLED always-on display, 7-day battery life."},
  {id:5,name:"Nova Watch SE",cat:"Smartwatches",price:199,old:249,rating:4.5,emoji:"⌚",desc:"Essential smartwatch with fitness tracking and notifications."},
  {id:6,name:"Nova Buds Pro",cat:"Earbuds",price:179,old:229,rating:4.6,emoji:"🎧",desc:"Active noise cancellation, spatial audio, 30-hour battery with case."},
  {id:7,name:"Nova Buds Air",cat:"Earbuds",price:99,old:129,rating:4.4,emoji:"🎧",desc:"Lightweight earbuds with deep bass and water resistance."},
  {id:8,name:"Nova Studio Headphones",cat:"Headphones",price:299,old:349,rating:4.9,emoji:"🎧",desc:"Over-ear studio quality with adaptive ANC and premium comfort."},
  {id:9,name:"Nova Bass Max",cat:"Headphones",price:159,old:199,rating:4.5,emoji:"🎧",desc:"Wireless headphones tuned for bass lovers, 40h battery."},
  {id:10,name:"Nova MechKey 75",cat:"Keyboards",price:159,old:199,rating:4.8,emoji:"⌨️",desc:"75% mechanical keyboard, hot-swappable switches, RGB lighting."},
  {id:11,name:"Nova Silent Type",cat:"Keyboards",price:129,old:159,rating:4.5,emoji:"⌨️",desc:"Low-profile silent keyboard ideal for office and creators."},
  {id:12,name:"Nova Pulse Mouse",cat:"Gaming Accessories",price:79,old:99,rating:4.7,emoji:"🖱️",desc:"Pro gaming mouse with 26K DPI sensor and ultralight body."},
  {id:13,name:"Nova Pad XL",cat:"Gaming Accessories",price:39,old:49,rating:4.6,emoji:"🎮",desc:"Extended desk mat with RGB edge lighting and stitched borders."},
  {id:14,name:"Nova Book Pro 14",cat:"Laptops",price:1599,old:1899,rating:4.9,emoji:"💻",desc:"14-inch performance laptop with Nova M-series chip and 18h battery."},
  {id:15,name:"Nova Book Air 13",cat:"Laptops",price:1099,old:1299,rating:4.7,emoji:"💻",desc:"Ultraportable 13-inch laptop, fanless design, all-day battery."},
  {id:16,name:"Nova Game Pad",cat:"Gaming Accessories",price:69,old:89,rating:4.5,emoji:"🎮",desc:"Wireless controller with hall-effect sticks and rapid charging."},
];

const CATEGORIES = ["Smartphones","Smartwatches","Earbuds","Headphones","Keyboards","Gaming Accessories","Laptops"];
const CAT_ICONS = {"Smartphones":"📱","Smartwatches":"⌚","Earbuds":"🎧","Headphones":"🎧","Keyboards":"⌨️","Gaming Accessories":"🎮","Laptops":"💻"};

const SAMPLE_REVIEWS = [
  {name:"Aarav S.",rating:5,text:"Build quality is insane. Feels like a ₹2000 product. NOVA never disappoints."},
  {name:"Priya M.",rating:5,text:"Shipping was fast and packaging premium. Loving the design."},
  {name:"Daniel K.",rating:4,text:"Performance is great, battery life better than expected."},
];

/* ---------- STATE ---------- */
const LS = {
  get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}},
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)),
};
let state = {
  products: LS.get("nova_products", DEFAULT_PRODUCTS),
  cart: LS.get("nova_cart", []),
  wishlist: LS.get("nova_wishlist", []),
  recent: LS.get("nova_recent", []),
  orders: LS.get("nova_orders", []),
  filter: {cat:"All",q:"",sort:"featured",max:2000},
  coupon: null,
};
function save(){
  LS.set("nova_products",state.products);
  LS.set("nova_cart",state.cart);
  LS.set("nova_wishlist",state.wishlist);
  LS.set("nova_recent",state.recent);
  LS.set("nova_orders",state.orders);
}

/* ---------- HELPERS ---------- */
const $ = s => document.querySelector(s);
const app = $("#app");
const toast = (msg)=>{const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("show"),2200)};
const fmt = n => "₹"+n.toFixed(2);
const stars = n => {const f=Math.round(n);return "★".repeat(f)+"☆".repeat(5-f)};
const updateBadges = ()=>{
  $("#cartBadge").textContent = state.cart.reduce((a,c)=>a+c.qty,0);
  $("#wishBadge").textContent = state.wishlist.length;
};

function trackRecent(id){
  state.recent = [id, ...state.recent.filter(x=>x!==id)].slice(0,6);
  save();
}

/* ---------- ROUTING ---------- */
const routes = {};
function route(name, fn){routes[name]=fn}
function go(name, params){
  window.scrollTo({top:0,behavior:"instant"});
  closeMenu();
  const fn = routes[name] || routes.home;
  app.innerHTML = "";
  fn(params||{});
  initReveal();
}
document.addEventListener("click",e=>{
  const r = e.target.closest("[data-route]");
  if(r){e.preventDefault();go(r.dataset.route,{cat:r.dataset.cat})}
  if(e.target.matches("[data-close]")||e.target.closest(".modal-close")){closeModal()}
});

/* secret admin: triple-click logo */
let logoClicks=0,logoTimer;
document.querySelector(".logo").addEventListener("click",()=>{
  logoClicks++;clearTimeout(logoTimer);
  logoTimer=setTimeout(()=>logoClicks=0,800);
  if(logoClicks>=3){logoClicks=0;go("admin")}
});

/* ---------- NAV / SEARCH ---------- */
const menuBtn=$("#menuBtn"),navLinks=$("#navLinks");
menuBtn.addEventListener("click",()=>{navLinks.classList.toggle("open");menuBtn.classList.toggle("active")});
function closeMenu(){navLinks.classList.remove("open");menuBtn.classList.remove("active")}
$("#searchToggle").addEventListener("click",()=>{
  $("#searchBar").classList.toggle("open");
  setTimeout(()=>$("#searchInput").focus(),100);
});
$("#searchInput").addEventListener("input",e=>{
  state.filter.q = e.target.value.toLowerCase();
  go("products");
});

/* ---------- CART / WISHLIST ---------- */
function addToCart(id){
  const p = state.products.find(x=>x.id===id);
  const ex = state.cart.find(x=>x.id===id);
  if(ex) ex.qty++; else state.cart.push({id,qty:1,name:p.name,price:p.price,emoji:p.emoji});
  save();updateBadges();toast("Added to cart");
}
function removeFromCart(id){state.cart=state.cart.filter(x=>x.id!==id);save();updateBadges();go("cart")}
function setQty(id,d){
  const it=state.cart.find(x=>x.id===id);if(!it)return;
  it.qty+=d;if(it.qty<=0)state.cart=state.cart.filter(x=>x.id!==id);
  save();updateBadges();go("cart");
}
function toggleWish(id){
  if(state.wishlist.includes(id)){state.wishlist=state.wishlist.filter(x=>x!==id);toast("Removed from wishlist")}
  else{state.wishlist.push(id);toast("Added to wishlist")}
  save();updateBadges();
}

/* ---------- CARDS ---------- */
function productCardHTML(p){
  const wished = state.wishlist.includes(p.id);
  return `<article class="product-card reveal">
    <div class="product-image" data-route="product" data-cat="${p.id}">${p.emoji}
      <button class="wish-btn ${wished?'active':''}" onclick="event.stopPropagation();toggleWish(${p.id});this.classList.toggle('active')">${wished?'♥':'♡'}</button>
    </div>
    <div class="product-info">
      <span class="product-cat">${p.cat}</span>
      <h3 class="product-name" data-route="product" data-cat="${p.id}">${p.name}</h3>
      <div class="product-rating"><span class="stars">${stars(p.rating)}</span> ${p.rating}</div>
      <div class="product-bottom">
        <div class="product-price">${fmt(p.price)} <small>${fmt(p.old)}</small></div>
        <button class="add-cart-btn" onclick="addToCart(${p.id})" aria-label="Add to cart">+</button>
      </div>
    </div>
  </article>`;
}

/* ---------- PAGES ---------- */
route("home",()=>{
  const featured = state.products.slice(0,8);
  const best = [...state.products].sort((a,b)=>b.rating-a.rating).slice(0,4);
  const recent = state.recent.map(id=>state.products.find(p=>p.id===id)).filter(Boolean).slice(0,4);
  app.innerHTML = `
  <section class="hero">
    <span class="hero-eyebrow">New · 2026 Collection</span>
    <h1>Premium Tech.<br><span class="grad">Designed For The Future.</span></h1>
    <p>Discover a curated lineup of devices engineered for performance, designed for elegance.</p>
    <div class="hero-cta">
      <a class="btn btn-primary" data-route="products">Shop Now →</a>
      <a class="btn btn-ghost" data-route="about">Learn More</a>
    </div>
  </section>

  <section class="section">
    <div class="section-head"><h2>Categories</h2><a data-route="products">View all →</a></div>
    <div class="cat-grid">
      ${CATEGORIES.map(c=>`<div class="cat-card reveal" data-route="products" data-cat="${c}">
        <div class="cat-icon">${CAT_ICONS[c]}</div><h3>${c}</h3>
        <p>${state.products.filter(p=>p.cat===c).length} items</p></div>`).join("")}
    </div>
  </section>

  <section class="section">
    <div class="section-head"><h2>Featured Products</h2><a data-route="products">See all →</a></div>
    <div class="product-grid">${featured.map(productCardHTML).join("")}</div>
  </section>

  <section class="section">
    <div class="section-head"><h2>Best Sellers</h2></div>
    <div class="product-grid">${best.map(productCardHTML).join("")}</div>
  </section>

  ${recent.length?`<section class="section">
    <div class="section-head"><h2>Recently Viewed</h2></div>
    <div class="product-grid">${recent.map(productCardHTML).join("")}</div>
  </section>`:""}

  <section class="newsletter reveal">
    <h2>Join the NOVA insider list</h2>
    <p>Get early access to drops, exclusive offers and product reveals.</p>
    <form class="newsletter-form" onsubmit="event.preventDefault();toast('Subscribed ✓');this.reset()">
      <input type="email" required placeholder="you@example.com" />
      <button class="btn btn-primary" type="submit">Subscribe</button>
    </form>
  </section>`;
  // attach category click via filter
  app.querySelectorAll(".cat-card").forEach(el=>el.addEventListener("click",()=>{
    state.filter.cat = el.dataset.cat;go("products");
  }));
});

route("products",(params)=>{
  if(params && params.cat) state.filter.cat = params.cat;
  const f = state.filter;
  let list = state.products.filter(p=>(f.cat==="All"||p.cat===f.cat) && (!f.q||p.name.toLowerCase().includes(f.q)||p.cat.toLowerCase().includes(f.q)) && p.price<=f.max);
  if(f.sort==="low") list.sort((a,b)=>a.price-b.price);
  else if(f.sort==="high") list.sort((a,b)=>b.price-a.price);
  else if(f.sort==="rating") list.sort((a,b)=>b.rating-a.rating);
  app.innerHTML = `
  <div class="page-head"><h1>All Products</h1><p class="muted">${list.length} items found</p></div>
  <div class="filters">
    ${["All",...CATEGORIES].map(c=>`<button class="filter-chip ${f.cat===c?'active':''}" data-c="${c}">${c}</button>`).join("")}
  </div>
  <div class="filter-bar">
    <select id="sortSel">
      <option value="featured" ${f.sort==='featured'?'selected':''}>Featured</option>
      <option value="low" ${f.sort==='low'?'selected':''}>Price: Low to High</option>
      <option value="high" ${f.sort==='high'?'selected':''}>Price: High to Low</option>
      <option value="rating" ${f.sort==='rating'?'selected':''}>Top Rated</option>
    </select>
    <input type="number" id="maxPrice" placeholder="Max price" value="${f.max}" />
  </div>
  <section class="section" style="padding-top:8px">
    ${list.length?`<div class="product-grid">${list.map(productCardHTML).join("")}</div>`:
    `<div class="empty"><div class="empty-icon">🔍</div><h2>No products found</h2><p>Try a different search or filter.</p></div>`}
  </section>`;
  app.querySelectorAll(".filter-chip").forEach(b=>b.addEventListener("click",()=>{state.filter.cat=b.dataset.c;go("products")}));
  $("#sortSel").addEventListener("change",e=>{state.filter.sort=e.target.value;go("products")});
  $("#maxPrice").addEventListener("change",e=>{state.filter.max=+e.target.value||2000;go("products")});
});

route("product",({cat:id})=>{
  const p = state.products.find(x=>x.id===+id);
  if(!p){app.innerHTML=`<div class="empty"><h2>Product not found</h2></div>`;return}
  trackRecent(p.id);
  const wished = state.wishlist.includes(p.id);
  const related = state.products.filter(x=>x.cat===p.cat&&x.id!==p.id).slice(0,4);
  app.innerHTML = `
  <section class="detail">
    <div class="detail-img"><div>${p.emoji}</div></div>
    <div class="detail-info">
      <span class="product-cat">${p.cat}</span>
      <h1>${p.name}</h1>
      <div class="product-rating"><span class="stars">${stars(p.rating)}</span> ${p.rating} · 248 reviews</div>
      <div class="price">${fmt(p.price)} <small style="font-size:18px;text-decoration:line-through;color:var(--muted);font-weight:400">${fmt(p.old)}</small></div>
      <p class="desc">${p.desc}</p>
      <div class="detail-actions">
        <button class="btn btn-primary" onclick="addToCart(${p.id})">Add to Cart</button>
        <button class="btn btn-ghost" onclick="toggleWish(${p.id});go('product',{cat:${p.id}})">${wished?'♥ Wishlisted':'♡ Wishlist'}</button>
      </div>
      <div class="detail-meta">
        <div><span>Category</span><span>${p.cat}</span></div>
        <div><span>Free Shipping</span><span>On orders over ₹50</span></div>
        <div><span>Warranty</span><span>2 Years</span></div>
        <div><span>In Stock</span><span style="color:var(--accent-hover)">Available</span></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-head"><h2>Customer Reviews</h2></div>
    <div class="reviews">
      ${SAMPLE_REVIEWS.map(r=>`<div class="review-card reveal">
        <div class="review-head"><div class="review-name">${r.name}</div><div class="stars">${stars(r.rating)}</div></div>
        <div class="review-text">${r.text}</div></div>`).join("")}
    </div>
  </section>

  ${related.length?`<section class="section">
    <div class="section-head"><h2>You may also like</h2></div>
    <div class="product-grid">${related.map(productCardHTML).join("")}</div>
  </section>`:""}`;
});

route("wishlist",()=>{
  const items = state.wishlist.map(id=>state.products.find(p=>p.id===id)).filter(Boolean);
  app.innerHTML = `<div class="page-head"><h1>Wishlist</h1><p class="muted">${items.length} saved items</p></div>
  <section class="section" style="padding-top:8px">
    ${items.length?`<div class="product-grid">${items.map(productCardHTML).join("")}</div>`:
    `<div class="empty"><div class="empty-icon">♡</div><h2>Your wishlist is empty</h2><p>Save items you love for later.</p><a class="btn btn-primary" data-route="products">Browse Products</a></div>`}
  </section>`;
});

route("cart",()=>{
  if(!state.cart.length){
    app.innerHTML = `<div class="empty"><div class="empty-icon">🛒</div><h2>Your cart is empty</h2><p>Add some premium gadgets to get started.</p><a class="btn btn-primary" data-route="products">Shop Now</a></div>`;
    return;
  }
  const sub = state.cart.reduce((a,c)=>a+c.qty*c.price,0);
  const shipping = sub>=50?0:9.99;
  const discount = state.coupon? sub*state.coupon.pct/100 : 0;
  const total = sub+shipping-discount;
  app.innerHTML = `
  <div class="page-head"><h1>Shopping Cart</h1><p class="muted">${state.cart.length} items</p></div>
  <div class="cart-wrap">
    <div>
      ${state.cart.map(it=>`<div class="cart-item reveal">
        <div class="cart-img">${it.emoji}</div>
        <div class="cart-info">
          <div class="cart-name">${it.name}</div>
          <div class="cart-price">${fmt(it.price)}</div>
          <div class="cart-row">
            <div class="qty">
              <button onclick="setQty(${it.id},-1)">−</button>
              <span>${it.qty}</span>
              <button onclick="setQty(${it.id},1)">+</button>
            </div>
            <button class="cart-remove" onclick="removeFromCart(${it.id})">Remove</button>
          </div>
        </div>
      </div>`).join("")}
    </div>
    <div class="summary">
      <h3>Order Summary</h3>
      <div class="coupon-row">
        <input id="coupon" placeholder="Coupon code" value="${state.coupon?state.coupon.code:''}"/>
        <button onclick="applyCoupon()">Apply</button>
      </div>
      <div class="summary-row"><span>Subtotal</span><span>${fmt(sub)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${shipping?fmt(shipping):'Free'}</span></div>
      ${discount?`<div class="summary-row" style="color:var(--accent-hover)"><span>Discount (${state.coupon.code})</span><span>−${fmt(discount)}</span></div>`:""}
      <div class="summary-row total"><span>Total</span><span>${fmt(total)}</span></div>
      <button class="btn btn-primary btn-block" style="margin-top:16px" onclick="go('checkout')">Proceed to Checkout</button>
    </div>
  </div>`;
});

function applyCoupon(){
  const code = $("#coupon").value.trim().toUpperCase();
  const codes = {WELCOME10:10, TECH20:20};
  if(codes[code]){state.coupon={code,pct:codes[code]};toast("Coupon applied: "+codes[code]+"% off");go("cart")}
  else{state.coupon=null;toast("Invalid coupon");go("cart")}
}

route("checkout",()=>{
  if(!state.cart.length){go("cart");return}
  const sub = state.cart.reduce((a,c)=>a+c.qty*c.price,0);
  const shipping = sub>=50?0:9.99;
  const discount = state.coupon? sub*state.coupon.pct/100 : 0;
  const total = sub+shipping-discount;
  app.innerHTML = `
  <div class="page-head"><h1>Checkout</h1></div>
  <div class="cart-wrap">
    <form class="form-card" id="checkoutForm">
      <h2>Shipping Details</h2>
      <div class="form-row two">
        <input required placeholder="Full Name" />
        <input required type="email" placeholder="Email" />
      </div>
      <div class="form-row two">
        <input required placeholder="Phone Number" />
        <input required placeholder="City" />
      </div>
      <textarea required rows="3" placeholder="Full Address"></textarea>
      <h2 style="margin-top:8px">Payment Method</h2>
      <div class="pay-options">
        <label class="pay-option active"><input type="radio" name="pay" value="UPI" checked /> 💳 UPI</label>
        <label class="pay-option"><input type="radio" name="pay" value="Card" /> 💳 Credit / Debit Card</label>
        <label class="pay-option"><input type="radio" name="pay" value="COD" /> 📦 Cash On Delivery</label>
      </div>
      <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px">Place Order · ${fmt(total)}</button>
    </form>
    <div class="summary">
      <h3>Order Summary</h3>
      ${state.cart.map(it=>`<div class="summary-row"><span>${it.name} × ${it.qty}</span><span>${fmt(it.price*it.qty)}</span></div>`).join("")}
      <div class="summary-row"><span>Shipping</span><span>${shipping?fmt(shipping):'Free'}</span></div>
      ${discount?`<div class="summary-row" style="color:var(--accent-hover)"><span>Discount</span><span>−${fmt(discount)}</span></div>`:""}
      <div class="summary-row total"><span>Total</span><span>${fmt(total)}</span></div>
    </div>
  </div>`;
  app.querySelectorAll(".pay-option").forEach(o=>o.addEventListener("click",()=>{
    app.querySelectorAll(".pay-option").forEach(x=>x.classList.remove("active"));o.classList.add("active");
  }));
  $("#checkoutForm").addEventListener("submit",e=>{
    e.preventDefault();
    const orderId = "NV"+Date.now().toString().slice(-8);
    const order = {id:orderId, items:state.cart, total, date:new Date().toISOString()};
    state.orders.push(order);
    state.cart=[];state.coupon=null;save();updateBadges();
    go("success",{cat:orderId});
  });
});

route("success",({cat:orderId})=>{
  const eta = new Date(Date.now()+5*24*60*60*1000).toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"});
  app.innerHTML = `<div class="success">
    <div class="success-icon">✓</div>
    <h1>Order Placed!</h1>
    <p class="muted">Thank you for shopping with NOVA. We've sent a confirmation to your email.</p>
    <div class="success-card">
      <div><span>Order ID</span><span style="font-weight:700">#${orderId||"NV"+Date.now()}</span></div>
      <div><span>Status</span><span style="color:var(--accent-hover);font-weight:600">Confirmed</span></div>
      <div><span>Estimated Delivery</span><span>${eta}</span></div>
    </div>
    <a class="btn btn-primary" data-route="home">Continue Shopping</a>
  </div>`;
});

route("about",()=>{
  app.innerHTML = `<div class="prose">
    <h1>About NOVA</h1>
    <p>NOVA is a premium tech brand obsessed with the intersection of design and engineering. We craft products that feel inevitable — minimal in form, maximal in capability.</p>
    <p>Founded in 2024 by a team of designers and engineers, NOVA exists to bring world-class hardware to people who care about details.</p>
    <div class="value-grid">
      <div class="value-card reveal"><div class="ico">⚡</div><h3>Performance</h3><p>Built on silicon optimized for the next decade of computing.</p></div>
      <div class="value-card reveal"><div class="ico">🎨</div><h3>Design</h3><p>Every curve, finish and material is deliberate.</p></div>
      <div class="value-card reveal"><div class="ico">🌱</div><h3>Sustainability</h3><p>Recycled aluminum and carbon-neutral shipping.</p></div>
    </div>
  </div>`;
});

route("contact",()=>{
  app.innerHTML = `<div class="prose">
    <h1>Get in touch</h1>
    <p>We'd love to hear from you. Reach out to our team for support, partnerships, or just to say hello.</p>
    <form class="form-card" onsubmit="event.preventDefault();toast('Message sent ✓');this.reset()" style="margin-top:24px">
      <div class="form-row two">
        <input required placeholder="Your name"/>
        <input required type="email" placeholder="Your email"/>
      </div>
      <input required placeholder="Subject"/>
      <textarea required rows="5" placeholder="Your message..."></textarea>
      <button class="btn btn-primary" type="submit">Send Message</button>
    </form>
    <div class="value-grid" style="margin-top:24px">
      <div class="value-card"><div class="ico">📧</div><h3>Email</h3><p>hello@nova.tech</p></div>
      <div class="value-card"><div class="ico">📞</div><h3>Phone</h3><p>+1 (555) 010-0123</p></div>
      <div class="value-card"><div class="ico">📍</div><h3>HQ</h3><p>San Francisco, CA</p></div>
    </div>
  </div>`;
});

route("admin",()=>{
  const totalRev = state.orders.reduce((a,o)=>a+o.total,0);
  app.innerHTML = `<div class="admin">
    <h1>Admin Dashboard</h1>
    <div class="stat-grid">
      <div class="stat-card"><div class="num">${state.products.length}</div><div class="lbl">Products</div></div>
      <div class="stat-card"><div class="num">${state.orders.length}</div><div class="lbl">Orders</div></div>
      <div class="stat-card"><div class="num">${fmt(totalRev)}</div><div class="lbl">Revenue</div></div>
      <div class="stat-card"><div class="num">${state.wishlist.length}</div><div class="lbl">Wishlisted</div></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:8px;flex-wrap:wrap">
      <h2 style="font-size:20px">Products</h2>
      <button class="btn btn-primary" onclick="adminEdit()">+ Add Product</button>
    </div>
    <div style="overflow-x:auto"><table class="admin-table">
      <thead><tr><th>Name</th><th>Cat</th><th>Price</th><th>Rating</th><th></th></tr></thead>
      <tbody>
      ${state.products.map(p=>`<tr>
        <td>${p.emoji} ${p.name}</td><td>${p.cat}</td><td>${fmt(p.price)}</td><td>${p.rating}</td>
        <td class="act"><button onclick="adminEdit(${p.id})">Edit</button><button onclick="adminDel(${p.id})">Delete</button></td>
      </tr>`).join("")}
      </tbody>
    </table></div>
  </div>`;
});

function adminEdit(id){
  const p = id? state.products.find(x=>x.id===id) : {id:Date.now(),name:"",cat:CATEGORIES[0],price:0,old:0,rating:5,emoji:"📦",desc:""};
  openModal(`<h2>${id?'Edit':'Add'} Product</h2>
    <div class="form-row" style="display:grid;gap:12px;margin-top:12px">
      <input id="ax_name" placeholder="Name" value="${p.name}"/>
      <select id="ax_cat">${CATEGORIES.map(c=>`<option ${c===p.cat?'selected':''}>${c}</option>`).join("")}</select>
      <div class="form-row two">
        <input id="ax_price" type="number" placeholder="Price" value="${p.price}"/>
        <input id="ax_old" type="number" placeholder="Old price" value="${p.old}"/>
      </div>
      <div class="form-row two">
        <input id="ax_rating" type="number" step="0.1" placeholder="Rating" value="${p.rating}"/>
        <input id="ax_emoji" placeholder="Emoji" value="${p.emoji}"/>
      </div>
      <textarea id="ax_desc" rows="3" placeholder="Description">${p.desc}</textarea>
      <button class="btn btn-primary" onclick="adminSave(${p.id})">Save Product</button>
    </div>`);
}
function adminSave(id){
  const p = {
    id, name:$("#ax_name").value, cat:$("#ax_cat").value,
    price:+$("#ax_price").value, old:+$("#ax_old").value,
    rating:+$("#ax_rating").value, emoji:$("#ax_emoji").value||"📦",
    desc:$("#ax_desc").value,
  };
  const ex = state.products.findIndex(x=>x.id===id);
  if(ex>=0) state.products[ex]=p; else state.products.push(p);
  save();closeModal();go("admin");toast("Product saved");
}
function adminDel(id){
  if(!confirm("Delete this product?"))return;
  state.products = state.products.filter(x=>x.id!==id);
  save();go("admin");toast("Product deleted");
}

/* ---------- MODAL ---------- */
function openModal(html){
  const c=$("#modalCard");
  c.innerHTML = `<button class="modal-close" data-close>✕</button>${html}`;
  $("#modal").classList.add("open");
}
function closeModal(){$("#modal").classList.remove("open")}

/* ---------- REVEAL ON SCROLL ---------- */
function initReveal(){
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}});
  },{threshold:.1});
  els.forEach(el=>io.observe(el));
}

/* ---------- BOOT ---------- */
updateBadges();
go("home");
