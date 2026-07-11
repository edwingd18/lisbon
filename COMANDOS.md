# Comandos Shopify — Tienda Lisbon

> Todos se ejecutan desde la carpeta del theme:
>
> ```powershell
> cd C:\Users\USER\work\lisbon\lisbon-theme
> ```
>
> Tienda: `lisbon-7usf5nur.myshopify.com`

---

## 🚀 Ver la tienda en local (lo del día a día)

```powershell
shopify theme dev --store lisbon-7usf5nur.myshopify.com
```

- Abre la vista previa en **http://127.0.0.1:9292**
- Recarga solo al guardar cambios (hot reload)
- También te da un link para compartir la vista previa con quien quieras
- Detener: `Ctrl + C`

Si el puerto 9292 está ocupado, usa otro:

```powershell
shopify theme dev --store lisbon-7usf5nur.myshopify.com --port 9293
```

## 🔑 Iniciar sesión (si te lo pide)

```powershell
shopify auth login
```

Y para cerrar sesión / cambiar de cuenta:

```powershell
shopify auth logout
```

## ✅ Revisar errores del theme antes de subir

```powershell
shopify theme check
```

## ⬆️ Subir el theme a Shopify

**Como theme NO publicado** (para revisarlo en el admin sin afectar la tienda en vivo):

```powershell
shopify theme push --store lisbon-7usf5nur.myshopify.com --unpublished --theme "Lisbon Rose"
```

**Directo a la tienda EN VIVO** (⚠️ reemplaza lo que ven los clientes):

```powershell
shopify theme push --store lisbon-7usf5nur.myshopify.com --live
```

Si lo corres sin banderas, te deja elegir el theme destino con flechas:

```powershell
shopify theme push --store lisbon-7usf5nur.myshopify.com
```

## ⬇️ Bajar cambios hechos desde el theme editor

Si editaste algo en el admin (theme editor) y quieres traerlo al código:

```powershell
shopify theme pull --store lisbon-7usf5nur.myshopify.com
```

## 📋 Ver los themes que hay en la tienda

```powershell
shopify theme list --store lisbon-7usf5nur.myshopify.com
```

## 🌐 Publicar un theme ya subido

```powershell
shopify theme publish --store lisbon-7usf5nur.myshopify.com
```

(te deja elegir cuál de los themes subidos pasa a ser el vivo)

---

## 💾 Git (respaldo del código)

Desde la raíz del repo (`C:\Users\USER\work\lisbon`):

```powershell
git status          # ver qué hay pendiente
git add -A          # preparar todos los cambios
git commit -m "descripción del cambio"
git push            # subir a GitHub
```

---

## 🔁 Flujo recomendado

1. `shopify theme dev ...` → trabajar y ver cambios en local
2. `shopify theme check` → revisar que no haya errores
3. `git add -A` + `git commit` → guardar en git
4. `shopify theme push --unpublished ...` → probar en el admin
5. Cuando esté todo OK → `shopify theme push --live` (o `theme publish`)
6. `git push` → respaldo en GitHub
