// ============================================================
//  seed-store.mjs — Puebla la tienda Lisbon con datos de ejemplo
//  Crea 2 colecciones + 8 productos, los publica en la tienda
//  online y los asigna a su colección. Vía Admin GraphQL API.
//
//  Uso (PowerShell, en una sola línea para no guardar el token):
//    $env:SHOPIFY_ADMIN_TOKEN="shpat_xxx"; node seed-store.mjs
//
//  Requiere Node 18+ (usa fetch global).
// ============================================================

const STORE = process.env.SHOPIFY_STORE || "lisbon-7usf5nur.myshopify.com";
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = "2026-01";

if (!TOKEN) {
  console.error("❌ Falta el token. Corre:  $env:SHOPIFY_ADMIN_TOKEN=\"shpat_...\"; node seed-store.mjs");
  process.exit(1);
}

const ENDPOINT = `https://${STORE}/admin/api/${API_VERSION}/graphql.json`;

async function gql(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error("GraphQL: " + JSON.stringify(json.errors, null, 2));
  }
  return json.data;
}

// Devuelve todos los userErrors de una respuesta (o [])
function errsOf(payload) {
  return (payload && payload.userErrors) || [];
}

// ---- Datos de ejemplo --------------------------------------
const collections = [
  {
    key: "skincare",
    title: "Skincare Coreano",
    handle: "skincare",
    descriptionHtml:
      "<p>Fórmulas suaves y efectivas de la mejor cosmética coreana: limpieza, hidratación y rituales para una piel sana.</p>",
  },
  {
    key: "hogar",
    title: "Hogar",
    handle: "hogar",
    descriptionHtml:
      "<p>Objetos útiles y bonitos para tu día a día: piezas que hacen del hogar un lugar más cálido.</p>",
  },
];

const products = [
  // --- Skincare ---
  {
    collection: "skincare",
    title: "Espuma Limpiadora de Té Verde",
    productType: "Limpiador facial",
    price: "12.90",
    tags: ["skincare", "limpiador", "té verde"],
    bodyHtml:
      "<p>Limpiador facial en espuma con extracto de té verde. Elimina impurezas y controla el exceso de grasa sin resecar. Deja la piel fresca y equilibrada.</p><p><strong>Modo de uso:</strong> aplica sobre piel húmeda, masajea y enjuaga con agua tibia.</p>",
  },
  {
    collection: "skincare",
    title: "Tónico Equilibrante de Centella",
    productType: "Tónico",
    price: "16.50",
    tags: ["skincare", "tónico", "centella"],
    bodyHtml:
      "<p>Tónico calmante con Centella Asiatica. Reduce rojeces, hidrata y prepara la piel para el resto de tu rutina.</p><p><strong>Modo de uso:</strong> aplica con algodón o con las manos tras la limpieza.</p>",
  },
  {
    collection: "skincare",
    title: "Sérum de Niacinamida 10%",
    productType: "Sérum",
    price: "19.90",
    tags: ["skincare", "sérum", "niacinamida"],
    bodyHtml:
      "<p>Sérum concentrado con 10% de niacinamida. Unifica el tono, minimiza los poros y aporta luminosidad.</p><p><strong>Modo de uso:</strong> aplica unas gotas por la mañana y/o noche antes de la crema.</p>",
  },
  {
    collection: "skincare",
    title: "Crema Hidratante de Ácido Hialurónico",
    productType: "Hidratante",
    price: "22.00",
    tags: ["skincare", "hidratante", "ácido hialurónico"],
    bodyHtml:
      "<p>Crema ligera con ácido hialurónico que hidrata en profundidad durante 24h. Textura gel-crema de rápida absorción.</p><p><strong>Modo de uso:</strong> aplica como último paso de tu rutina.</p>",
  },
  // --- Hogar ---
  {
    collection: "hogar",
    title: "Difusor de Aromas Minimalista",
    productType: "Aromaterapia",
    price: "34.00",
    tags: ["hogar", "aromaterapia", "difusor"],
    bodyHtml:
      "<p>Difusor ultrasónico de líneas minimalistas. Humidifica y perfuma tus espacios con luz ambiental suave.</p>",
  },
  {
    collection: "hogar",
    title: "Set de Toallas de Algodón",
    productType: "Textil",
    price: "18.00",
    tags: ["hogar", "baño", "algodón"],
    bodyHtml:
      "<p>Juego de toallas 100% algodón, suaves y absorbentes. Colores neutros que combinan con cualquier baño.</p>",
  },
  {
    collection: "hogar",
    title: "Vela de Soja «Jardín Coreano»",
    productType: "Vela aromática",
    price: "15.00",
    tags: ["hogar", "vela", "cera de soja"],
    bodyHtml:
      "<p>Vela de cera de soja natural con notas florales y cítricas. Hasta 40 horas de aroma limpio y envolvente.</p>",
  },
  {
    collection: "hogar",
    title: "Organizador de Bambú para Baño",
    productType: "Organización",
    price: "24.00",
    tags: ["hogar", "baño", "bambú"],
    bodyHtml:
      "<p>Organizador de bambú sostenible para mantener tus esenciales de skincare a mano y en orden.</p>",
  },
];

// ---- Mutaciones --------------------------------------------
const M_COLLECTION_CREATE = `
  mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id title handle }
      userErrors { field message }
    }
  }`;

const M_PRODUCT_CREATE = `
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product { id title variants(first: 1) { nodes { id } } }
      userErrors { field message }
    }
  }`;

const M_VARIANT_UPDATE = `
  mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants { id price }
      userErrors { field message }
    }
  }`;

const M_COLLECTION_ADD = `
  mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
    collectionAddProducts(id: $id, productIds: $productIds) {
      collection { id }
      userErrors { field message }
    }
  }`;

const M_PUBLISH = `
  mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }`;

const Q_PUBLICATIONS = `
  query { publications(first: 20) { nodes { id name } } }`;

// ---- Ejecución ---------------------------------------------
async function main() {
  console.log(`🌸 Poblando ${STORE} (API ${API_VERSION})\n`);

  // 1) Publicación "Online Store"
  const pubData = await gql(Q_PUBLICATIONS);
  const online = pubData.publications.nodes.find((p) =>
    /online store/i.test(p.name)
  );
  if (!online) throw new Error("No se encontró la publicación 'Online Store'.");
  const onlineId = online.id;
  console.log(`✔ Publicación Online Store: ${onlineId}\n`);

  // 2) Crear colecciones
  const collIds = {};
  for (const c of collections) {
    const d = await gql(M_COLLECTION_CREATE, {
      input: { title: c.title, handle: c.handle, descriptionHtml: c.descriptionHtml },
    });
    const errs = errsOf(d.collectionCreate);
    if (errs.length) { console.warn(`⚠ Colección ${c.title}:`, errs); }
    const col = d.collectionCreate.collection;
    if (col) {
      collIds[c.key] = col.id;
      await gql(M_PUBLISH, { id: col.id, input: [{ publicationId: onlineId }] });
      console.log(`✔ Colección: ${col.title} (${col.handle})`);
    }
  }
  console.log("");

  // 3) Crear productos, precio, publicar y asignar a colección
  const byCollection = {};
  for (const p of products) {
    const d = await gql(M_PRODUCT_CREATE, {
      input: {
        title: p.title,
        descriptionHtml: p.bodyHtml,
        productType: p.productType,
        vendor: "Lisbon",
        tags: p.tags,
        status: "ACTIVE",
      },
    });
    const errs = errsOf(d.productCreate);
    if (errs.length) { console.warn(`⚠ Producto ${p.title}:`, errs); continue; }
    const prod = d.productCreate.product;
    const variantId = prod.variants.nodes[0].id;

    // precio
    const vu = await gql(M_VARIANT_UPDATE, {
      productId: prod.id,
      variants: [{ id: variantId, price: p.price }],
    });
    const vErrs = errsOf(vu.productVariantsBulkUpdate);
    if (vErrs.length) console.warn(`⚠ Precio ${p.title}:`, vErrs);

    // publicar en Online Store
    await gql(M_PUBLISH, { id: prod.id, input: [{ publicationId: onlineId }] });

    (byCollection[p.collection] ||= []).push(prod.id);
    console.log(`✔ Producto: ${p.title} — $${p.price}`);
  }
  console.log("");

  // 4) Asignar productos a sus colecciones
  for (const [key, ids] of Object.entries(byCollection)) {
    if (!collIds[key]) continue;
    const d = await gql(M_COLLECTION_ADD, { id: collIds[key], productIds: ids });
    const errs = errsOf(d.collectionAddProducts);
    if (errs.length) console.warn(`⚠ Asignar a ${key}:`, errs);
    else console.log(`✔ ${ids.length} productos → colección "${key}"`);
  }

  console.log("\n✅ Listo. Revisa el admin y recarga el preview del theme.");
}

main().catch((e) => {
  console.error("\n❌ Error:", e.message);
  process.exit(1);
});
