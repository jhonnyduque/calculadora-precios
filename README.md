# Calculadora de Precios

Sistema para la gestión de productos, materias primas y cálculo de costos, márgenes y precios finales.

Este proyecto busca centralizar la lógica de precios de forma clara, trazable y extensible, separando reglas de negocio, contratos de API y futuras capas de seguridad.

---

## 🎯 Objetivo

- Gestionar productos y sus costos base
- Calcular precios finales a partir de márgenes configurables
- Mantener contratos de API claros y versionados
- Escalar progresivamente en seguridad y arquitectura

---

## 📌 Estado del proyecto

### Fase actual
- ✅ **Fase 0 completada**: contrato API de Producto v1.0 congelado y archivado

### Próximo paso
- 🔐 **Fase 1 – Autenticación mínima (JWT)**

---

## 📂 Estructura relevante

docs/
└─ api-contratos/
   └─ producto-v1.0.md   # Contrato API congelado

---

## 🧩 Tecnologías previstas

- Node.js + Express
- TypeScript
- PostgreSQL
- JWT para autenticación

---

## 📝 Notas

- Los contratos API se versionan y **no se modifican sin renegociación**
- El desarrollo seguirá un enfoque incremental por fases
- La documentación es parte central del proyecto

---

✍️ Proyecto en evolución.  
Cada fase cerrada queda reflejada explícitamente en commits y documentación.
