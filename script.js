const API="/api";
let products=[], cart=JSON.parse(localStorage.getItem("moosweet_cart")||"[]"), currentUser=null;

async function api(path,options={}){
 const res=await fetch(API+path,{credentials:"include",headers:{"Content-Type":"application/json",...(options.headers||{})},...options});
 const data=await res.json().catch(()=>({}));
 if(!res.ok)throw new Error(data.message||"เกิดข้อผิดพลาด");
 return data;
}
async function loadProducts(){
 try{products=await api("/products");}catch(e){products=[];}
}
async function loadMe(){
 try{currentUser=(await api("/auth/me")).customer;}catch(e){currentUser=null;}
 updateAuthUI();
}
function updateAuthUI(){
 document.querySelectorAll(".menu").forEach(menu=>{
  const auth=menu.querySelector("#authLink"), admin=menu.querySelector("#adminLink"), orders=menu.querySelector("#ordersLink"), logoutBtn=menu.querySelector("#logoutBtn");
  if(auth){auth.href=currentUser?"orders.html":"login.html";auth.textContent=currentUser?`สวัสดี ${currentUser.username}`:"เข้าสู่ระบบ";}
  if(admin)admin.style.display=currentUser?.role==="admin"?"inline":"none";
  if(orders)orders.style.display=currentUser?"inline":"none";
  if(logoutBtn)logoutBtn.style.display=currentUser?"inline-block":"none";
 });
}
async function submitAuth(mode){
 const email=document.getElementById("email").value,password=document.getElementById("password").value;
 const body={email,password};if(mode==="register")body.username=document.getElementById("username").value;
 try{const data=await api("/auth/"+mode,{method:"POST",body:JSON.stringify(body)});currentUser=data.customer;showToast(mode==="login"?"เข้าสู่ระบบสำเร็จ 🎉":"สมัครสมาชิกสำเร็จ 🎉");setTimeout(()=>location.href=currentUser.role==="admin"?"admin.html":"index.html",400);}
 catch(e){document.getElementById("authMsg").textContent=e.message;}
}
async function logout(){
 try{await api("/auth/logout",{method:"POST"});}catch(e){}
 currentUser=null;
 localStorage.removeItem("moosweet_user");
 location.href="index.html";
}
function saveCart(){localStorage.setItem("moosweet_cart",JSON.stringify(cart));}
function productId(p){return String(p?._id??p?.id??"");}
function addToCart(p){
 if(!p)return;
 if(Number(p.quantity)<=0){showToast("สินค้าหมดชั่วคราว");return;}
 const id=productId(p),item=cart.find(x=>String(x.productId)===id);
 if(item){if(item.quantity>=Number(p.quantity)){showToast("สินค้าในตะกร้าถึงจำนวนที่มีในสต็อกแล้ว");return;}item.quantity++;}
 else cart.push({productId:id,name:p.name,price:Number(p.price),quantity:1});
 saveCart();updateCart();showToast(`เพิ่ม ${p.name} ลงตะกร้าแล้ว 🛒`);
}
function changeCartQty(index,delta){
 const item=cart[index],p=products.find(x=>productId(x)===String(item.productId));
 const max=Number(p?.quantity??999999);item.quantity+=delta;
 if(item.quantity>max)item.quantity=max;
 if(item.quantity<=0)cart.splice(index,1);
 saveCart();updateCart();renderCheckout();
}
function removeItem(index){cart.splice(index,1);saveCart();updateCart();renderCheckout();}
function updateCart(){
 const count=document.getElementById("cartCount"),items=document.getElementById("cartItems"),total=document.getElementById("cartTotal");
 const qty=cart.reduce((s,x)=>s+x.quantity,0);if(count)count.textContent=qty;
 if(!items||!total)return;
 if(!cart.length){items.innerHTML='<div class="empty-state">ยังไม่มีสินค้าในตะกร้า</div>';total.textContent="0";return;}
 let sum=0;
 items.innerHTML=cart.map((x,i)=>{sum+=x.price*x.quantity;return `<div class="cart-item"><div><b>${x.name}</b><div class="qty-controls"><button onclick="changeCartQty(${i},-1)">−</button><span>${x.quantity}</span><button onclick="changeCartQty(${i},1)">+</button><button class="cart-remove" onclick="removeItem(${i})">ลบ</button></div></div><strong>฿${(x.price*x.quantity).toLocaleString()}</strong></div>`}).join("");
 total.textContent=sum.toLocaleString();
}
function showCart(){const box=document.getElementById("cartBox"),overlay=document.getElementById("cartOverlay");if(box)box.style.display="block";if(overlay)overlay.style.display="block";}
function closeCart(){const box=document.getElementById("cartBox"),overlay=document.getElementById("cartOverlay");if(box)box.style.display="none";if(overlay)overlay.style.display="none";}
function checkout(){
 if(!cart.length){showToast("กรุณาเลือกสินค้าก่อน");return;}
 if(!currentUser){showToast("กรุณาเข้าสู่ระบบก่อนสั่งซื้อ");setTimeout(()=>location.href="login.html?next=checkout.html",500);return;}
 location.href="checkout.html";
}
function showToast(message){
 document.querySelector(".toast")?.remove();const t=document.createElement("div");t.className="toast";t.textContent=message;document.body.appendChild(t);
 requestAnimationFrame(()=>t.classList.add("show"));setTimeout(()=>{t.classList.remove("show");setTimeout(()=>t.remove(),300)},2500);
}
function renderProducts(){
 const grid=document.getElementById("productGrid");if(!grid)return;
 const search=(document.getElementById("productSearch")?.value||"").trim().toLowerCase(),cat=document.getElementById("categoryFilter")?.value||"",sort=document.getElementById("sortProducts")?.value||"default";
 let list=products.filter(p=>(!search||`${p.name} ${p.description||""}`.toLowerCase().includes(search))&&(!cat||p.category===cat));
 if(sort==="price-asc")list.sort((a,b)=>a.price-b.price);if(sort==="price-desc")list.sort((a,b)=>b.price-a.price);if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name,"th"));
 grid.innerHTML=list.map(p=>`<article class="product-card">${Number(p.quantity)<=0?'<span class="badge badge-best">สินค้าหมด</span>':''}<div class="product-img">${p.imageUrl?`<img src="${p.imageUrl}" alt="${p.name}">`:(p.emoji||"🍰")}</div><h3>${p.name}</h3><p>${p.description||"ขนมโฮมเมดของ MooSweet"}</p><strong>฿${Number(p.price).toLocaleString()}</strong><small>${Number(p.quantity)>0?`เหลือ ${p.quantity} ชิ้น`:"สินค้าหมด"}</small><div class="card-buttons"><a class="detail-btn" href="detail.html?id=${productId(p)}">รายละเอียด</a><button class="add-to-cart-btn" data-id="${productId(p)}" ${Number(p.quantity)<=0?"disabled":""}>เพิ่มลงตะกร้า</button></div></article>`).join("");
 const empty=document.getElementById("productEmpty");if(empty)empty.style.display=list.length?"none":"block";
}
function initFilters(){
 const select=document.getElementById("categoryFilter");if(!select)return;
 [...new Set(products.map(p=>p.category).filter(Boolean))].sort().forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;select.appendChild(o)});
 ["productSearch","categoryFilter","sortProducts"].forEach(id=>document.getElementById(id)?.addEventListener("input",renderProducts));
}
function renderDetail(){
 const c=document.getElementById("detailPage");if(!c)return;
 const id=new URLSearchParams(location.search).get("id"),p=products.find(x=>productId(x)===String(id))||products[0];
 if(!p){c.innerHTML='<div class="empty-state">ไม่พบสินค้านี้</div>';return;}
 c.innerHTML=`<div class="detail-image">${p.imageUrl?`<img src="${p.imageUrl}" alt="${p.name}">`:(p.emoji||"🍰")}</div><div class="detail-info"><span class="eyebrow">${p.category||"MooSweet"}</span><h2>${p.name}</h2><div class="price">฿${Number(p.price).toLocaleString()}</div><p>${p.description||"ขนมโฮมเมดสดใหม่จากร้าน MooSweet"}</p><p>คงเหลือ: <b>${p.quantity} ชิ้น</b></p><div class="detail-buttons"><button class="main-btn add-to-cart-btn" data-id="${productId(p)}" ${Number(p.quantity)<=0?"disabled":""}>🛒 เพิ่มลงตะกร้า</button><a href="index.html#products">← เลือกสินค้าต่อ</a></div></div>`;
}
function renderCheckout(){
 const box=document.getElementById("checkoutItems");if(!box)return;
 let total=0;box.innerHTML=cart.length?cart.map(x=>{total+=x.price*x.quantity;return `<div class="summary-item"><span>${x.name} × ${x.quantity}</span><b>฿${(x.price*x.quantity).toLocaleString()}</b></div>`}).join(""):"<div class='empty-state'>ตะกร้าว่าง</div>";
 const t=document.getElementById("checkoutTotal");if(t)t.textContent=total.toLocaleString();
}
async function initCheckout(){
 const form=document.getElementById("checkoutForm");if(!form)return;
 await loadMe();if(!currentUser){location.href="login.html";return;}
 if(!cart.length){form.innerHTML='<div class="empty-state">ตะกร้าว่าง <a href="index.html#products">กลับไปเลือกสินค้า</a></div>';renderCheckout();return;}
 document.getElementById("checkoutName").value=currentUser.username||"";
 document.getElementById("checkoutPhone").value=currentUser.phone||"";
 form.onsubmit=async e=>{e.preventDefault();
  const body={items:cart.map(x=>({productId:x.productId,quantity:x.quantity})),phone:document.getElementById("checkoutPhone").value,shippingAddress:document.getElementById("checkoutAddress").value,paymentMethod:document.getElementById("paymentMethod").value,note:document.getElementById("checkoutNote").value};
  const btn=form.querySelector("button[type=submit]");btn.disabled=true;
  try{const data=await api("/orders",{method:"POST",body:JSON.stringify(body)});cart=[];saveCart();showToast(`สั่งซื้อสำเร็จ #${String(data.order._id).slice(-6).toUpperCase()} 🎉`);setTimeout(()=>location.href="orders.html",500);}
  catch(err){showToast(err.message);btn.disabled=false;}
 };
 renderCheckout();
}
function initAuthPage(){
 const form=document.getElementById("authForm");if(!form)return;let mode="login";
 document.querySelectorAll(".auth-tab").forEach(btn=>btn.onclick=()=>{mode=btn.dataset.mode;document.querySelectorAll(".auth-tab").forEach(x=>x.classList.toggle("active",x===btn));const u=document.getElementById("username");u.style.display=mode==="register"?"block":"none";u.required=mode==="register";form.querySelector("button").textContent=mode==="register"?"สมัครสมาชิก":"เข้าสู่ระบบ";});
 form.onsubmit=e=>{e.preventDefault();submitAuth(mode)};
}
const STATUS_LABELS={pending:"รอตรวจสอบ",confirmed:"ยืนยันออเดอร์",preparing:"กำลังเตรียม",shipping:"กำลังจัดส่ง",completed:"สำเร็จ",cancelled:"ยกเลิก"};
function orderCard(order,isAdmin=false){
 const date=new Date(order.createdAt).toLocaleString("th-TH"),items=(order.items||[]).map(i=>`<div class="order-row"><span>${i.productName} × ${i.quantity}</span><span>฿${(i.price*i.quantity).toLocaleString()}</span></div>`).join("");
 const status=`<span class="status-badge status-${order.status}">${STATUS_LABELS[order.status]||order.status}</span>`;
 const control=isAdmin?`<select class="status-select" onchange="changeOrderStatus('${order._id}',this.value)">${Object.entries(STATUS_LABELS).map(([k,v])=>`<option value="${k}" ${k===order.status?"selected":""}>${v}</option>`).join("")}</select>`:status;
 return `<article class="order-card"><div class="order-top"><div><h3>ออเดอร์ #${String(order._id).slice(-6).toUpperCase()}</h3><div class="order-meta">${date}${isAdmin?` · ${order.customerName||order.customer?.username||""} · ${order.customerEmail||order.customer?.email||""}`:""}</div></div><div>${control}</div></div><div>${items}</div><div class="order-total">รวม ฿${Number(order.total).toLocaleString()}</div>${order.note?`<p class="order-meta">${order.note}</p>`:""}</article>`;
}
async function initOrders(){
 const box=document.getElementById("myOrders");if(!box)return;await loadMe();
 if(!currentUser){box.innerHTML='<div class="empty-orders">กรุณา <a href="login.html">เข้าสู่ระบบ</a> เพื่อดูคำสั่งซื้อ</div>';return;}
 try{const orders=await api("/orders/history");box.innerHTML=orders.length?orders.map(o=>orderCard(o)).join(""):'<div class="empty-orders">ยังไม่มีคำสั่งซื้อ</div>';}catch(e){box.innerHTML=`<div class="empty-orders">${e.message}</div>`;}
}
function resetProductForm(){document.getElementById("productForm")?.reset();document.getElementById("productId").value="";}
async function initAdmin(){
 const grid=document.getElementById("adminProducts");if(!grid)return;await loadMe();
 if(!currentUser||currentUser.role!=="admin"){location.href="index.html";return;}
 document.getElementById("adminWelcome").textContent=`👑 ${currentUser.username}`;
 async function refresh(){products=await api("/products");grid.innerHTML=products.map(p=>`<article class="product-card"><h3>${p.name}</h3><p>฿${p.price} · คงเหลือ ${p.quantity}</p><div class="admin-product-actions"><button class="secondary-btn" onclick="editProduct('${p._id}')">แก้ไข</button><button class="secondary-btn" onclick="deleteProduct('${p._id}')">ลบ</button></div></article>`).join("");}
 window.editProduct=id=>{const p=products.find(x=>productId(x)===String(id));if(!p)return;productIdEl.value=p._id;pname.value=p.name;pprice.value=p.price;pqty.value=p.quantity;pcat.value=p.category||"";pimage.value=p.imageUrl||"";pdesc.value=p.description||"";scrollTo({top:0,behavior:"smooth"});};
 const productIdEl=document.getElementById("productId");
 window.deleteProduct=async id=>{if(!confirm("ต้องการลบสินค้านี้หรือไม่?"))return;try{await api("/products/"+id,{method:"DELETE"});await refresh();showToast("ลบสินค้าแล้ว");}catch(e){showToast(e.message)}};
 document.getElementById("productForm").onsubmit=async e=>{e.preventDefault();const id=productIdEl.value,body={name:pname.value,price:Number(pprice.value),quantity:Number(pqty.value),category:pcat.value,imageUrl:pimage.value,description:pdesc.value};try{await api(id?"/products/"+id:"/products",{method:id?"PUT":"POST",body:JSON.stringify(body)});resetProductForm();await refresh();showToast("บันทึกสินค้าแล้ว");}catch(err){showToast(err.message)}};
 document.querySelectorAll(".admin-tab").forEach(tab=>tab.onclick=async()=>{document.querySelectorAll(".admin-tab").forEach(x=>x.classList.remove("active"));tab.classList.add("active");const ordersTab=tab.dataset.tab==="orders";adminProductsPanel.style.display=ordersTab?"none":"block";adminOrdersPanel.style.display=ordersTab?"block":"none";if(ordersTab)await refreshAdminOrders();});
 await refresh();
}
async function refreshAdminOrders(){const box=document.getElementById("adminOrders");if(!box)return;try{const orders=await api("/orders/admin");box.innerHTML=orders.length?orders.map(o=>orderCard(o,true)).join(""):'<div class="empty-orders">ยังไม่มีคำสั่งซื้อ</div>';}catch(e){box.innerHTML=`<div class="empty-orders">${e.message}</div>`;}}
window.changeOrderStatus=async(id,status)=>{try{await api(`/orders/${id}/status`,{method:"PATCH",body:JSON.stringify({status})});showToast("อัปเดตสถานะแล้ว");await refreshAdminOrders();}catch(e){showToast(e.message)}};
document.addEventListener("click",e=>{const btn=e.target.closest(".add-to-cart-btn");if(!btn)return;const p=products.find(x=>productId(x)===String(btn.dataset.id));addToCart(p);});
window.addEventListener("DOMContentLoaded",async()=>{
 await loadProducts();await loadMe();initFilters();renderProducts();renderDetail();updateCart();initAuthPage();initCheckout();initAdmin();initOrders();
});
