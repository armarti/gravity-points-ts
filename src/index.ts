/**
 * Converted to ES6 TypeScript from https://codepen.io/akm2/pen/rHIsa
 * Also translated comments to English.
 */
import { GUI } from 'dat.gui';
import Vector from './Vector';
import GravityPoint from './GravityPoint';
import Particle from './Particle';
import { random } from './utilities';

const MAX_PARTICLES = 10 ** 4;
const INITIAL_PARTICLES = 100;

window.requestAnimationFrame = (() => {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame // ||
        //   window.mozRequestAnimationFrame ||
        //   window.oRequestAnimationFrame ||
        //   window.msRequestAnimationFrame ||
        // (cb => {
        //     window.setTimeout(cb, 1000 / 60);
        // })
    );
})();

// Initialize
(() => {
    'use strict';

    // Configs
    const BACKGROUND_COLOR: string = 'rgba(11, 51, 56, 1)',
        PARTICLE_RADIUS: number = 1,
        G_POINT_RADIUS: number = 10,
        G_POINT_RADIUS_LIMITS: number = 65,
        gravities: GravityPoint[] = [],
        particles: Particle[] = [],
        mouse = new Vector();

    // Vars
    let canvas: HTMLCanvasElement,
        context: CanvasRenderingContext2D,
        bufferCvs: HTMLCanvasElement,
        bufferCtx: CanvasRenderingContext2D,
        screenWidth: number,
        screenHeight: number,
        grad: CanvasGradient,
        gui: GUI,
        control: { particleNum: number };

    // Event Listeners
    function resize(e: Event): void {
        screenWidth = canvas.width = window.innerWidth;
        screenHeight = canvas.height = window.innerHeight;
        bufferCvs.width = screenWidth;
        bufferCvs.height = screenHeight;
        context = canvas.getContext('2d');
        bufferCtx = bufferCvs.getContext('2d');

        const cx = canvas.width * 0.5,
            cy = canvas.height * 0.5;

        grad = context.createRadialGradient(cx, cy, 0, cx, cy, Math.sqrt(cx * cx + cy * cy));
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    }

    function mouseMove(e: MouseEvent): void {
        mouse.set(e.clientX, e.clientY);
        let hit: boolean = false;
        for (let i = gravities.length - 1; i >= 0; i--) {
            const g = gravities[i];
            if ((!hit && g.hitTest(mouse)) || g.dragging) {
                g.isMouseOver = hit = true;
            } else g.isMouseOver = false;
        }
        canvas.style.cursor = hit ? 'pointer' : 'default';
    }

    function mouseDown(e: MouseEvent): void {
        for (let i = gravities.length - 1; i >= 0; i--) {
            if (gravities[i].isMouseOver) {
                gravities[i].startDrag(mouse);
                return;
            }
        }
        gravities.push(
            new GravityPoint(e.clientX, e.clientY, G_POINT_RADIUS, {
                particles,
                gravities,
            }),
        );
    }

    function mouseUp(e: MouseEvent): void {
        for (let i = 0, len = gravities.length; i < len; i++) {
            if (gravities[i].dragging) {
                gravities[i].endDrag();
                break;
            }
        }
    }

    function doubleClick(e: MouseEvent): void {
        for (let i = gravities.length - 1; i >= 0; i--) {
            if (gravities[i].isMouseOver) {
                gravities[i].collapse();
                break;
            }
        }
    }

    // Functions
    function addParticle(num: number): void {
        for (let i = 0; i < num; i++) {
            const p = new Particle(
                Math.floor(random() * screenWidth - PARTICLE_RADIUS * 2) + 1 + PARTICLE_RADIUS,
                Math.floor(random() * screenHeight - PARTICLE_RADIUS * 2) + 1 + PARTICLE_RADIUS,
                PARTICLE_RADIUS,
            );
            p.addSpeed(Vector.random());
            particles.push(p);
        }
    }

    function removeParticle(num: number): void {
        if (particles.length < num) num = particles.length;
        for (let i = 0; i < num; i++) particles.pop();
    }

    // GUI Control
    control = {
        particleNum: INITIAL_PARTICLES,
    };

    // Init
    canvas = document.getElementById('c') as HTMLCanvasElement;
    bufferCvs = document.createElement('canvas');
    window.addEventListener('resize', resize, false);
    resize(null);
    addParticle(control.particleNum);
    canvas.addEventListener('mousemove', mouseMove, false);
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('dblclick', doubleClick, false);

    // GUI
    gui = new GUI();
    gui.add(control, 'particleNum', 0, MAX_PARTICLES)
        .step(1)
        .name('Particle Num')
        .onChange(() => {
            const n = (control.particleNum | 0) - particles.length;
            if (n > 0) addParticle(n);
            else if (n < 0) removeParticle(-n);
        });
    gui.add(GravityPoint, 'interferenceToPoint').name('Interference Between Point');
    gui.close();

    // Start Update
    const loop = (): void => {
        context.save();
        context.fillStyle = BACKGROUND_COLOR;
        context.fillRect(0, 0, screenWidth, screenHeight);
        context.fillStyle = grad;
        context.fillRect(0, 0, screenWidth, screenHeight);
        context.restore();

        for (let i = 0, len = gravities.length; i < len; i++) {
            const g = gravities[i];
            if (g.dragging) g.drag(mouse);
            g.render(context);
            if (g.destroyed) {
                gravities.splice(i, 1);
                len--;
                i--;
            }
        }

        bufferCtx.save();
        bufferCtx.globalCompositeOperation = 'destination-out';
        bufferCtx.globalAlpha = 0.35;
        bufferCtx.fillRect(0, 0, screenWidth, screenHeight);
        bufferCtx.restore();

        // Draw particles in buffer
        bufferCtx.save();
        bufferCtx.fillStyle = bufferCtx.strokeStyle = '#fff';
        bufferCtx.lineCap = bufferCtx.lineJoin = 'round';
        bufferCtx.lineWidth = PARTICLE_RADIUS * 2;
        bufferCtx.beginPath();
        for (let i = 0, len = particles.length; i < len; i++) {
            const p = particles[i];
            p.update();
            bufferCtx.moveTo(p.x, p.y);
            bufferCtx.lineTo(p._latest.x, p._latest.y);
        }
        bufferCtx.stroke();
        bufferCtx.beginPath();
        for (let i = 0, len = particles.length; i < len; i++) {
            const p = particles[i];
            bufferCtx.moveTo(p.x, p.y);
            bufferCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
        }
        bufferCtx.fill();
        bufferCtx.restore();

        // Draw buffer on canvas
        context.drawImage(bufferCvs, 0, 0);
        requestAnimationFrame(loop);
    };

    loop();
})();
