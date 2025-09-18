# 🗺️ Google Maps API Setup - Troubleshooting

## ❌ Error: "This page can't load Google Maps correctly"

### 🔍 Diagnóstico del Problema

Este error indica que hay un problema con la configuración de Google Maps API. Aquí están las posibles causas y soluciones:

## 🚀 Solución Paso a Paso

### 1. **Verificar API Key**
```bash
# Revisar que existe en el archivo .env
cat frontend/.env | grep GOOGLE_MAPS
```

Debería mostrar:
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCbH7BdKombRuTBAOavP3zX4T8pw5eIVxo
```

### 2. **Configurar Google Cloud Console**

#### A. Ir a [Google Cloud Console](https://console.cloud.google.com/)

#### B. Habilitar APIs necesarias:
1. **Maps JavaScript API** ✅
2. **Places API** ✅
3. **Geocoding API** ✅

#### C. Configurar API Key:
1. Ir a **APIs & Services > Credentials**
2. Crear o editar la API Key
3. **Application restrictions:**
   - Seleccionar "HTTP referrers"
   - Agregar:
     - `http://localhost:*`
     - `http://127.0.0.1:*`
     - `https://localhost:*`
     - Tu dominio de producción

#### D. **API restrictions:**
   - Restringir key a:
     - Maps JavaScript API
     - Places API
     - Geocoding API

### 3. **Verificar Billing**
⚠️ **IMPORTANTE**: Google Maps API requiere billing habilitado, aunque tengas créditos gratuitos.

1. Ir a **Billing** en Google Cloud Console
2. Vincular un método de pago
3. Los primeros $200/mes son gratuitos

### 4. **Reiniciar Servidor de Desarrollo**
```bash
cd frontend
npm run dev
```

## 🛠️ Fallback Manual

Si Google Maps no funciona, el componente ahora incluye un fallback:

1. ⚠️ Aparecerá un campo amarillo con "API Key requerida"
2. 📝 Click en "Ingresar manualmente" para agregar direcciones
3. ✅ La funcionalidad básica funciona sin Google Maps

## 🧪 Probar la Configuración

### Método 1: Browser Console
```javascript
// Abrir DevTools (F12) y ejecutar:
console.log('API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
```

### Método 2: Test URL
```
https://maps.googleapis.com/maps/api/js?key=TU_API_KEY&libraries=places
```

### Método 3: Places API Test
```
https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=starbucks&inputtype=textquery&key=TU_API_KEY
```

## 🔧 Comandos Útiles

### Ver variables de entorno:
```bash
cd frontend
cat .env | grep VITE_GOOGLE
```

### Validar que la API Key funciona:
```bash
curl "https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=TU_API_KEY"
```

## 📋 Checklist de Verificación

- [ ] ✅ API Key configurada en `.env`
- [ ] ✅ Maps JavaScript API habilitada
- [ ] ✅ Places API habilitada
- [ ] ✅ Billing configurado en Google Cloud
- [ ] ✅ Dominios autorizados (localhost)
- [ ] ✅ Servidor reiniciado
- [ ] ✅ Browser cache limpiado

## 🆘 Si Nada Funciona

1. **Usar el fallback manual** - El componente funciona sin Google Maps
2. **Verificar la consola del browser** para errores específicos
3. **Revisar Google Cloud Console > APIs & Services > Dashboard** para errores
4. **Crear una nueva API Key** si la actual no funciona

## 💡 Tips

- Los **primeros $200/mes son gratuitos** en Google Maps API
- **Development local** necesita `http://localhost:*` autorizado
- **Cache del browser** puede causar problemas - usar Ctrl+F5
- **Network tab** en DevTools muestra si las requests fallan

---

**¿Sigue sin funcionar?** El componente tiene un fallback que permite ingresar direcciones manualmente. La funcionalidad principal no se ve afectada.
