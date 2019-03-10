import Vector from './Vector';

export default class Particle extends Vector {
    public radius: number = 0;
    public _latest: Vector;
    private _speed: Vector;

    constructor(x: number, y: number, radius: number) {
        super(x, y);
        this.radius = radius;
        this._latest = new Vector();
        this._speed = new Vector();
    }

    public addSpeed(d: Vector): void {
        this._speed.add(d);
    }
    public update(): void {
        if (this._speed.length() > 12) this._speed.normalize().scale(12);
        this._latest.set(this);
        this.add(this._speed);
    }
    // public render(ctx: CanvasRenderingContext2D): void {
    //     if (this._speed.length() > 12) this._speed.normalize().scale(12);
    //     this._latest.set(this);
    //     this.add(this._speed);
    //     ctx.save();
    //     ctx.fillStyle = ctx.strokeStyle = '#fff';
    //     ctx.lineCap = ctx.lineJoin = 'round';
    //     ctx.lineWidth = this.radius * 2;
    //     ctx.beginPath();
    //     ctx.moveTo(this.x, this.y);
    //     ctx.lineTo(this._latest.x, this._latest.y);
    //     ctx.stroke();
    //     ctx.beginPath();
    //     ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    //     ctx.fill();
    //     ctx.restore();
    // }
}
