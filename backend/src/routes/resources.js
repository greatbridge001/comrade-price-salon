import { createCrudRouter } from "./crud.js";

const SERVICE_CATEGORIES = ["locks", "twists", "other"];
const PRODUCT_CATEGORIES = ["dresses", "tops", "trousers", "skirts", "jeans", "sets", "hoodies", "sweaters", "accessories"];
const GALLERY_CATEGORIES = ["braids", "twists", "locs", "natural", "other"];

export const servicesRouter = createCrudRouter({
  table: "services",
  orderBy: "sort_order, id",
  fields: [
    { name: "category", type: "enum", values: SERVICE_CATEGORIES, required: true },
    { name: "name", type: "string", max: 80, required: true },
    { name: "price", type: "int", required: true },
    { name: "description", type: "string", max: 300 },
    { name: "sort_order", type: "int" },
  ],
});

export const productsRouter = createCrudRouter({
  table: "products",
  orderBy: "sort_order, id",
  fields: [
    { name: "name", type: "string", max: 100, required: true },
    { name: "category", type: "enum", values: PRODUCT_CATEGORIES, required: true },
    { name: "price", type: "int", required: true },
    { name: "description", type: "string", max: 500 },
    { name: "sizes", type: "array" },
    { name: "colours", type: "array" },
    { name: "image_url", type: "url" },
    { name: "in_stock", type: "bool" },
    { name: "sort_order", type: "int" },
  ],
});

export const galleryRouter = createCrudRouter({
  table: "gallery",
  orderBy: "sort_order, id",
  fields: [
    { name: "style_name", type: "string", max: 100, required: true },
    { name: "category", type: "enum", values: GALLERY_CATEGORIES, required: true },
    { name: "starting_price", type: "int", required: true },
    { name: "service_name", type: "string", max: 100 },
    { name: "image_url", type: "url" },
    { name: "sort_order", type: "int" },
  ],
});
