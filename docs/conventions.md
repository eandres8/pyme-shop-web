# Coding conventions

## Code styles

- **Format:** PEP 8. Lines should be no longer than 100 characters.
- **Imports:** Sort imports based on their importance within the project, owned imports after a space to separate from npm installations
- **Strings:** single quotes `'...'` always. double quotation marks for JSX props
- **f-strings** always string interpolation

## Names

| Tipo             | Convención          | Ejemplo              |
| ---------------- | ------------------- | -------------------- |
| component folder | `kebab-case`        | `HeroCard.tsx`       |
| Components       | `PascalCase`        | `Note.tsx`           |
| variables        | `standardCamelCase` | `heroName`           |
| Functions        | `standardCamelCase` | `loadCamelCase()`    |
| Constants        | `UPPER_SNAKE`       | `DEFAULT_NOTES_PATH` |
| Private          | prefix `_`          | `_atomicWrite`      |

## Estructura de archivo

Cada archivo en `src/` empieza con:

```jsx
import Link from 'next/link';

// own imports as utils, types, components, etc

export const HeroCard: React.FC = () => {
  return (
    <div>
      <Link href="/">go to</Link>
    </div>
  );
}
```

## Tests

- One test file per component: `hero-card/hero-card.spec.ts`.

## Comments

By default, they are **not** written. They are only allowed when they explain a _reason_
that isn't obvious (e.g., a documented workaround, a subtle invariant). The names should
do the rest.
