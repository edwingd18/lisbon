// ============================================================
//  seed-images.mjs — Adjunta imágenes de DEMO a los productos
//  y colecciones de la tienda Lisbon.
//
//  Descarga fotos temáticas (LoremFlickr, con fallback a Picsum),
//  las sube a Shopify vía staged upload y las asigna. Reemplaza
//  luego por las fotos reales del catálogo.
//
//  Uso (PowerShell):
//    $env:SHOPIFY_ADMIN_TOKEN="shpat_xxx"; node seed-images.mjs
//
//  Scopes necesarios: write_products, read_products, write_files
//  Requiere Node 18+ (fetch + Buffer globales).
// ============================================================

const STORE = process.env.SHOPIFY_STORE || "lisbon-7usf5nur.myshopify.com";
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = "2026-01";

if (!TOKEN) {
  console.error('❌ Falta el token. Corre:  $env:SHOPIFY_ADMIN_TOKEN="shpat_..."; node seed-images.mjs');
  process.exit(1);
}

const ENDPOINT = `https://${STORE}/admin/api/${API_VERSION}/graphql.json`;

async function gql(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error("GraphQL: " + JSON.stringify(json.errors, null, 2));
  return json.data;
}

// ---- Descarga una imagen temática (con fallback) -----------
async function fetchImage(keywords, lock) {
  const candidates = [
    `https://loremflickr.com/1200/1200/${encodeURIComponent(keywords)}?lock=${lock}`,
    `https://picsum.photos/seed/lisbon-${lock}/1200/1200`,
  ];
  for (const url of candidates) {
    try {
      const r = await fetch(url, { redirect: "follow" });
      if (!r.ok) continue;
      const ct = (r.headers.get("content-type") || "").split(";")[0] || "image/jpeg";
      if (!ct.startsWith("image/")) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 1000) continue; // descarta respuestas vacías/errores
      return { buf, mimeType: ct };
    } catch {
      /* intenta el siguiente candidato */
    }
  }
  throw new Error(`No se pudo descargar imagen para "${keywords}"`);
}

// ---- Staged upload: sube bytes y devuelve el resourceUrl ----
const M_STAGED = `
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets { url resourceUrl parameters { name value } }
      userErrors { field message }
    }
  }`;

async function stagedUpload(filename, mimeType, buf) {
  const d = await gql(M_STAGED, {
    input: [{ resource: "IMAGE", filename, mimeType, httpMethod: "PUT" }],
  });
  const errs = d.stagedUploadsCreate.userErrors;
  if (errs.length) throw new Error("staged: " + JSON.stringify(errs));
  const t = d.stagedUploadsCreate.stagedTargets[0];
  const put = await fetch(t.url, { method: "PUT", headers: { "Content-Type": mimeType }, body: buf });
  if (!put.ok) throw new Error(`PUT staged falló: ${put.status}`);
  return t.resourceUrl;
}

// ---- Mutaciones de asignación ------------------------------
const M_PRODUCT_MEDIA = `
  mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media { ... on MediaImage { id } status }
      mediaUserErrors { field message }
    }
  }`;

const M_COLLECTION_UPDATE = `
  mutation collectionUpdate($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection { id }
      userErrors { field message }
    }
  }`;

const Q_PRODUCTS = `query { products(first: 50) { nodes { id title } } }`;
const Q_COLLECTIONS = `query { collections(first: 50) { nodes { id handle title } } }`;

// ---- Mapa: título de producto → palabras clave de imagen ----
const productKeywords = {
  "Espuma Limpiadora de Té Verde": "skincare,cleanser,cosmetics",
  "Tónico Equilibrante de Centella": "skincare,toner,bottle",
  "Sérum de Niacinamida 10%": "serum,skincare,dropper",
  "Crema Hidratante de Ácido Hialurónico": "moisturizer,cream,skincare",
  "Difusor de Aromas Minimalista": "diffuser,aromatherapy,home",
  "Set de Toallas de Algodón": "towels,bathroom,cotton",
  "Vela de Soja «Jardín Coreano»": "candle,home,decor",
  "Organizador de Bambú para Baño": "bamboo,organizer,bathroom",
};

const collectionKeywords = {
  skincare: "skincare,cosmetics,beauty",
  hogar: "home,interior,decor",
};

// ---- Ejecución ---------------------------------------------
async function main() {
  console.log(`🖼️  Añadiendo imágenes de demo a ${STORE}\n`);

  // Productos
  const prods = (await gql(Q_PRODUCTS)).products.nodes;
  let lock = 10;
  for (const p of prods) {
    const kw = productKeywords[p.title];
    if (!kw) continue;
    lock++;
    try {
      const { buf, mimeType } = await fetchImage(kw, lock);
      const ext = mimeType.includes("png") ? "png" : "jpg";
      const src = await stagedUpload(`prod-${lock}.${ext}`, mimeType, buf);
      const d = await gql(M_PRODUCT_MEDIA, {
        productId: p.id,
        media: [{ originalSource: src, mediaContentType: "IMAGE", alt: p.title }],
      });
      const errs = d.productCreateMedia.mediaUserErrors;
      if (errs.length) console.warn(`⚠ ${p.title}:`, errs);
      else console.log(`✔ Imagen → ${p.title}`);
    } catch (e) {
      console.warn(`⚠ ${p.title}: ${e.message}`);
    }
  }
  console.log("");

  // Colecciones
  const cols = (await gql(Q_COLLECTIONS)).collections.nodes;
  for (const c of cols) {
    const kw = collectionKeywords[c.handle];
    if (!kw) continue;
    lock++;
    try {
      const { buf, mimeType } = await fetchImage(kw, lock);
      const ext = mimeType.includes("png") ? "png" : "jpg";
      const src = await stagedUpload(`col-${c.handle}.${ext}`, mimeType, buf);
      const d = await gql(M_COLLECTION_UPDATE, {
        input: { id: c.id, image: { src } },
      });
      const errs = d.collectionUpdate.userErrors;
      if (errs.length) console.warn(`⚠ Colección ${c.title}:`, errs);
      else console.log(`✔ Imagen → colección "${c.title}"`);
    } catch (e) {
      console.warn(`⚠ Colección ${c.title}: ${e.message}`);
    }
  }

  console.log("\n✅ Listo. Recarga el preview del theme (las imágenes tardan unos segundos en procesarse).");
}

main().catch((e) => {
  console.error("\n❌ Error:", e.message);
  process.exit(1);
});
