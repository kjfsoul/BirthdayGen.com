import { useEffect, useRef, useCallback } from 'react'

interface UseCanvasOptions {
    onResize?: (width: number, height: number) => void
    onDraw?: (ctx: CanvasRenderingContext2D, deltaTime: number) => void
    animate?: boolean
}

export function useCanvas(options: UseCanvasOptions = {}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const requestRef = useRef<number>(0)
    const previousTimeRef = useRef<number>(0)

    const animate = useCallback((time: number) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current
            const canvas = canvasRef.current
            const ctx = canvas?.getContext('2d')

            if (canvas && ctx && options.onDraw) {
                options.onDraw(ctx, deltaTime)
            }
        }
        previousTimeRef.current = time
        if (options.animate) {
            requestRef.current = requestAnimationFrame(animate)
        }
    }, [options])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const handleResize = () => {
            const parent = canvas.parentElement
            if (parent) {
                canvas.width = parent.clientWidth
                canvas.height = parent.clientHeight
                if (options.onResize) {
                    options.onResize(canvas.width, canvas.height)
                }
            }
        }

        // Initial resize
        handleResize()

        // Debounced resize observer
        let timeoutId: NodeJS.Timeout
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(handleResize, 100)
        })

        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement)
        }

        return () => {
            resizeObserver.disconnect()
            clearTimeout(timeoutId)
        }
    }, [options.onResize])

    useEffect(() => {
        if (options.animate) {
            requestRef.current = requestAnimationFrame(animate)
        } else {
            cancelAnimationFrame(requestRef.current)
        }
        return () => cancelAnimationFrame(requestRef.current)
    }, [options.animate, animate])

    return canvasRef
}
