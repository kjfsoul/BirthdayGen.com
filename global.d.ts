// Global type declarations for React Three Fiber
// This extends JSX.IntrinsicElements to include Three.js elements

import type { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends ThreeElements {}
  }
}

export {};
