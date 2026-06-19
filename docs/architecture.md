# Architecture — What does “doing a good job” mean?

> Este documento define el estándar de calidad. Los agentes revisores
> evalúan código contra este archivo. Si no está aquí, no es un requisito.

## Principes

1. **MVVM** Implement MVVM for architecture
2. **Group imports Barrel** Group imports with barrel files by type
3. **Repository Pattern** Implement repository pattern for encapsulate all data services
    - Repositories must abstract response with result pattern (src/data/core/result.ts) instance.
    - Repositories must use `to` utility function (src/data/core/to.ts) to wrap async functions.

```ts
import { to, Result } from '@/src/data/core';

// Must be a class, function or a closure with a interface return type defined
export async function RepositoryPatterExample() {
    const [data, error] = await to(fetch('http://example.com/pokemons'));

    if (error) {
      return Result.failed(new Error(error.message));
    }

    return Result.success(data);
}
```


## Qué NO hacer

- No usar `console.log()` para errores.
- No leer/escribir el archivo en cada operación dentro de un bucle. Carga al inicio, modifica en memoria, guarda al final.
- No añadir un sistema de configuración. La ruta del archivo se pasa explícitamente o usa la constante por defecto.