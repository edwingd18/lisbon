# Tienda Lisbon — Hoja de ruta de mejoras

> Estado al 10 jul 2026. El rediseño premium del theme (5 fases) ya está hecho y commiteado.
> Mercado: **Colombia** · Marca actual: **SKIN1004** (celimax en pausa, secciones ocultas listas).

## 🔴 Para poder lanzar (imprescindible)

- [ ] **Páginas legales y de confianza**: política de envíos, devoluciones, privacidad, términos y "Sobre nosotros".
      Se crean en `Configuración → Políticas` y el footer las enlaza solo. Las pasarelas de pago las exigen.
- [ ] **Pagos locales colombianos**: pasarela (Wompi / Mercado Pago / PayU) con **PSE y tarjetas**.
      Evaluar **contraentrega** (clave en Colombia) y financiación (Addi / Sistecrédito).
- [ ] **Contenido real**:
  - [ ] Crear las 8 colecciones (handles exactos): `skincare`, `best-sellers`, `novedades`,
        `limpieza`, `tonicos-esencias`, `serums-ampollas`, `hidratacion`, `proteccion-solar`
  - [ ] Subir video/imagen al hero (theme editor)
  - [ ] Imágenes para el editorial de Centella y las colecciones de tipo
  - [ ] Actualizar el menú `main-menu`
- [ ] **Configuración regional**: zona de envío Colombia + tarifas, mercado principal Colombia,
      dirección de la tienda y moneda **COP** (`Configuración → General`).

## 🟠 Para vender más (alto impacto, poco esfuerzo)

- [x] **Botón de WhatsApp flotante** — hecho en el theme (317 879 8078, editable en Configuración del theme → Tienda Lisbon)
- [x] **Barra de envío gratis en el carrito** — hecha en el theme (umbral $100.000, editable ahí mismo)
- [ ] **Descuento de bienvenida real**: código automático de 10% (`Descuentos`) + Shopify Email
      para que llegue al suscribirse. El newsletter ya lo promete — ahora mismo la promesa está vacía.
- [ ] **Reseñas**: instalar Judge.me (gratis). Las tarjetas de producto ya soportan el namespace
      estándar `reviews.*` — no hay que tocar código.

## 🟡 Para crecer después

- [ ] **"Completa tu rutina"**: app gratuita Shopify Search & Discovery + activar la sección
      `complementary-products` de Dawn en la ficha de producto.
- [ ] **Guía/quiz de rutina** por tipo de piel, enlazada desde el hero.
- [ ] **Píxeles**: GA4, Meta Pixel y TikTok Pixel antes de invertir en pauta.
- [ ] **Blog educativo** (SEO): rutinas coreanas, centella, piel grasa en clima cálido…
- [ ] **Favicon y logo** en el theme editor.
- [ ] **UGC Instagram**: subir 4 fotos cuadradas a la sección `ugc_instagram` (está oculta),
      poner la URL real de Instagram y activarla.

## 📌 Recordatorios técnicos

- Al lanzar celimax: activar `compra_marca` e `ingrediente_celimax` (ocultas en el theme editor),
  crear colecciones `celimax` y `skin1004`, y devolver las menciones a noni en hero/marquee/FAQ.
- `seed-store.mjs` está desfasado (crea `skincare` + `hogar`); actualizarlo requiere token
  Admin API con `write_products`.
- Publicar cambios del theme: `shopify theme push --store lisbon-7usf5nur.myshopify.com --live`.
- Respaldo GitHub: hacer `git push` (hay commits locales sin subir).
