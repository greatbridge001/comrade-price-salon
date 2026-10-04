/* Comrade Price Salon - all site behaviour in one file.

   WHERE TO EDIT
   1. CONFIG   (just below)  API address, phone numbers, location, Google Maps link, opening hours
   2. DATA                   services and prices, hairstyle gallery, clothes (used until the backend is connected,
                             and as a fallback if it cannot be reached)
   3. CODE                   everything after the DATA section

   PHOTOS
   Every photo is set with a normal src="..." in index.html:
     - the landing-page background  : <img class="hero-bg" src="images/hero.jpg">
     - the About photo              : <img src="images/about.jpg">
     - every gallery + shop photo   : the list inside <template id="photoSources"> near the bottom of index.html
   Replace the src there (a file in the images folder, or a full https:// link). Nothing needs changing in this file.
   If a photo is missing, a simple black and gold tile with the item's name is shown instead.
*/
(function () {
  "use strict";

  /* ============================== 1. CONFIG ============================== */

  // Address of the backend on Railway, for example "https://comrade-price-api.up.railway.app" (no trailing slash).
  // Leave "" to run on the built-in catalogue below (no database, no saved bookings, no staff dashboard).
  var API_URL = "";

  var BUSINESS = {
    name: "Comrade Price Salon",
    shortLocation: "Sogomo, near University of Eldoret",
    fullLocation: "Sogomo, near University of Eldoret, Kenya",
    // Replace with the exact Google Maps share link once the owner confirms the location.
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Sogomo+near+University+of+Eldoret+Kenya",
    contacts: {
      salon: { label: "Salon & Hair Services", display: "+254 757 192302", tel: "+254757192302", whatsapp: "254757192302" },
      clothes: { label: "Clothes & Fashion", display: "+254 793 036217", tel: "+254793036217", whatsapp: "254793036217" },
    },
    // Opening hours: confirm with the owner. days: 0 = Sunday ... 6 = Saturday.
    // Booking time slots are generated from this, so changing it here updates the booking form too.
    hours: [
      { label: "Monday – Saturday", days: [1, 2, 3, 4, 5, 6], open: "08:00", close: "19:00" },
      { label: "Sunday", days: [0], open: "10:00", close: "17:00" },
    ],
  };

  /* ================================ 2. DATA ================================ */

  var SERVICE_CATEGORIES = [
    {"id":"locks","label":"Locks & Locs"},
    {"id":"twists","label":"Twists & Braids"},
    {"id":"other","label":"Other Hair Services"},
  ];

  // Prices are from the owner's price list (KSh).
  var SERVICES = [
    {"id":"locks-installation","category":"locks","name":"Locks Installation","price":1000,"description":"Fresh locks installed neatly from the root."},
    {"id":"locks-retouch","category":"locks","name":"Locks Retouch","price":550,"description":"Keep your locks tidy and defined between installs."},
    {"id":"retouch-own-wax","category":"locks","name":"Retouch with Own Wax","price":300,"description":"Retouch using wax you bring with you."},
    {"id":"retouch-salon-wax","category":"locks","name":"Retouch with Salon Wax","price":500,"description":"Retouch using wax supplied by the salon."},
    {"id":"sister-locks","category":"locks","name":"Sister Locks Installation","price":3000,"description":"Fine, uniform sister locks for a long-lasting look."},
    {"id":"sasha-lock","category":"locks","name":"Sasha Lock Installation","price":800,"description":"Sasha locks installed with a clean, even finish."},
    {"id":"natural-hair-twist","category":"twists","name":"Natural Hair Twist","price":500,"description":"Protective twists done on your natural hair."},
    {"id":"coco-twist","category":"twists","name":"Coco Twist","price":500,"description":"Soft, textured twists with a full, rounded finish."},
    {"id":"knotless-twist","category":"twists","name":"Knotless Twist","price":500,"description":"Lightweight twists with no bulky knot at the root."},
    {"id":"loose-braids","category":"twists","name":"Loose Braids","price":550,"description":"Relaxed braids with a natural, flowing look."},
    {"id":"boho-braids","category":"twists","name":"Boho Braids","price":600,"description":"Braids with curly ends for a free, bohemian style."},
    {"id":"rasta-twist","category":"twists","name":"Rasta Twist","price":400,"description":"Classic rasta-style twists."},
    {"id":"plain-hair-twist","category":"twists","name":"Plain Hair Twist","price":250,"description":"Simple twists, a quick and affordable option."},
    {"id":"miracle-knot","category":"twists","name":"Miracle Knot","price":500,"description":"A knot-style finish that stays neat."},
    {"id":"havana-curls","category":"twists","name":"Havana Curls","price":500,"description":"Bouncy Havana twists with a soft curl."},
    {"id":"used-fluffy-twist","category":"twists","name":"Used Fluffy Twist","price":500,"description":"Fluffy twists done with hair you already have."},
    {"id":"guess-girl","category":"other","name":"Guess Girl","price":500,"description":"A popular style on the salon's price list."},
    {"id":"blow-dry","category":"other","name":"Blow-dry","price":50,"description":"A quick blow-dry finish."},
    {"id":"dyeing","category":"other","name":"Dyeing","price":100,"description":"Hair dyeing service."},
    {"id":"knot-less","category":"other","name":"Knot Less","price":450,"description":"Knotless style for a smooth, comfortable fit."},
    {"id":"rasta","category":"other","name":"Rasta","price":400,"description":"Rasta style on the salon's price list."},
    {"id":"fluffy-any-style","category":"other","name":"Fluffy Any Style","price":450,"description":"Choose your style and have it done fluffy."},
    {"id":"braids","category":"other","name":"Braids","price":70,"description":"Price from the salon's list. Confirm what is included when you book."},
    {"id":"beads","category":"other","name":"Beads","price":50,"description":"Price from the salon's list. Confirm what is included when you book."},
    {"id":"spanish","category":"other","name":"Spanish","price":50,"description":"Price from the salon's list. Confirm what is included when you book."},
    {"id":"hot-water","category":"other","name":"Hot Water","price":50,"description":"Price from the salon's list. Confirm what is included when you book."},
    {"id":"extend","category":"other","name":"Extend","price":50,"description":"Price from the salon's list. Confirm what is included when you book."},
    {"id":"hair-rolling","category":"other","name":"Hair Rolling","price":200,"description":"Hair rolled for a soft, bouncy set."},
  ];

  var GALLERY_CATEGORIES = [
    {"id":"all","label":"All"},
    {"id":"braids","label":"Braids"},
    {"id":"twists","label":"Twists"},
    {"id":"locs","label":"Locs"},
    {"id":"natural","label":"Natural Hair"},
    {"id":"other","label":"Other Styles"},
  ];

  // service_name must match a service name above so "Book This Style" pre-selects it.
  var GALLERY = [
    {"id":"g-knotless-braids","style_name":"Knotless Braids","category":"braids","starting_price":450,"service_name":"Knot Less","image_url":""},
    {"id":"g-boho-braids","style_name":"Boho Braids","category":"braids","starting_price":600,"service_name":"Boho Braids","image_url":""},
    {"id":"g-loose-braids","style_name":"Loose Braids","category":"braids","starting_price":550,"service_name":"Loose Braids","image_url":""},
    {"id":"g-coco-twist","style_name":"Coco Twist","category":"twists","starting_price":500,"service_name":"Coco Twist","image_url":""},
    {"id":"g-havana-curls","style_name":"Havana Curls","category":"twists","starting_price":500,"service_name":"Havana Curls","image_url":""},
    {"id":"g-rasta-twist","style_name":"Rasta Twist","category":"twists","starting_price":400,"service_name":"Rasta Twist","image_url":""},
    {"id":"g-knotless-twist","style_name":"Knotless Twist","category":"twists","starting_price":500,"service_name":"Knotless Twist","image_url":""},
    {"id":"g-locks-install","style_name":"Fresh Locks Installation","category":"locs","starting_price":1000,"service_name":"Locks Installation","image_url":""},
    {"id":"g-sasha-lock","style_name":"Sasha Locks","category":"locs","starting_price":800,"service_name":"Sasha Lock Installation","image_url":""},
    {"id":"g-sister-locks","style_name":"Sister Locks","category":"locs","starting_price":3000,"service_name":"Sister Locks Installation","image_url":""},
    {"id":"g-natural-twist","style_name":"Natural Hair Twists","category":"natural","starting_price":500,"service_name":"Natural Hair Twist","image_url":""},
    {"id":"g-hair-rolling","style_name":"Hair Rolling Set","category":"natural","starting_price":200,"service_name":"Hair Rolling","image_url":""},
    {"id":"g-fluffy","style_name":"Fluffy Style","category":"other","starting_price":450,"service_name":"Fluffy Any Style","image_url":""},
    {"id":"g-colour","style_name":"Hair Colour","category":"other","starting_price":100,"service_name":"Dyeing","image_url":""},
  ];

  var PRODUCT_CATEGORIES = [
    {"id":"all","label":"All"},
    {"id":"dresses","label":"Dresses"},
    {"id":"tops","label":"Tops"},
    {"id":"trousers","label":"Trousers"},
    {"id":"skirts","label":"Skirts"},
    {"id":"jeans","label":"Jeans"},
    {"id":"sets","label":"Sets"},
    {"id":"hoodies","label":"Hoodies"},
    {"id":"sweaters","label":"Sweaters"},
    {"id":"accessories","label":"Accessories"},
  ];

  // Clothes catalogue. Edit names, sizes, colours and prices to match the real stock.
  var PRODUCTS = [
    {"id":"p-black-fitted-dress","name":"Black Fitted Dress","category":"dresses","price":1200,"sizes":["S","M","L","XL"],"colours":["Black","Wine"],"in_stock":true,"description":"A fitted knee-length dress that works for class, church or a night out.","image_url":""},
    {"id":"p-floral-wrap-dress","name":"Floral Wrap Dress","category":"dresses","price":1500,"sizes":["S","M","L"],"colours":["Green Floral","Navy Floral"],"in_stock":true,"description":"A flowing wrap dress with an adjustable waist tie.","image_url":""},
    {"id":"p-satin-crop-top","name":"Satin Crop Top","category":"tops","price":600,"sizes":["S","M","L"],"colours":["Champagne","Black"],"in_stock":true,"description":"A smooth satin crop top that pairs with high-waist trousers or skirts.","image_url":""},
    {"id":"p-ribbed-bodysuit","name":"Ribbed Bodysuit","category":"tops","price":700,"sizes":["S","M","L"],"colours":["Black","White","Brown"],"in_stock":true,"description":"A stretch ribbed bodysuit that stays put all day.","image_url":""},
    {"id":"p-high-waist-trousers","name":"High-Waist Trousers","category":"trousers","price":1300,"sizes":["S","M","L","XL"],"colours":["Black","Khaki"],"in_stock":true,"description":"Tailored high-waist trousers for a sharp, comfortable fit.","image_url":""},
    {"id":"p-palazzo-trousers","name":"Wide-Leg Palazzo Trousers","category":"trousers","price":1100,"sizes":["M","L","XL"],"colours":["Black","Wine"],"in_stock":false,"description":"Loose, flowing wide-leg trousers.","image_url":""},
    {"id":"p-pleated-midi-skirt","name":"Pleated Midi Skirt","category":"skirts","price":1000,"sizes":["S","M","L"],"colours":["Black","Beige"],"in_stock":true,"description":"A pleated midi skirt with an elastic waistband.","image_url":""},
    {"id":"p-denim-mini-skirt","name":"Denim Mini Skirt","category":"skirts","price":900,"sizes":["S","M","L"],"colours":["Light Blue","Dark Blue"],"in_stock":true,"description":"A classic denim mini skirt with a front button closure.","image_url":""},
    {"id":"p-straight-jeans","name":"High-Rise Straight Jeans","category":"jeans","price":1800,"sizes":["28","30","32","34"],"colours":["Blue","Black"],"in_stock":true,"description":"High-rise straight-leg jeans in a sturdy stretch denim.","image_url":""},
    {"id":"p-matching-set","name":"Two-Piece Matching Set","category":"sets","price":2200,"sizes":["S","M","L","XL"],"colours":["Wine","Black","Cream"],"in_stock":true,"description":"A matching top and trouser set, ready to wear as one outfit.","image_url":""},
    {"id":"p-oversized-hoodie","name":"Oversized Hoodie","category":"hoodies","price":1600,"sizes":["M","L","XL"],"colours":["Grey","Black","Dusty Pink"],"in_stock":true,"description":"A soft, oversized hoodie for cold mornings on campus.","image_url":""},
    {"id":"p-knit-sweater","name":"Knit Sweater","category":"sweaters","price":1400,"sizes":["S","M","L","XL"],"colours":["Cream","Camel","Black"],"in_stock":true,"description":"A warm knit sweater with a relaxed fit.","image_url":""},
    {"id":"p-hoop-earrings","name":"Gold-Tone Hoop Earrings","category":"accessories","price":350,"sizes":["One size"],"colours":["Gold","Silver"],"in_stock":true,"description":"Lightweight hoop earrings for everyday wear.","image_url":""},
  ];

  /* ================================ 3. CODE ================================ */

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ksh = (n) => "KSh " + (Number(n) || 0).toLocaleString("en-US");
  const labelOf = (list, id) => (list.find((x) => x.id === id) || {}).label || id;
  const pad = (n) => String(n).padStart(2, "0");
  const toEl = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const imgSrc = (u) => (location.protocol === "file:" && String(u).startsWith("/") ? String(u).slice(1) : u);
  const sameId = (a, b) => String(a) === String(b);

  function fmtDate(d) {
    if (!d) return "";
    const [y, m, day] = String(d).slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }

  /* ---------- icons (Lucide paths, drawn as inline SVG so no icon library is needed) ---------- */
  const ICONS = {
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
    shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
    cap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
    cash: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    ok: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    alert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    loader: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    sparkle: '<path d="M12 2.5Q13.4 10.6 21.5 12Q13.4 13.4 12 21.5Q10.6 13.4 2.5 12Q10.6 10.6 12 2.5Z"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  };
  const icon = (name, cls) => `<svg class="icon ${cls || ""}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ""}</svg>`;
  function hydrateIcons(root) {
    $$("i[data-icon]", root || document).forEach((i) => { i.outerHTML = icon(i.dataset.icon, i.className); });
  }

  /* ---------- fallback tile, shown only when a photo file is missing (no illustrations) ---------- */
  function placeholder(kind, label) {
    return `<div class="ph ph-tile" role="img" aria-label="${esc(label)}">${icon(kind === "fashion" ? "shirt" : "scissors", "icon-lg")}<span>${esc(label)}</span></div>`;
  }
  function smartImg(o) {
    if (!o.src) return placeholder(o.kind, o.label, o.cat, o.colours);
    return `<img src="${esc(imgSrc(o.src))}" alt="${esc(o.alt)}" data-kind="${o.kind}" data-label="${esc(o.label)}" data-cat="${esc(o.cat || "")}" data-colours="${esc((o.colours || []).join("|"))}" loading="lazy" decoding="async">`;
  }
  function swapToPlaceholder(img) {
    img.replaceWith(toEl(placeholder(img.dataset.kind, img.dataset.label, img.dataset.cat, (img.dataset.colours || "").split("|").filter(Boolean))));
  }
  document.addEventListener("error", (e) => { if (e.target && e.target.tagName === "IMG" && e.target.dataset.kind) swapToPlaceholder(e.target); }, true);
  const checkBrokenImages = () => $$("img[data-kind]").forEach((i) => { if (i.complete && i.naturalWidth === 0) swapToPlaceholder(i); });

  /* ---------- WhatsApp ---------- */
  const waLink = (key, msg) => `https://wa.me/${BUSINESS.contacts[key].whatsapp}?text=${encodeURIComponent(msg)}`;
  const GREET = `Hello ${BUSINESS.name},`;
  const MSG = {
    general: (k) => (k === "clothes" ? `${GREET} I would like to ask about your clothes.` : `${GREET} I would like to ask about your hair services.`),
    student: () => `${GREET} I am a University of Eldoret student. What student offers do you currently have?`,
    delivery: () => `${GREET} I would like to ask about clothing delivery. I am located at: `,
    product: (p, s) => {
      const opts = [s.size && `size ${s.size}`, s.colour && `in ${s.colour}`].filter(Boolean);
      if (!p.in_stock) return `${GREET} I saw that ${p.name} is sold out. When will it be back in stock?`;
      return opts.length ? `${GREET} I am interested in ${p.name}. Is it available in ${opts.join(", ")}?` : `${GREET} I am interested in ${p.name}. Which sizes are available?`;
    },
    booking: (b) => [`${GREET} I would like to book an appointment.`, "", `Name: ${b.fullName}`, `Phone: ${b.phone}`, `Service: ${b.service}`, `Date: ${fmtDate(b.date)}`, `Time: ${b.time}`, `Notes: ${(b.notes || "").trim() || "None"}`].join("\n"),
  };

  /* ---------- opening hours and booking slots ---------- */
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const fmtTime = (t) => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`; };
  const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  function slotsFor(dateStr) {
    if (!dateStr) return [];
    const [y, m, d] = dateStr.split("-").map(Number);
    const rule = BUSINESS.hours.find((r) => r.days.indexOf(new Date(y, m - 1, d).getDay()) !== -1);
    if (!rule) return [];
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const slots = [];
    for (let t = toMin(rule.open); t + 60 <= toMin(rule.close); t += 60) {
      if (dateStr === todayStr() && t <= nowMin) continue;
      slots.push(fmtTime(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`));
    }
    return slots;
  }

  /* ---------- backend client ---------- */
  class ApiError extends Error { constructor(message, status, fields) { super(message); this.status = status; this.fields = fields || {}; } }
  async function api(path, opts) {
    const o = opts || {};
    if (!API_URL) throw new ApiError("The online system is not connected.", 0);
    let res;
    try {
      res = await fetch(`${API_URL.replace(/\/$/, "")}/api${path}`, {
        method: o.method || "GET",
        headers: Object.assign({}, o.body ? { "Content-Type": "application/json" } : {}, o.token ? { Authorization: `Bearer ${o.token}` } : {}),
        body: o.body ? JSON.stringify(o.body) : undefined,
      });
    } catch (e) { throw new ApiError("Could not reach the server. Check your connection and try again.", 0); }
    const data = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) throw new ApiError((data && data.error) || "Something went wrong. Please try again.", res.status, data && data.fields);
    return data;
  }

  // Photos come from index.html: <template id="photoSources"> holds one <img data-photo="item-id" src="..."> per item.
  (function applyPhotoSources() {
    var t = document.getElementById("photoSources");
    if (!t || !t.content) return;
    var items = GALLERY.concat(PRODUCTS);
    Array.prototype.forEach.call(t.content.querySelectorAll("img[data-photo]"), function (im) {
      var id = im.getAttribute("data-photo"), src = im.getAttribute("src");
      items.forEach(function (x) { if (x.id === id) x.image_url = src || ""; });
    });
  })();

  /* ---------- state ---------- */
  const state = { services: SERVICES, products: PRODUCTS, gallery: GALLERY, loading: Boolean(API_URL), serviceCat: SERVICE_CATEGORIES[0].id, galleryCat: "all", galleryLimit: 8, shopCat: "all", sel: {} };
  const PAGE = 8;

  async function loadCatalog() {
    if (!API_URL) { state.loading = false; return; }
    try {
      const r = await Promise.all([api("/services"), api("/products"), api("/gallery")]);
      state.services = r[0]; state.products = r[1]; state.gallery = r[2];
    } catch (e) { /* backend unreachable: keep the built-in catalogue so the site never looks empty */ }
    state.loading = false;
    renderAll();
  }

  /* ---------- effects ---------- */
  function burst(x, y, n) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cols = ["#f5b800", "#ffd84d", "#c98f00", "#0a0a0a", "#ffffff"];
    for (let i = 0; i < (n || 14); i++) {
      const s = document.createElement("span");
      const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 70;
      s.className = "confetti";
      s.style.cssText = `left:${x}px;top:${y}px;background:${cols[i % cols.length]};--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d + 30).toFixed(0)}px`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1000);
    }
  }
  let io = null;
  function observeReveals() {
    const els = $$(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    io = io || new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -5% 0px", threshold: 0.05 });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- saved favourites (kept in this browser only) ---------- */
  const SAVED_KEY = "cps_saved";
  let saved = { g: [], p: [] };
  try { const s = JSON.parse(localStorage.getItem(SAVED_KEY) || "null"); if (s && Array.isArray(s.g) && Array.isArray(s.p)) saved = s; } catch (e) { /* storage unavailable */ }
  const isSaved = (t, id) => saved[t].some((x) => sameId(x, id));
  const persistSaved = () => { try { localStorage.setItem(SAVED_KEY, JSON.stringify(saved)); } catch (e) { /* ignore */ } };
  const heartBtn = (t, id) => `<button type="button" class="heart" data-action="save" data-type="${t}" data-id="${esc(id)}" aria-pressed="${isSaved(t, id)}" aria-label="Save to favourites">${icon("heart")}</button>`;
  function savedItems() {
    return { g: saved.g.map((id) => state.gallery.find((x) => sameId(x.id, id))).filter(Boolean), p: saved.p.map((id) => state.products.find((x) => sameId(x.id, id))).filter(Boolean) };
  }
  function updateSavedUI() {
    const it = savedItems(), n = it.g.length + it.p.length;
    $$("[data-saved-count]").forEach((c) => { c.textContent = n; c.hidden = n === 0; });
    $$('[data-action="save"][aria-pressed]').forEach((b) => b.setAttribute("aria-pressed", String(isSaved(b.dataset.type, b.dataset.id))));
    if (!$("#saved").hidden) renderSaved();
  }
  function toggleSaved(t, id) {
    if (isSaved(t, id)) saved[t] = saved[t].filter((x) => !sameId(x, id)); else saved[t].push(String(id));
    persistSaved();
    updateSavedUI();
  }

  /* ---------- shared markup ---------- */
  const skeletons = (n, ratio) => `<div class="grid grid-services" aria-busy="true" aria-label="Loading">${Array.from({ length: n }, () => `<div class="skel-card"><div class="skeleton ${ratio}"></div><div class="skeleton"></div></div>`).join("")}</div>`;
  const emptyState = (title, text, action) => `<div class="empty">${icon("search")}<strong>${esc(title)}</strong><p>${esc(text)}</p>${action || ""}</div>`;
  const waBtn = (key, msg, label, cls) => `<a class="btn ${cls || "btn-wa"}" href="${waLink(key, msg)}" target="_blank" rel="noopener noreferrer">${icon("message")} ${esc(label)}</a>`;
  const chipRow = (list, active, action) => list.map((c) => `<button type="button" class="chip" aria-pressed="${c.id === active}" data-action="${action}" data-id="${esc(c.id)}">${esc(c.label)}</button>`).join("");

  /* ---------- services ---------- */
  const CAT_ICON = { locks: "scissors", twists: "sparkle", other: "star" };
  function renderServices() {
    $("#serviceTabs").innerHTML = SERVICE_CATEGORIES.map((c) => `<button type="button" role="tab" class="chip" aria-selected="${c.id === state.serviceCat}" data-action="service-cat" data-id="${c.id}">${esc(c.label)}</button>`).join("");
    const root = $("#servicesPanel");
    if (state.loading) { root.innerHTML = skeletons(6, "r43"); return; }
    const items = state.services.filter((s) => s.category === state.serviceCat);
    root.innerHTML = items.length
      ? `<div class="grid grid-services">${items.map((s) => `<article class="card svc reveal"><div class="svc-top"><span class="svc-ic">${icon(CAT_ICON[s.category] || "sparkle")}</span><span class="price-pill">${ksh(s.price)}</span></div><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p><button type="button" class="btn btn-outline btn-sm btn-block" data-action="book-service" data-id="${esc(s.id)}">Book This Service</button></article>`).join("")}</div>`
      : emptyState("No services in this category yet", "Check another category or message the salon to ask about this service.");
  }

  /* ---------- gallery ---------- */
  const styleImg = (g, extra) => smartImg({ src: g.image_url, alt: g.style_name + " hairstyle at Comrade Price Salon", kind: "hair", label: g.style_name, cat: g.category, ...extra });
  function renderGallery() {
    $("#galleryFilters").innerHTML = chipRow(GALLERY_CATEGORIES, state.galleryCat, "gallery-cat");
    const root = $("#galleryPanel"), more = $("#galleryMore");
    if (state.loading) { root.innerHTML = skeletons(4, "r45"); more.hidden = true; return; }
    const list = state.galleryCat === "all" ? state.gallery : state.gallery.filter((g) => g.category === state.galleryCat);
    const shown = list.slice(0, state.galleryLimit);
    more.hidden = list.length <= state.galleryLimit;
    root.innerHTML = shown.length
      ? `<div class="grid grid-gallery">${shown.map((g) => `<article class="shot reveal"><div class="shot-media"><button type="button" class="media-btn" data-action="open-style" data-id="${esc(g.id)}" aria-label="View ${esc(g.style_name)}"><div class="smart r45">${styleImg(g)}</div><span class="shot-overlay">View style</span></button>${heartBtn("g", g.id)}</div><div class="shot-info"><h3>${esc(g.style_name)}</h3><span class="price-pill">From ${ksh(g.starting_price)}</span></div><button type="button" class="btn btn-outline btn-sm" data-action="book-style" data-id="${esc(g.id)}">Book This Style</button></article>`).join("")}</div>`
      : emptyState("No styles in this category yet", "New photos are added regularly. Try another category or message the salon about the style you want.", waBtn("salon", MSG.general("salon"), "Ask the Salon"));
  }

  function renderCollage() {
    let picks = ["braids", "twists", "locs", "natural"].map((c) => state.gallery.find((g) => g.category === c)).filter(Boolean);
    state.gallery.forEach((g) => { if (picks.length < 4 && picks.indexOf(g) === -1) picks.push(g); });
    picks = picks.slice(0, 4);
    $("#heroCollage").hidden = picks.length < 2;
    $("#heroCollage").innerHTML = picks.map((g) => `<button type="button" class="tile" data-action="open-style" data-id="${esc(g.id)}" aria-label="View ${esc(g.style_name)}"><div class="smart r45">${styleImg(g)}</div><span class="tile-label">${esc(g.style_name)}</span></button>`).join("");
  }

  let lastFocus = null;
  function closeModals(silent) {
    ["productModal", "styleModal"].forEach((id) => { const m = document.getElementById(id); if (m) m.remove(); });
    syncScroll();
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function openStyle(id) {
    const g = state.gallery.find((x) => sameId(x.id, id));
    if (!g) return;
    closeModals(true);
    lastFocus = document.activeElement;
    const m = toEl(`<div class="modal" id="styleModal" data-action="close-modal"><div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="smTitle">
      <button type="button" class="modal-close" data-action="close-modal" aria-label="Close">${icon("x")}</button>
      <div class="modal-product"><div class="smart r45">${styleImg(g)}</div>
        <div class="modal-info"><p class="crumb">${esc(labelOf(GALLERY_CATEGORIES, g.category))}</p><h2 id="smTitle">${esc(g.style_name)}</h2><span class="price-pill">From ${ksh(g.starting_price)}</span>
          <p>This is the starting price for this style. Final details are confirmed when you book.</p>
          <div class="modal-actions"><button type="button" class="btn btn-grad shine" data-action="book-style" data-id="${esc(g.id)}">Book This Style</button>
            <button type="button" class="btn btn-outline" data-action="save" data-type="g" data-id="${esc(g.id)}" aria-pressed="${isSaved("g", g.id)}">${icon("heart")} <span class="on">Saved</span><span class="off">Save to favourites</span></button></div></div></div></div></div>`);
    document.body.appendChild(m);
    syncScroll();
    $(".modal-close", m).focus();
  }

  /* ---------- shop ---------- */
  const selOf = (id) => state.sel[id] || (state.sel[id] = { size: "", colour: "" });
  function optionGroup(p, kind, label, values) {
    if (!values || !values.length) return "";
    const cur = selOf(p.id)[kind];
    return `<div><p>${label}</p><div role="group" aria-label="${label}">${values.map((v) => `<button type="button" class="chip chip-sm" aria-pressed="${cur === v}" data-action="pick" data-product="${esc(p.id)}" data-kind="${kind}" data-value="${esc(v)}">${esc(v)}</button>`).join("")}</div></div>`;
  }
  const productOptions = (p) => `<div class="options">${optionGroup(p, "size", "Available sizes", p.sizes)}${optionGroup(p, "colour", "Available colours", p.colours)}</div>`;
  const orderLabel = (p) => (p.in_stock ? "Order via WhatsApp" : "Ask About Restock");
  const stockBadge = (p) => `<span class="badge ${p.in_stock ? "" : "badge-out"}">${p.in_stock ? "Available" : "Sold out"}</span>`;
  const orderBtn = (p, cls) => `<a class="btn btn-wa ${cls || ""}" data-wa-product href="${waLink("clothes", MSG.product(p, selOf(p.id)))}" target="_blank" rel="noopener noreferrer">${icon("message")} ${orderLabel(p)}</a>`;
  const findProduct = (id) => state.products.find((p) => sameId(p.id, id));
  const productImg = (p, alt) => smartImg({ src: p.image_url, alt: alt || p.name + " available at Comrade Price Salon", kind: "fashion", label: p.name, cat: p.category, colours: p.colours });

  function productCard(p) {
    return `<article class="card product-card reveal" data-pid="${esc(p.id)}">
      <div class="product-media"><button type="button" class="media-btn" data-action="view-product" data-id="${esc(p.id)}" aria-label="View details for ${esc(p.name)}"><div class="smart r34">${productImg(p)}</div></button>${heartBtn("p", p.id)}${stockBadge(p)}</div>
      <div class="product-body"><h3>${esc(p.name)}</h3><span class="price-pill">${ksh(p.price)}</span>${productOptions(p)}
        <div class="stack"><button type="button" class="btn btn-outline btn-sm" data-action="view-product" data-id="${esc(p.id)}">View Details</button>${orderBtn(p, "btn-sm")}</div></div></article>`;
  }
  function renderShop() {
    $("#shopFilters").innerHTML = chipRow(PRODUCT_CATEGORIES, state.shopCat, "shop-cat");
    const root = $("#shopPanel");
    if (state.loading) { root.innerHTML = skeletons(4, "r34"); return; }
    const list = state.shopCat === "all" ? state.products : state.products.filter((p) => p.category === state.shopCat);
    root.innerHTML = list.length
      ? `<div class="grid grid-shop">${list.map(productCard).join("")}</div>`
      : emptyState("Nothing here right now", "We have no items in this category at the moment. Message the shop to ask what is coming in.", waBtn("clothes", MSG.general("clothes"), "Ask What Is Coming"));
  }
  // Keep size/colour chips and the WhatsApp link in sync between a card and its details window.
  function syncProduct(id) {
    const p = findProduct(id);
    if (!p) return;
    const sel = selOf(p.id);
    $$("[data-pid]").filter((n) => sameId(n.dataset.pid, id)).forEach((box) => {
      $$('.chip[data-action="pick"]', box).forEach((b) => b.setAttribute("aria-pressed", String(sel[b.dataset.kind] === b.dataset.value)));
      const a = $("[data-wa-product]", box);
      if (a) a.href = waLink("clothes", MSG.product(p, sel));
    });
  }
  function openProduct(id) {
    const p = findProduct(id);
    if (!p) return;
    closeModals(true);
    lastFocus = document.activeElement;
    const m = toEl(`<div class="modal" id="productModal" data-action="close-modal"><div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="pmTitle">
      <button type="button" class="modal-close" data-action="close-modal" aria-label="Close details">${icon("x")}</button>
      <div class="modal-product" data-pid="${esc(p.id)}"><div class="product-media"><div class="smart r45">${productImg(p, p.name)}</div>${stockBadge(p)}</div>
        <div class="modal-info"><p class="crumb">${esc(labelOf(PRODUCT_CATEGORIES, p.category))}</p><h2 id="pmTitle">${esc(p.name)}</h2><span class="price-pill">${ksh(p.price)}</span>
          ${p.description ? `<p>${esc(p.description)}</p>` : ""}${productOptions(p)}
          <div class="modal-actions">${orderBtn(p, "btn-block")}<button type="button" class="btn btn-outline" data-action="save" data-type="p" data-id="${esc(p.id)}" aria-pressed="${isSaved("p", p.id)}">${icon("heart")} <span class="on">Saved</span><span class="off">Save to favourites</span></button></div>
          <p class="small-note">Payment and pickup or delivery are arranged with the shop on WhatsApp.</p></div></div></div></div>`);
    document.body.appendChild(m);
    syncScroll();
    $(".modal-close", m).focus();
  }

  /* ---------- saved drawer ---------- */
  function renderSaved() {
    const it = savedItems(), total = it.g.length + it.p.length;
    const rm = (t, id, name) => `<button type="button" class="icon-btn" style="width:36px;height:36px" data-action="save" data-type="${t}" data-id="${esc(id)}" aria-label="Remove ${esc(name)} from saved">${icon("x")}</button>`;
    const rowG = (g) => `<div class="saved-row"><div class="smart sq">${styleImg(g)}</div><div class="grow"><strong>${esc(g.style_name)}</strong><small>From ${ksh(g.starting_price)}</small></div><button type="button" class="chip chip-sm" data-action="saved-book" data-id="${esc(g.id)}">Book</button>${rm("g", g.id, g.style_name)}</div>`;
    const rowP = (p) => `<div class="saved-row"><div class="smart sq">${productImg(p)}</div><div class="grow"><strong>${esc(p.name)}</strong><small>${ksh(p.price)}</small></div><a class="chip chip-sm" href="${waLink("clothes", MSG.product(p, selOf(p.id)))}" target="_blank" rel="noopener noreferrer">Order</a>${rm("p", p.id, p.name)}</div>`;
    const listMsg = (head, lines) => `${GREET} ${head}\n${lines.join("\n")}`;
    const foot = [];
    if (it.g.length) foot.push(waBtn("salon", listMsg("I like these styles and would like to book:", it.g.map((g) => `- ${g.style_name} (from ${ksh(g.starting_price)})`)), "Send styles to the salon"));
    if (it.p.length) foot.push(waBtn("clothes", listMsg("I am interested in these clothes:", it.p.map((p) => `- ${p.name} (${ksh(p.price)})`)), "Send clothes to the shop"));
    $("#saved").innerHTML = `<div class="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="savedTitle"><div class="drawer-head"><h2 id="savedTitle">Saved</h2><button type="button" class="modal-close" style="position:static" data-action="close-saved" aria-label="Close saved list">${icon("x")}</button></div>
      <div class="drawer-body">${total ? (it.g.length ? `<h3>Hairstyles</h3>${it.g.map(rowG).join("")}` : "") + (it.p.length ? `<h3>Clothes</h3>${it.p.map(rowP).join("")}` : "") : emptyState("Nothing saved yet", "Tap the heart on any style or outfit to keep it here.")}</div>
      ${foot.length ? `<div class="drawer-foot">${foot.join("")}</div>` : ""}</div>`;
  }
  function openSaved() { lastFocus = document.activeElement; $("#saved").hidden = false; renderSaved(); syncScroll(); $(".modal-close", $("#saved")).focus(); }
  function closeSaved(silent) { $("#saved").hidden = true; syncScroll(); if (!silent && lastFocus && lastFocus.focus) lastFocus.focus(); }

  /* ---------- search ---------- */
  function closeSearch() { const b = $("#searchResults"); b.hidden = true; $("#searchInput").setAttribute("aria-expanded", "false"); }
  function runSearch() {
    const raw = $("#searchInput").value.trim(), q = raw.toLowerCase(), box = $("#searchResults");
    if (!q) { closeSearch(); box.innerHTML = ""; return; }
    const has = (...t) => t.some((x) => String(x || "").toLowerCase().indexOf(q) !== -1);
    const S = state.services.filter((s) => has(s.name, s.description)).slice(0, 4);
    const G = state.gallery.filter((g) => has(g.style_name, g.service_name, labelOf(GALLERY_CATEGORIES, g.category))).slice(0, 4);
    const P = state.products.filter((p) => has(p.name, p.description, labelOf(PRODUCT_CATEGORIES, p.category), (p.colours || []).join(" "))).slice(0, 4);
    const grp = (title, arr, type, sub) => (arr.length ? `<p class="sr-group">${title}</p>` + arr.map((x) => `<button type="button" class="sr-item" data-action="search-pick" data-type="${type}" data-id="${esc(x.id)}"><span>${esc(x.name || x.style_name)}</span><small>${sub(x)}</small></button>`).join("") : "");
    const html = grp("Services", S, "s", (x) => ksh(x.price)) + grp("Hairstyles", G, "g", (x) => "From " + ksh(x.starting_price)) + grp("Clothes", P, "p", (x) => ksh(x.price));
    box.innerHTML = html || `<p class="sr-empty">No matches for "${esc(raw)}". <a href="${waLink("salon", `${GREET} I am looking for: ${raw}`)}" target="_blank" rel="noopener noreferrer">Ask us on WhatsApp</a></p>`;
    box.hidden = false;
    $("#searchInput").setAttribute("aria-expanded", "true");
  }

  const TICKER = ["Knotless Braids", "Boho Braids", "Locs", "Coco Twist", "Havana Curls", "Hair Rolling", "Dresses", "Jeans", "Matching Sets", "Hoodies", "Student Offers", "Clothing Delivery", "Book Online"];
  function buildTicker() {
    const once = TICKER.map((t) => `<span>${esc(t)}</span>`).join("");
    $("#tickerTrack").innerHTML = once + once;
  }

  /* ---------- hours, contact details, WhatsApp chooser ---------- */
  function renderHours() {
    const rows = BUSINESS.hours.map((h) => `<div><dt>${esc(h.label)}</dt><dd>${fmtTime(h.open)} – ${fmtTime(h.close)}</dd></div>`).join("");
    $$("[data-hours]").forEach((n) => { n.innerHTML = `<div class="hours"><h3>${icon("clock")} Opening hours</h3><dl>${rows}</dl></div>`; });
  }

  function fillContactDetails() {
    $$("[data-wa]").forEach((a) => { const k = a.dataset.wa; a.href = waLink(k, MSG[a.dataset.msg](k)); });
    $$("[data-phone]").forEach((n) => { n.textContent = BUSINESS.contacts[n.dataset.phone].display; });
    $$("[data-tel]").forEach((a) => { a.href = "tel:" + BUSINESS.contacts[a.dataset.tel].tel; });
    $$("[data-location]").forEach((n) => { n.textContent = BUSINESS.fullLocation; });
    $$("[data-maps]").forEach((a) => { a.href = BUSINESS.mapsUrl; });
  }

  function buildWaPanels() {
    const panel = `<div class="wa-panel" hidden><p>Who would you like to chat with?</p>${["salon", "clothes"].map((k) => `<a class="wa-opt" href="${waLink(k, MSG.general(k))}" target="_blank" rel="noopener noreferrer"><span class="wa-ic">${icon(k === "salon" ? "scissors" : "shirt")}</span><span><strong>${esc(BUSINESS.contacts[k].label)}</strong><small>${esc(BUSINESS.contacts[k].display)}</small></span></a>`).join("")}</div>`;
    $$("[data-wa-wrap]").forEach((w) => w.insertAdjacentHTML("afterbegin", panel));
  }
  function closeWaPanels(except) {
    $$("[data-wa-wrap]").forEach((w) => {
      if (w === except) return;
      $(".wa-panel", w).hidden = true;
      $('[data-action="wa-toggle"]', w).setAttribute("aria-expanded", "false");
    });
  }

  function renderHeroTag() {
    const prices = state.services.filter((s) => s.category === "twists").map((s) => Number(s.price));
    $("#heroTag").textContent = prices.length ? "Twists from " + ksh(Math.min.apply(null, prices)) : "Student-friendly prices";
  }

  /* ---------- page-level scroll lock and mobile menu ---------- */
  function syncScroll() {
    const locked = !$("#mobileMenu").hidden || $("#productModal") || $("#styleModal") || !$("#saved").hidden || !$("#admin").hidden || $("#adminDialog");
    document.body.style.overflow = locked ? "hidden" : "";
  }
  function setMenu(open) {
    $("#mobileMenu").hidden = !open;
    const b = $('[data-action="toggle-menu"]');
    b.setAttribute("aria-expanded", String(open));
    b.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    b.innerHTML = icon(open ? "x" : "menu");
    syncScroll();
  }

  /* ---------- booking form ---------- */
  const FIELD_ID = { fullName: "bkName", phone: "bkPhone", service: "bkService", date: "bkDate", time: "bkTime", notes: "bkNotes" };
  const OTHER = "Other / not sure (describe in notes)";
  const PHONE_RE = /^(?:\+?254|0)[17]\d{8}$/;
  const bk = (k) => $("#" + FIELD_ID[k]);

  function renderServiceOptions() {
    const sel = bk("service");
    const cur = sel.value;
    sel.innerHTML = `<option value="">Choose a service</option>` + SERVICE_CATEGORIES.map((c) => {
      const items = state.services.filter((s) => s.category === c.id);
      return items.length ? `<optgroup label="${esc(c.label)}">${items.map((s) => `<option value="${esc(s.name)}">${esc(s.name)}</option>`).join("")}</optgroup>` : "";
    }).join("") + `<option value="${esc(OTHER)}">${esc(OTHER)}</option>`;
    sel.value = cur;
  }
  function renderTimeOptions() {
    const sel = bk("time");
    const date = bk("date").value;
    const slots = slotsFor(date);
    sel.disabled = !date;
    sel.innerHTML = `<option value="">${date ? (slots.length ? "Choose a time" : "No times left on this date") : "Choose a date first"}</option>` + slots.map((t) => `<option value="${t}">${t}</option>`).join("");
  }
  const readBooking = () => ({ fullName: bk("fullName").value, phone: bk("phone").value, service: bk("service").value, date: bk("date").value, time: bk("time").value, notes: bk("notes").value });

  function validateBooking(v) {
    const e = {};
    if (v.fullName.trim().length < 2) e.fullName = "Enter your full name.";
    if (!PHONE_RE.test(v.phone.replace(/[\s\-()]/g, ""))) e.phone = "Enter a valid Kenyan number, for example 0712 345 678.";
    if (!v.service) e.service = "Choose a service.";
    if (!v.date) e.date = "Choose a date."; else if (v.date < todayStr()) e.date = "Choose today or a later date.";
    if (!v.time) e.time = v.date ? "Choose a time." : "Choose a date first, then a time.";
    else if (v.date && slotsFor(v.date).indexOf(v.time) === -1) e.time = "That time is not available on the chosen date.";
    if (v.notes.length > 500) e.notes = "Keep notes under 500 characters.";
    return e;
  }
  function showBookingErrors(errors) {
    Object.keys(FIELD_ID).forEach((k) => {
      const input = bk(k);
      const out = $("#" + FIELD_ID[k] + "-error");
      out.hidden = !errors[k];
      out.textContent = errors[k] || "";
      input.setAttribute("aria-invalid", String(Boolean(errors[k])));
      if (errors[k]) input.setAttribute("aria-describedby", out.id); else input.removeAttribute("aria-describedby");
    });
  }

  // Called by "Book This Service" / "Book This Style": fills the form and scrolls to it.
  function openBooking(sel) {
    resetBookingView();
    const names = state.services.map((s) => s.name);
    const known = names.indexOf(sel.service) !== -1;
    renderServiceOptions();
    bk("service").value = known ? sel.service : sel.service ? OTHER : bk("service").value;
    const prevNotes = bk("notes").value;
    bk("notes").value = sel.notes ? sel.notes : !known && sel.service ? "Requested: " + sel.service : prevNotes.indexOf("Style requested:") === 0 ? "" : prevNotes;
    showBookingErrors({});
    $("#book").scrollIntoView({ behavior: "smooth" });
  }
  function resetBookingView() { $("#bookingResult").hidden = true; $("#bookingForm").hidden = false; }

  async function submitBooking(ev) {
    ev.preventDefault();
    const v = readBooking();
    const errors = validateBooking(v);
    showBookingErrors(errors);
    const firstBad = Object.keys(errors)[0];
    if (firstBad) { bk(firstBad).focus(); return; }
    const btn = $("#bkSubmit");
    btn.disabled = true;
    btn.innerHTML = `${icon("loader", "spin")} Sending request`;
    let saved = false, errMsg = "";
    try {
      if (!API_URL) throw new ApiError("", 0);
      await api("/appointments", { method: "POST", body: { full_name: v.fullName.trim(), phone: v.phone.trim(), service_name: v.service, preferred_date: v.date, preferred_time: v.time, notes: v.notes.trim() } });
      saved = true;
    } catch (e) {
      errMsg = e.message || "";
      if (e.status === 400 && e.fields) {
        const map = { full_name: "fullName", phone: "phone", service_name: "service", preferred_date: "date", preferred_time: "time", notes: "notes" };
        const fe = {};
        Object.keys(e.fields).forEach((k) => { if (map[k]) fe[map[k]] = e.fields[k]; });
        if (Object.keys(fe).length) { showBookingErrors(fe); btn.disabled = false; btn.textContent = "Request Appointment"; return; }
      }
    }
    btn.disabled = false;
    btn.textContent = "Request Appointment";
    showBookingResult(v, saved, errMsg);
  }

  function showBookingResult(v, ok, errMsg) {
    const rows = [["Name", v.fullName.trim()], ["Service", v.service], ["Date", fmtDate(v.date)], ["Time", v.time]];
    if (v.notes.trim()) rows.push(["Notes", v.notes.trim()]);
    const text = ok
      ? "Thank you. The salon will confirm your appointment. You can also send the details on WhatsApp to get a faster reply."
      : errMsg ? `${errMsg} Your request has not been saved. Send it to the salon on WhatsApp to complete your booking.`
      : "Online booking is not switched on yet, so your request has not been saved. Send it to the salon on WhatsApp to complete your booking.";
    const box = $("#bookingResult");
    box.innerHTML = `${icon(ok ? "ok" : "alert", "result-icon " + (ok ? "result-ok" : "result-warn"))}<h3>${ok ? "Booking request received" : "One more step: send it on WhatsApp"}</h3><p>${esc(text)}</p>
      <dl class="summary">${rows.map((r) => `<div><dt>${r[0]}</dt><dd>${esc(r[1])}</dd></div>`).join("")}</dl>
      <div class="result-actions">${waBtn("salon", MSG.booking(v), "Send Booking on WhatsApp")}<button type="button" class="btn btn-outline" data-action="booking-reset">Make Another Booking</button></div>`;
    $("#bookingForm").hidden = true;
    box.hidden = false;
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (ok) { const r = box.getBoundingClientRect(); burst(r.left + r.width / 2, Math.max(r.top + 40, 80), 28); }
  }

  /* ============================ STAFF DASHBOARD (#admin) ============================ */
  const TOKEN_KEY = "cps_admin_token";
  const admin = { token: null, user: null, tab: "appointments", items: null, flash: "", error: "", filter: "all", booted: false };
  const STATUSES = [{ id: "pending", label: "Pending" }, { id: "confirmed", label: "Confirmed" }, { id: "completed", label: "Completed" }, { id: "cancelled", label: "Cancelled" }];
  const opt = (list) => list.filter((c) => c.id !== "all").map((c) => ({ value: c.id, label: c.label }));

  // Each editable list is described once; the list and the add/edit form are generated from it.
  const RESOURCES = {
    services: { title: "Services", noun: "service", primary: "name", meta: (i) => [labelOf(SERVICE_CATEGORIES, i.category), ksh(i.price)],
      fields: [
        { name: "name", label: "Service name", type: "text" },
        { name: "category", label: "Category", type: "select", options: opt(SERVICE_CATEGORIES) },
        { name: "price", label: "Price (KSh)", type: "number" },
        { name: "description", label: "Short description", type: "textarea" },
      ], defaults: { category: "twists" } },
    products: { title: "Clothes", noun: "product", primary: "name", image: true, meta: (i) => [labelOf(PRODUCT_CATEGORIES, i.category), ksh(i.price), i.in_stock ? "Available" : "Sold out"],
      toggle: { field: "in_stock", on: "Mark sold out", off: "Mark available" },
      fields: [
        { name: "name", label: "Product name", type: "text" },
        { name: "category", label: "Category", type: "select", options: opt(PRODUCT_CATEGORIES) },
        { name: "price", label: "Price (KSh)", type: "number" },
        { name: "sizes", label: "Sizes", type: "list", help: "Separate with commas, for example S, M, L, XL" },
        { name: "colours", label: "Colours", type: "list", help: "Separate with commas, for example Black, Wine" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "image_url", label: "Photo link", type: "image", help: "A link to the photo (for example from Cloudinary), or a path such as /images/products/name.jpg" },
        { name: "in_stock", label: "Available for sale", type: "checkbox" },
      ], defaults: { category: "dresses", in_stock: true } },
    gallery: { title: "Gallery", noun: "hairstyle", primary: "style_name", image: true, meta: (i) => [labelOf(GALLERY_CATEGORIES, i.category), "From " + ksh(i.starting_price)],
      fields: [
        { name: "style_name", label: "Style name", type: "text" },
        { name: "category", label: "Category", type: "select", options: opt(GALLERY_CATEGORIES) },
        { name: "starting_price", label: "Starting price (KSh)", type: "number" },
        { name: "service_name", label: "Matching service", type: "service", help: '"Book This Style" pre-selects this service in the booking form.' },
        { name: "image_url", label: "Photo link", type: "image", help: "A link to the photo (for example from Cloudinary), or a path such as /images/gallery/name.jpg" },
      ], defaults: { category: "braids" } },
  };

  const readToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } };
  function adminLogout() {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* storage unavailable */ }
    admin.token = null; admin.user = null; admin.items = null; admin.flash = ""; admin.error = "";
    renderAdmin();
  }
  const handleAuthError = (e) => { if (e.status === 401) { adminLogout(); return true; } return false; };

  async function openAdmin() {
    const root = $("#admin");
    root.hidden = false;
    syncScroll();
    admin.token = admin.token || readToken();
    if (API_URL && admin.token && !admin.user) {
      root.innerHTML = adminShell(`<p class="center">${icon("loader", "spin icon-lg")}</p>`, false);
      try { admin.user = await api("/auth/me", { token: admin.token }); } catch (e) { adminLogout(); return; }
    }
    renderAdmin();
    if (admin.user && admin.items === null) loadAdminItems();
  }
  function closeAdmin() {
    $("#admin").hidden = true;
    const d = $("#adminDialog"); if (d) d.remove();
    syncScroll();
  }
  function adminShell(inner, loggedIn) {
    return `<header class="admin-head on-dark"><div class="container"><a class="logo" href="#top" data-action="admin-close"><svg class="logo-mark" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="url(#lg)"/><path d="M14 45 L32 15 L50 45 Z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><circle cx="32" cy="38" r="5" fill="#fff"/></svg><span>Comrade Price Salon</span></a>
      <div class="admin-actions"><button type="button" class="btn btn-outline-light btn-sm" data-action="admin-close">View website</button>${loggedIn ? `<button type="button" class="btn btn-outline-light btn-sm" data-action="admin-logout">${icon("logout")} Log out</button>` : ""}</div></div></header>
      <main class="container admin-main">${inner}</main>`;
  }

  function renderAdmin() {
    const root = $("#admin");
    if (root.hidden) return;
    if (!API_URL) {
      root.innerHTML = adminShell(`<div class="card pad login"><h1>Dashboard not connected</h1><p>The staff dashboard needs the backend. Set <strong>API_URL</strong> at the top of app.js to the backend address, then reload.</p></div>`, false);
      return;
    }
    if (!admin.token || !admin.user) {
      root.innerHTML = adminShell(`<form class="card pad login" data-form="login" novalidate><h1>Staff login</h1><p>Sign in to manage appointments, services, clothes and gallery.</p>
        <div class="alert alert-error" id="loginError" role="alert" hidden></div>
        <div class="field" style="margin-top:1.25rem"><label for="admEmail">Email</label><input id="admEmail" class="input" type="email" autocomplete="username" required></div>
        <div class="field"><label for="admPass">Password</label><input id="admPass" class="input" type="password" autocomplete="current-password" required></div>
        <button type="submit" class="btn btn-primary btn-block" id="loginBtn">Sign in</button></form>`, false);
      return;
    }
    const tabs = [["appointments", "Appointments"], ["services", "Services"], ["products", "Clothes"], ["gallery", "Gallery"]];
    root.innerHTML = adminShell(`<div class="admin-tabs" role="tablist" aria-label="Dashboard sections">${tabs.map((t) => `<button type="button" role="tab" class="chip" aria-selected="${admin.tab === t[0]}" data-action="admin-tab" data-id="${t[0]}">${t[1]}</button>`).join("")}</div>
      <div role="tabpanel">${admin.tab === "appointments" ? apptHTML() : resourceHTML(RESOURCES[admin.tab])}</div>`, true);
  }

  const flashHTML = () => (admin.flash ? `<p class="alert alert-ok" role="status">${esc(admin.flash)}</p>` : "") + (admin.error ? `<p class="alert alert-error" role="alert">${esc(admin.error)}</p>` : "");
  const loadingRows = (h) => `<div class="admin-list" aria-busy="true">${[0, 1, 2].map(() => `<div class="skeleton" style="height:${h}"></div>`).join("")}</div>`;

  async function loadAdminItems() {
    admin.items = null;
    admin.error = "";
    renderAdmin();
    try {
      admin.items = admin.tab === "appointments" ? await api("/appointments", { token: admin.token }) : await api("/" + admin.tab);
    } catch (e) { if (handleAuthError(e)) return; admin.error = e.message; admin.items = []; }
    renderAdmin();
  }

  function resourceHTML(cfg) {
    let list;
    if (admin.items === null) list = loadingRows("5rem");
    else if (!admin.items.length) list = `<div style="margin-top:1.5rem">${emptyState("No " + cfg.title.toLowerCase() + " yet", "Use the Add button to create the first one.")}</div>`;
    else list = `<ul class="admin-list">${admin.items.map((i) => `<li class="admin-row">${cfg.image ? `<div class="smart sq">${smartImg({ src: i.image_url, alt: "", kind: cfg.noun === "product" ? "fashion" : "hair", label: i[cfg.primary], cat: i.category, colours: i.colours })}</div>` : ""}
      <div class="grow"><strong>${esc(i[cfg.primary])}</strong><span>${esc(cfg.meta(i).join(", "))}</span></div>
      <div class="row-actions">${cfg.toggle ? `<button type="button" class="chip chip-sm" data-action="admin-toggle" data-id="${i.id}">${i[cfg.toggle.field] ? cfg.toggle.on : cfg.toggle.off}</button>` : ""}
        <button type="button" class="chip chip-sm" data-action="admin-edit" data-id="${i.id}" aria-label="Edit ${esc(i[cfg.primary])}">${icon("pencil")}&nbsp;Edit</button>
        <button type="button" class="chip chip-sm chip-danger" data-action="admin-delete" data-id="${i.id}" aria-label="Delete ${esc(i[cfg.primary])}">${icon("trash")}&nbsp;Delete</button></div></li>`).join("")}</ul>`;
    return `<div class="admin-title"><h2>${cfg.title}</h2><button type="button" class="btn btn-primary btn-sm" data-action="admin-add">${icon("plus")} Add ${cfg.noun}</button></div>${flashHTML()}${list}`;
  }

  function apptHTML() {
    const items = admin.items;
    const counts = (id) => (items ? ` (${items.filter((a) => a.status === id).length})` : "");
    const filters = `<div class="chips" style="margin-top:1rem;margin-bottom:0" role="group" aria-label="Filter by status"><button type="button" class="chip chip-sm" aria-pressed="${admin.filter === "all"}" data-action="admin-filter" data-id="all">All</button>${STATUSES.map((s) => `<button type="button" class="chip chip-sm" aria-pressed="${admin.filter === s.id}" data-action="admin-filter" data-id="${s.id}">${s.label}${counts(s.id)}</button>`).join("")}</div>`;
    let body;
    if (items === null) body = loadingRows("7rem");
    else {
      const shown = admin.filter === "all" ? items : items.filter((a) => a.status === admin.filter);
      body = !shown.length ? `<div style="margin-top:1.5rem">${emptyState("No appointments here", "New booking requests from the website will appear in this list.")}</div>`
        : `<ul class="admin-list">${shown.map((a) => `<li class="admin-row appt-card"><div class="appt-top"><div><strong style="font-size:1.1rem">${esc(a.full_name)}</strong><br><a href="tel:${esc(a.phone)}" style="color:var(--wine)">${esc(a.phone)}</a></div><span class="status st-${esc(a.status)}">${esc(labelOf(STATUSES, a.status))}</span></div>
          <p><strong>${esc(a.service_name)}</strong>, ${esc(fmtDate(a.preferred_date))} at ${esc(a.preferred_time)}</p>${a.notes ? `<p class="sub">Notes: ${esc(a.notes)}</p>` : ""}
          <div class="row-actions" style="margin-top:1rem">${[["confirmed", "Confirm"], ["completed", "Mark completed"], ["cancelled", "Cancel"]].filter((x) => x[0] !== a.status).map((x) => `<button type="button" class="chip chip-sm" data-action="admin-status" data-id="${a.id}" data-status="${x[0]}">${x[1]}</button>`).join("")}</div></li>`).join("")}</ul>`;
    }
    return `<div class="admin-title"><h2>Appointments</h2></div>${filters}${flashHTML()}${body}`;
  }

  function openAdminDialog(item) {
    const cfg = RESOURCES[admin.tab];
    const vals = item || cfg.defaults;
    const field = (f) => {
      const id = "f-" + f.name;
      const v = vals[f.name];
      let input;
      if (f.type === "checkbox") return `<div class="field"><label class="check"><input type="checkbox" id="${id}" ${v ? "checked" : ""}> ${f.label}</label></div>`;
      if (f.type === "textarea") input = `<textarea id="${id}" class="input" rows="3">${esc(v || "")}</textarea>`;
      else if (f.type === "select") input = `<select id="${id}" class="input">${f.options.map((o) => `<option value="${esc(o.value)}" ${o.value === v ? "selected" : ""}>${esc(o.label)}</option>`).join("")}</select>`;
      else if (f.type === "service") input = `<select id="${id}" class="input"><option value="">No matching service</option>${state.services.map((s) => `<option value="${esc(s.name)}" ${s.name === v ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select>`;
      else if (f.type === "list") input = `<input id="${id}" class="input" value="${esc(Array.isArray(v) ? v.join(", ") : "")}">`;
      else input = `<input id="${id}" class="input" ${f.type === "number" ? 'type="number" min="0"' : 'type="text"'} value="${esc(v == null ? "" : v)}" ${f.type === "image" ? "data-preview" : ""}>`;
      return `<div class="field"><label for="${id}">${f.label}</label>${input}${f.type === "image" ? `<div class="smart sq preview" id="preview-${f.name}">${v ? smartImg({ src: v, alt: "Photo preview", kind: "hair", label: "Preview" }) : ""}</div>` : ""}${f.help ? `<p class="help">${f.help}</p>` : ""}<p class="error-text" id="${id}-err" hidden></p></div>`;
    };
    const d = toEl(`<div class="modal" id="adminDialog"><form class="modal-panel dialog-form" data-form="item" data-id="${item ? item.id : ""}" role="dialog" aria-modal="true" aria-label="${item ? "Edit" : "Add"} ${cfg.noun}" novalidate>
      <div class="dialog-head"><h2>${item ? "Edit" : "Add"} ${cfg.noun}</h2><button type="button" class="modal-close" data-action="admin-dialog-close" aria-label="Close">${icon("x")}</button></div>
      <div class="alert alert-error" id="dialogError" role="alert" hidden></div>${cfg.fields.map(field).join("")}
      <div class="dialog-actions"><button type="submit" class="btn btn-primary" id="dialogSave">Save changes</button><button type="button" class="btn btn-outline" data-action="admin-dialog-close">Cancel</button></div></form></div>`);
    $("#admin").appendChild(d);
    syncScroll();
    const first = $("input, select, textarea", d); if (first) first.focus();
  }
  function closeAdminDialog() { const d = $("#adminDialog"); if (d) d.remove(); syncScroll(); }

  async function saveAdminItem(form) {
    const cfg = RESOURCES[admin.tab];
    const id = form.dataset.id;
    const payload = {};
    cfg.fields.forEach((f) => {
      const el = $("#f-" + f.name, form);
      if (f.type === "checkbox") payload[f.name] = el.checked;
      else if (f.type === "list") payload[f.name] = el.value.split(",").map((x) => x.trim()).filter(Boolean);
      else if (f.type === "number") payload[f.name] = el.value === "" ? "" : Number(el.value);
      else payload[f.name] = el.value;
    });
    const btn = $("#dialogSave");
    btn.disabled = true; btn.innerHTML = `${icon("loader", "spin")} Saving`;
    $$(".error-text", form).forEach((n) => { n.hidden = true; });
    $("#dialogError").hidden = true;
    try {
      await api(id ? `/${admin.tab}/${id}` : `/${admin.tab}`, { method: id ? "PUT" : "POST", token: admin.token, body: payload });
      closeAdminDialog();
      admin.flash = id ? "Changes saved." : `New ${cfg.noun} added.`;
      await loadAdminItems();
      loadCatalog();
    } catch (e) {
      if (handleAuthError(e)) return;
      Object.keys(e.fields || {}).forEach((k) => { const n = $("#f-" + k + "-err"); if (n) { n.textContent = e.fields[k]; n.hidden = false; } });
      const box = $("#dialogError"); box.textContent = e.message; box.hidden = false;
      btn.disabled = false; btn.textContent = "Save changes";
    }
  }

  async function adminMutate(fn, okMessage) {
    admin.flash = ""; admin.error = "";
    try { await fn(); admin.flash = okMessage; await loadAdminItems(); loadCatalog(); }
    catch (e) { if (handleAuthError(e)) return; admin.error = e.message; renderAdmin(); }
  }

  async function submitLogin(form) {
    const btn = $("#loginBtn"), err = $("#loginError");
    err.hidden = true; btn.disabled = true; btn.innerHTML = `${icon("loader", "spin")} Signing in`;
    try {
      const r = await api("/auth/login", { method: "POST", body: { email: $("#admEmail", form).value.trim(), password: $("#admPass", form).value } });
      try { localStorage.setItem(TOKEN_KEY, r.token); } catch (e) { /* session lasts until reload */ }
      admin.token = r.token; admin.user = r.user; admin.items = null;
      renderAdmin(); loadAdminItems();
    } catch (e) { err.textContent = e.message; err.hidden = false; btn.disabled = false; btn.textContent = "Sign in"; }
  }

  function route() {
    if (location.hash === "#admin") openAdmin(); else closeAdmin();
  }
  function leaveAdmin() {
    history.pushState(null, "", location.pathname + location.search);
    route();
    loadCatalog();
  }

  /* ================================= EVENTS ================================= */
  const actions = {
    "service-cat": (el) => { state.serviceCat = el.dataset.id; renderServices(); },
    "book-service": (el) => { const s = state.services.find((x) => sameId(x.id, el.dataset.id)); if (s) openBooking({ service: s.name }); },
    "gallery-cat": (el) => { state.galleryCat = el.dataset.id; state.galleryLimit = PAGE; renderGallery(); },
    "gallery-more": () => { state.galleryLimit += PAGE; renderGallery(); },
    "book-style": (el) => { const g = state.gallery.find((x) => sameId(x.id, el.dataset.id)); if (g) { closeModals(true); openBooking({ service: g.service_name || "", notes: "Style requested: " + g.style_name }); } },
    "open-style": (el) => openStyle(el.dataset.id),
    save: (el) => {
      const was = isSaved(el.dataset.type, el.dataset.id);
      toggleSaved(el.dataset.type, el.dataset.id);
      if (!was) { const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 12); }
      const live = $$('[data-action="save"]').filter((b) => b.dataset.type === el.dataset.type && sameId(b.dataset.id, el.dataset.id) && b.classList.contains("heart"));
      live.forEach((b) => { b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); });
    },
    "open-saved": () => openSaved(),
    "close-saved": (el, e) => { if (el.classList.contains("drawer") && e.target !== el) return; closeSaved(); },
    "saved-book": (el) => { const g = state.gallery.find((x) => sameId(x.id, el.dataset.id)); if (g) { closeSaved(true); openBooking({ service: g.service_name || "", notes: "Style requested: " + g.style_name }); } },
    "search-tag": (el) => { const i = $("#searchInput"); i.value = el.dataset.q; i.focus(); runSearch(); },
    "search-pick": (el) => {
      const t = el.dataset.type, id = el.dataset.id;
      closeSearch();
      if (t === "s") { const sv = state.services.find((x) => sameId(x.id, id)); if (sv) openBooking({ service: sv.name }); }
      else if (t === "g") openStyle(id);
      else openProduct(id);
    },
    "shop-cat": (el) => { state.shopCat = el.dataset.id; renderShop(); },
    "view-product": (el) => openProduct(el.dataset.id),
    "close-modal": (el, e) => { if (el.classList.contains("modal") && e.target !== el) return; closeModals(); },
    pick: (el) => { const s = selOf(findProduct(el.dataset.product).id); const k = el.dataset.kind; s[k] = s[k] === el.dataset.value ? "" : el.dataset.value; syncProduct(el.dataset.product); },
    "wa-toggle": (el) => {
      const wrap = el.closest("[data-wa-wrap]"), panel = $(".wa-panel", wrap);
      closeWaPanels(wrap);
      panel.hidden = !panel.hidden;
      el.setAttribute("aria-expanded", String(!panel.hidden));
    },
    "toggle-menu": () => setMenu($("#mobileMenu").hidden),
    "close-menu": () => setMenu(false),
    "booking-reset": () => { $("#bookingForm").reset(); resetBookingView(); renderTimeOptions(); showBookingErrors({}); },
    "admin-close": (el, e) => { e.preventDefault(); leaveAdmin(); },
    "admin-logout": () => adminLogout(),
    "admin-tab": (el) => { admin.tab = el.dataset.id; admin.flash = ""; admin.filter = "all"; loadAdminItems(); },
    "admin-filter": (el) => { admin.filter = el.dataset.id; renderAdmin(); },
    "admin-add": () => openAdminDialog(null),
    "admin-edit": (el) => openAdminDialog(admin.items.find((i) => sameId(i.id, el.dataset.id))),
    "admin-dialog-close": () => closeAdminDialog(),
    "admin-delete": (el) => {
      const cfg = RESOURCES[admin.tab], item = admin.items.find((i) => sameId(i.id, el.dataset.id));
      if (item && window.confirm(`Delete "${item[cfg.primary]}"? This cannot be undone.`)) adminMutate(() => api(`/${admin.tab}/${item.id}`, { method: "DELETE", token: admin.token }), `Deleted "${item[cfg.primary]}".`);
    },
    "admin-toggle": (el) => {
      const cfg = RESOURCES[admin.tab], item = admin.items.find((i) => sameId(i.id, el.dataset.id));
      if (item) adminMutate(() => api(`/${admin.tab}/${item.id}`, { method: "PUT", token: admin.token, body: { [cfg.toggle.field]: !item[cfg.toggle.field] } }), "Availability updated.");
    },
    "admin-status": (el) => adminMutate(() => api(`/appointments/${el.dataset.id}/status`, { method: "PATCH", token: admin.token, body: { status: el.dataset.status } }), "Appointment updated."),
  };

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (el && actions[el.dataset.action]) actions[el.dataset.action](el, e);
    if (!e.target.closest("[data-wa-wrap]")) closeWaPanels(null);
    if (!e.target.closest("#searchBox")) closeSearch();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeWaPanels(null);
    closeSearch();
    if ($("#adminDialog")) closeAdminDialog(); else if ($("#productModal") || $("#styleModal")) closeModals(); else if (!$("#saved").hidden) closeSaved(); else if (!$("#mobileMenu").hidden) setMenu(false);
  });
  document.addEventListener("submit", (e) => {
    const f = e.target;
    if (f.id === "bookingForm") submitBooking(e);
    else if (f.dataset.form === "login") { e.preventDefault(); submitLogin(f); }
    else if (f.dataset.form === "item") { e.preventDefault(); saveAdminItem(f); }
  });
  document.addEventListener("input", (e) => {
    if (e.target.matches("[data-preview]")) {
      const box = $("#preview-" + e.target.id.replace("f-", ""));
      if (box) box.innerHTML = e.target.value.trim() ? smartImg({ src: e.target.value.trim(), alt: "Photo preview", kind: "hair", label: "Preview" }) : "";
    }
  });
  window.addEventListener("hashchange", route);
  document.addEventListener("input", (e) => { if (e.target.id === "searchInput") runSearch(); });
  document.addEventListener("keydown", (e) => {
    if (e.target.id === "searchInput" && e.key === "Enter") { e.preventDefault(); const first = $("#searchResults .sr-item"); if (first) first.click(); }
  });
  document.addEventListener("focusin", (e) => { if (e.target.id === "searchInput" && e.target.value.trim()) runSearch(); });

  /* ================================== START ================================== */
  function renderAll() {
    renderServices(); renderGallery(); renderShop(); renderCollage(); renderServiceOptions(); renderHeroTag();
    updateSavedUI();
    observeReveals();
    if (admin.booted) renderAdmin();
  }

  function init() {
    hydrateIcons();
    fillContactDetails();
    buildWaPanels();
    renderHours();
    buildTicker();
    const date = bk("date");
    date.min = todayStr();
    date.addEventListener("change", () => { renderTimeOptions(); });
    ["fullName", "phone", "service", "date", "time", "notes"].forEach((k) => bk(k).addEventListener("input", () => { const o = $("#" + FIELD_ID[k] + "-error"); o.hidden = true; bk(k).setAttribute("aria-invalid", "false"); }));
    renderTimeOptions();
    renderAll();
    checkBrokenImages();
    admin.booted = true;
    route();
    loadCatalog();
    document.documentElement.classList.add("js");
    let ticking = false;
    const onScroll = () => {
      $("#siteHeader").classList.toggle("scrolled", window.scrollY > 6);
      let cur = "top";
      ["services", "gallery", "shop", "book", "about", "contact"].forEach((id) => { const sec = document.getElementById(id); if (sec && sec.getBoundingClientRect().top <= 120) cur = id; });
      $$(".nav-desktop a").forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + cur));
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
