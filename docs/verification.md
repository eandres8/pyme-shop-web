# Verificación — Cómo demostrar que el trabajo funciona

> Regla de oro: **el agente no dice "funciona", lo demuestra**.
> Toda feature termina con evidencia ejecutable, no con afirmaciones.

## Niveles de verificación

### Nivel 1 — Tests unitarios (obligatorio)

Toda función pública en `src/` tiene al menos un test:

1. Cubre el camino feliz.
2. Cubre al menos un camino de error si la función puede fallar.
3. Genera entidades mock para optimizar las pruebas unitarios en `tests/mocks/`.

Comando:
```bash
pnpm run test
```

## Anti-patrones (no hacer)

- ❌ "He añadido el comando, debería funcionar." → falta test ejecutable.
- ❌ Test que solo verifica que la función no lanza excepción. → tiene que comprobar el resultado concreto.
- ❌ `mock` del filesystem.
