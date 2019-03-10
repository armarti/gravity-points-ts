import { random } from './utilities';

export default class Vector {
    public x: number;
    public y: number;

    constructor(x?: number, y?: number) {
        this.x = x || 0;
        this.y = y || 0;
    }

    /** Static methods */
    public static add = (a: Vector, b: Vector): Vector => new Vector(a.x + b.x, a.y + b.y);
    public static sub = (a: Vector, b: Vector): Vector => new Vector(a.x - b.x, a.y - b.y);
    public static scale = (v: Vector, s: number): Vector => v.clone().scale(s);
    public static random = (): Vector => new Vector(random() * 2 - 1, random() * 2 - 1);

    /** Instance methods */
    public length = (): number => Math.sqrt(this.x * this.x + this.y * this.y);
    public lengthSq = (): number => this.x * this.x + this.y * this.y;
    public angle = (): number => Math.atan2(this.y, this.x);
    public clone = (): Vector => new Vector(this.x, this.y);
    public toString = (): string => '(x:' + this.x + ', y:' + this.y + ')';
    public add(v: Vector): Vector {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    public set(x: Vector | number, y?: Vector | number): Vector {
        let _x = x,
            _y = y;
        if (x instanceof Vector) {
            _y = x.y;
            _x = x.x;
        }
        this.x = (_x as number) || 0;
        this.y = (_y as number) || 0;
        return this;
    }
    public sub(v: Vector): Vector {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    public scale(s: number): Vector {
        this.x *= s;
        this.y *= s;
        return this;
    }
    public normalize(): Vector {
        const m = Math.sqrt(this.x * this.x + this.y * this.y);
        if (m) {
            this.x /= m;
            this.y /= m;
        }
        return this;
    }
    public angleTo(v: Vector): number {
        const dx = v.x - this.x,
            dy = v.y - this.y;
        return Math.atan2(dy, dx);
    }
    public distanceTo(v: Vector): number {
        const dx = v.x - this.x,
            dy = v.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    public distanceToSq(v: Vector): number {
        const dx = v.x - this.x,
            dy = v.y - this.y;
        return dx * dx + dy * dy;
    }
    public lerp(v: Vector, t: number): Vector {
        this.x += (v.x - this.x) * t;
        this.y += (v.y - this.y) * t;
        return this;
    }
}
