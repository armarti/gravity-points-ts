import Vector from './Vector';
import Particle from './Particle';
import { random } from './utilities';

export interface ITargets {
    particles: Particle[];
    gravities: GravityPoint[];
}

export default class GravityPoint extends Vector {
    public static RADIUS_LIMIT: number = 65;
    public static interferenceToPoint: boolean = true;

    public radius: number = 0;
    public currentRadius: number = 0;
    private _targets: ITargets;
    private _speed: Vector;
    public gravity: number = 0.05;
    public isMouseOver: boolean = false;
    public dragging: boolean = false;
    public destroyed: boolean = false;
    private _easeRadius: number = 0;
    private _dragDistance: Vector = null;
    private _collapsing: boolean = false;

    constructor(x: number, y: number, radius: number, targets: ITargets) {
        super(x, y);
        this.radius = radius;
        this.currentRadius = radius * 0.5;
        this._targets = {
            particles: targets.particles || [],
            gravities: targets.gravities || [],
        };
        this._speed = new Vector();
    }

    public hitTest = (p: Vector): boolean => this.distanceTo(p) < this.radius;
    public startDrag(dragStartPoint: Vector): void {
        this._dragDistance = Vector.sub(dragStartPoint, this);
        this.dragging = true;
    }
    public drag(dragToPoint: Vector): void {
        this.x = dragToPoint.x - this._dragDistance.x;
        this.y = dragToPoint.y - this._dragDistance.y;
    }
    public endDrag(): void {
        this._dragDistance = null;
        this.dragging = false;
    }
    public addSpeed(d): void {
        this._speed = this._speed.add(d);
    }
    public collapse(e?: Event): void {
        this.currentRadius *= 1.75;
        this._collapsing = true;
    }
    public render(ctx: CanvasRenderingContext2D): void {
        if (this.destroyed) return;

        const particles = this._targets.particles;

        for (let i = 0, len = particles.length; i < len; i++) {
            particles[i].addSpeed(
                Vector.sub(this, particles[i])
                    .normalize()
                    .scale(this.gravity),
            );
        }

        this._easeRadius = (this._easeRadius + (this.radius - this.currentRadius) * 0.07) * 0.95;
        this.currentRadius += this._easeRadius;
        if (this.currentRadius < 0) this.currentRadius = 0;

        if (this._collapsing) {
            this.radius *= 0.75;
            if (this.currentRadius < 1) this.destroyed = true;
            this._draw(ctx);
            return;
        }

        const gravities = this._targets.gravities,
            area: number = this.radius * this.radius * Math.PI;
        let g: GravityPoint, absorp: Vector, garea: number;

        for (let i = 0, len = gravities.length; i < len; i++) {
            g = gravities[i];

            if (g === this || g.destroyed) continue;

            if (
                (this.currentRadius >= g.radius || this.dragging) &&
                this.distanceTo(g) < (this.currentRadius + g.radius) * 0.85
            ) {
                g.destroyed = true;
                this.gravity += g.gravity;

                absorp = Vector.sub(g, this).scale((g.radius / this.radius) * 0.5);
                this.addSpeed(absorp);

                garea = g.radius * g.radius * Math.PI;
                this.currentRadius = Math.sqrt((area + garea * 3) / Math.PI);
                this.radius = Math.sqrt((area + garea) / Math.PI);
            }

            g.addSpeed(
                Vector.sub(this, g)
                    .normalize()
                    .scale(this.gravity),
            );
        }

        if (GravityPoint.interferenceToPoint && !this.dragging) {
            this.add(this._speed);
        }

        this._speed = new Vector();

        if (this.currentRadius > GravityPoint.RADIUS_LIMIT) this.collapse();

        this._draw(ctx);
    }
    private _draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        let grd = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, this.radius * 5);
        grd.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
        grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 5, 0, Math.PI * 2, false);
        ctx.fillStyle = grd;
        ctx.fill();

        const r = random() * this.currentRadius * 0.7 + this.currentRadius * 0.3;
        grd = ctx.createRadialGradient(this.x, this.y, r, this.x, this.y, this.currentRadius);
        grd.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grd.addColorStop(1, random() < 0.2 ? 'rgba(255, 196, 0, 0.15)' : 'rgba(103, 181, 191, 0.75)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2, false);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.restore();
    }
}
