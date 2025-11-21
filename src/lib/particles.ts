export interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
    size: number
    color: string
    active: boolean
}

export class ParticleSystem {
    particles: Particle[]
    poolSize: number
    activeCount: number

    constructor(poolSize: number = 100) {
        this.poolSize = poolSize
        this.particles = new Array(poolSize).fill(null).map(() => ({
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            life: 0,
            maxLife: 0,
            size: 0,
            color: '',
            active: false
        }))
        this.activeCount = 0
    }

    emit(x: number, y: number, color: string = '#FFD700') {
        // Find first inactive particle
        const particle = this.particles.find(p => !p.active)
        if (particle) {
            particle.active = true
            particle.x = x
            particle.y = y
            // Random velocity
            const angle = Math.random() * Math.PI * 2
            const speed = Math.random() * 2 + 1
            particle.vx = Math.cos(angle) * speed
            particle.vy = Math.sin(angle) * speed
            particle.life = 1.0
            particle.maxLife = 1.0
            particle.size = Math.random() * 4 + 2
            particle.color = color
            this.activeCount++
        }
    }

    update(deltaTime: number) {
        // deltaTime is in ms, convert to seconds for physics
        const dt = deltaTime / 1000

        this.particles.forEach(p => {
            if (p.active) {
                p.x += p.vx
                p.y += p.vy
                p.life -= dt

                // Gravity/Friction
                p.vy += 2 * dt // gravity
                p.vx *= 0.99 // friction

                if (p.life <= 0) {
                    p.active = false
                    this.activeCount--
                }
            }
        })
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        this.particles.forEach(p => {
            if (p.active) {
                ctx.globalAlpha = p.life / p.maxLife
                ctx.fillStyle = p.color
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fill()
            }
        })
        ctx.globalAlpha = 1.0
    }
}
