---
description: Canvas Performance Requirements
globs: ["**/*canvas*", "**/*Canvas*"]
alwaysApply: true
---

Canvas must hit 60fps
- Virtualization
- debouncing
- lazy
- requestAnimationFrame
- GPU
- webgl if possible
- no re-renders
- useMemo useCallback
