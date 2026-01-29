# Contrato API - Producto v1.0 (congelado 29/01/2026)

Versión definitiva.  
No cambiar nombres de campos ni reglas sin renegociar con backend.
Este contrato rige POST, PUT y GET /api/productos y debe mantenerse sincronizado entre frontend y backend.


Fecha de congelación: 29 de enero de 2026  
Responsable: Equipo Backend

## Interfaces TypeScript (DTOs)

```typescript
// ============================================================================
// INPUT DTOs
// ============================================================================
/**
 * Materia prima individual dentro del array materias_primas
 */
interface MateriaPrimaInputDTO {
  /**
   * UUID de la materia prima existente
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  materia_prima_id: string;
  /**
   * Cantidad numérica a utilizar (debe ser > 0)
   * @example 80
   */
  cantidad: number;
  /**
   * Unidad de medida
   */
  unidad: 'metro' | 'centimetro' | 'milimetro' | 'kilogramo' | 'gramo' | 'miligramo' | 'litro' | 'mililitro' | 'unidad';
}
/**
 * Body para POST /api/productos
 */
interface CreateProductoDTO {
  /**
   * Nombre del producto (obligatorio, único, max 255 chars)
   * @example "Cojín decorativo 40x40cm"
   */
  nombre: string;
  /**
   * Descripción del producto (opcional)
   * @example "Cojín con relleno natural"
   */
  descripcion?: string;
  /**
   * Código de referencia interno (opcional, max 50 chars)
   * @example "COJ-001"
   */
  referencia?: string;
  /**
   * Array de materias primas (obligatorio, mínimo 1 elemento)
   */
  materias_primas: MateriaPrimaInputDTO[];
  /**
   * Margen de ganancia porcentual deseado (opcional, >= 0)
   * @example 35
   */
  margen_ganancia?: number;
  /**
   * Precio de venta fijo (opcional, >= 0)
   * Si se especifica, prevalece sobre margen_ganancia
   * @example 54.99
   */
  precio_venta?: number;
  /**
   * Tiempo de fabricación en minutos (opcional, >= 0)
   * @example 45
   */
  tiempo_fabricacion_minutos?: number;
  /**
   * Nivel de dificultad (opcional)
   */
  dificultad?: 'facil' | 'media' | 'dificil' | 'experto';
}
/**
 * Body para PUT /api/productos/:id
 *
 * COMPORTAMIENTO materias_primas:
 * - Si se envía → REPLACE COMPLETO (elimina todo y crea lo nuevo)
 * - Si se envía [] → ELIMINA todas las asociaciones
 * - Si NO se envía → NO modifica materias primas existentes
 *
 * CAMPOS PROHIBIDOS (no enviar):
 * id, created_at, updated_at, costo_total, margen_porcentaje, utilidad, estado, created_by, actualizado_por
 */
interface UpdateProductoDTO {
  /**
   * Nombre del producto (opcional, debe ser único si se envía)
   * @example "Cojín decorativo 45x45cm"
   */
  nombre?: string;
  /**
   * Descripción del producto (opcional)
   * @example "Cojín mejorado"
   */
  descripcion?: string;
  /**
   * Código de referencia interno (opcional)
   * @example "COJ-001-V2"
   */
  referencia?: string;
  /**
   * Array de materias primas (opcional)
   * REPLACE COMPLETO: elimina todas las existentes y crea las nuevas
   */
  materias_primas?: MateriaPrimaInputDTO[];
  /**
   * Margen de ganancia porcentual (opcional, >= 0)
   * Recalcula precio_venta automáticamente
   * @example 40
   */
  margen_ganancia?: number;
  /**
   * Precio de venta fijo (opcional, >= 0)
   * Prevalece sobre margen_ganancia si se especifica
   * @example 59.99
   */
  precio_venta?: number;
  /**
   * Tiempo de fabricación en minutos (opcional, >= 0)
   * @example 50
   */
  tiempo_fabricacion_minutos?: number;
  /**
   * Nivel de dificultad (opcional)
   */
  dificultad?: 'facil' | 'media' | 'dificil' | 'experto';
}
// ============================================================================
// RESPONSE DTO
// ============================================================================
/**
 * Respuesta completa de POST, PUT y GET /api/productos/:id
 */
interface ProductoResponseDTO {
  /**
   * Indica si la operación fue exitosa
   */
  readonly success: true;
  /**
   * Mensaje descriptivo (presente en POST/PUT, ausente en GET)
   * @example "Producto creado exitosamente"
   */
  readonly message?: string;
  /**
   * Datos del producto
   */
  readonly data: {
    /**
     * UUID del producto
     */
    readonly id: string;
    /**
     * Nombre del producto
     */
    readonly nombre: string;
    /**
     * Descripción del producto
     */
    readonly descripcion: string | null;
    /**
     * Código de referencia interno
     */
    readonly referencia: string | null;
    /**
     * Costo total calculado (suma de materias primas, en €)
     * @example 38.10
     */
    readonly costo_total: number;
    /**
     * Precio de venta (en €)
     * @example 51.44
     */
    readonly precio_venta: number;
    /**
     * Margen de ganancia porcentual calculado
     * @example 35.00
     */
    readonly margen_porcentaje: number;
    /**
     * Utilidad neta (en €)
     * @example 13.34
     */
    readonly utilidad: number;
    /**
     * Tiempo de fabricación en minutos
     */
    readonly tiempo_fabricacion_minutos: number | null;
    /**
     * Nivel de dificultad
     */
    readonly dificultad: 'facil' | 'media' | 'dificil' | 'experto' | null;
    /**
     * Estado del producto
     */
    readonly estado: 'activo' | 'inactivo';
    /**
     * Fecha de creación (ISO 8601)
     * @example "2026-01-29T10:30:00.000Z"
     */
    readonly created_at: string;
    /**
     * Fecha de última actualización (ISO 8601)
     * @example "2026-01-29T10:30:00.000Z"
     */
    readonly updated_at: string;
    /**
     * Nombre del usuario que creó el producto
     */
    readonly creado_por: string | null;
    /**
     * Nombre del usuario que actualizó el producto
     */
    readonly actualizado_por: string | null;
    /**
     * Array de materias primas con cálculos
     */
    readonly materias_primas: readonly {
      /**
       * UUID de la materia prima
       */
      readonly materia_prima_id: string;
      /**
       * Nombre de la materia prima
       */
      readonly nombre: string;
      /**
       * Tipo de materia prima
       */
      readonly tipo: string;
      /**
       * Cantidad utilizada en el producto
       */
      readonly cantidad_utilizada: number;
      /**
       * Unidad de medida utilizada
       */
      readonly unidad_utilizada: string;
      /**
       * Costo calculado de esta materia prima (en €)
       */
      readonly costo_calculado: number;
      /**
       * Precio por unidad de compra de la materia prima (en €)
       */
      readonly precio_por_unidad: number;
      /**
       * Unidad de compra de la materia prima
       */
      readonly unidad_compra: string;
      /**
       * Notas adicionales
       */
      readonly notas: string | null;
    }[];
  };
}


Ejemplos de payloads
POST /api/productos

{
  "nombre": "Cojín decorativo 40x40cm",
  "materias_primas": [
    {
      "materia_prima_id": "550e8400-e29b-41d4-a716-446655440000",
      "cantidad": 80,
      "unidad": "centimetro"
    }
  ],
  "margen_ganancia": 35
}


PUT /api/productos/:id
Caso: Actualizar campos escalares
{
  "nombre": "Cojín decorativo 45x45cm",
  "margen_ganancia": 40
}


Caso: Eliminar todas las materias primas
{
  "materias_primas": []
}


Respuesta (POST, PUT, GET /:id)
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "nombre": "Cojín decorativo 40x40cm",
    "descripcion": null,
    "referencia": null,
    "costo_total": 9.60,
    "precio_venta": 12.96,
    "margen_porcentaje": 35.00,
    "utilidad": 3.36,
    "tiempo_fabricacion_minutos": null,
    "dificultad": null,
    "estado": "activo",
    "created_at": "2026-01-29T10:30:00.000Z",
    "updated_at": "2026-01-29T10:30:00.000Z",
    "creado_por": "Sistema",
    "actualizado_por": null,
    "materias_primas": [
      {
        "materia_prima_id": "550e8400-e29b-41d4-a716-446655440000",
        "nombre": "Tela algodón",
        "tipo": "tela",
        "cantidad_utilizada": 80,
        "unidad_utilizada": "centimetro",
        "costo_calculado": 9.60,
        "precio_por_unidad": 12.00,
        "unidad_compra": "metro",
        "notas": null
      }
    ]
  }
}


Contrato congelado – Notas críticas para frontend

snake_case obligatorio: Todos los campos JSON usan snake_case sin excepciones
Unidades válidas: Solo 'metro' | 'centimetro' | 'milimetro' | 'kilogramo' | 'gramo' | 'miligramo' | 'litro' | 'mililitro' | 'unidad'
PUT materias_primas: Si se envía (incluido []), replace completo; si NO se envía, no modifica existentes
Fallback automático 30%: Si en POST no se envía ni margen_ganancia ni precio_venta, backend aplica 30% sobre costo_total
margen_ganancia vs margen_porcentaje: Input usa margen_ganancia (deseado), output usa margen_porcentaje (calculado real)
precio_venta prevalece: Si se envía precio_venta, prevalece sobre margen_ganancia
Campos calculados readonly: costo_total, margen_porcentaje, utilidad nunca se envían en POST/PUT
Campos prohibidos en PUT: id, created_at, updated_at, estado, created_by, actualizado_por
IDs siempre string: materia_prima_id e id son strings con formato UUID v4
Estado siempre activo: Productos nuevos siempre tienen estado: 'activo', no modificable por frontend
precio_venta en la respuesta siempre representa el valor FINAL aplicado por el backend (fijo o calculado con margen)



