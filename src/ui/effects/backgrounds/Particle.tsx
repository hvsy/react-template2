import {FC, useEffect, useRef} from "react";
import classnames from "classnames";
import {useMount, useMountedState} from "react-use";


function randomInt(min : number,max : number){
    return Math.floor(Math.random()*(max-min+1)+min);

}
function velocityInt(min : number,max : number){
    return Math.random()*(max-min+1)+min;
}

type Boundary = {
    width: number,height:number,
}
class Particle{
    _color =  `rgba(255,255,255,${Math.random()}`;
    _x : number;
    _y : number;
    _direction = {
        x : -1 + Math.random() * 2,
        y : -1 + Math.random() * 2,
    }
    _vx = 0.3 * Math.random();
    _vy = 0.3 * Math.random();
    _radius : number = randomInt(1,2);
    _boundary : Boundary
    constructor(boundary : Boundary) {
        this._boundary = {...boundary};
        this._x = randomInt(0,boundary.width);
        this._y = randomInt(0,boundary.height);
    }
    update(){
        this.float();
        this.boundaryCheck();
    }
    float(){
        this._x += this._vx * this._direction.x;
        this._y += this._vy * this._direction.y;
    }
    changeDirection(axis : 'x'|'y'){
        this._direction[axis] *= -1;
    }
    boundaryCheck(){
        const { width, height} = this._boundary;
        if (this._x >= width) {
            this._x = width;
            this.changeDirection("x");
        } else if (this._x <= 0) {
            this._x = 0;
            this.changeDirection("x");
        }
        if (this._y >= height) {
            this._y = height;
            this.changeDirection("y");
        } else if (this._y <= 0) {
            this._y = 0;
            this.changeDirection("y");
        }
    }
    draw(ctx : CanvasRenderingContext2D){
        ctx.beginPath();
        ctx.fillStyle = this._color;
        ctx.arc(this._x, this._y, this._radius, 0, Math.PI * 2, false);
        ctx.fill();
    }
}
class Animation {
    _ref : React.RefObject<HTMLCanvasElement|null>;
    _particles : Particle[] = [];
    constructor(ref : React.RefObject<HTMLCanvasElement|null>) {
        this._ref = ref;
    }

    setup(count : number = 100){
        const boundary = this.getBoundary();
        const canvas = this.getCanvas();
        canvas.width = boundary.width;
        canvas.height = boundary.height;
        this.createParticles(count,boundary);
        this.draw();
    }
    unsetup(){
        this._particles.splice(0,this._particles.length);
    }
    getBoundary(){
        const rect = this.getCanvas().getBoundingClientRect();
        return {
            width : rect.width,
            height : rect.height,
        }
    }
    createParticles(count : number,boundary : Boundary){
        for(let i =0 ;i<count; ++i){
            this._particles.push(new Particle(boundary));
        }
    }
    draw(){
        const ctx = this.getContext();
        if(!ctx) return;
        this._particles.forEach((p) => {
            p.draw(ctx);
        })
    }
    update(){
        this._particles.forEach((p) => {
            p.update();
        })
    }

    getCanvas(){
        return this._ref.current!;
    }
    getContext(){
        return this.getCanvas().getContext('2d');
    }
    clear(){
        const boundary = this.getBoundary();
        this.getContext()?.clearRect(0,0,boundary.width,boundary.height);
    }
    next(callback : Function){
        this.clear();
        this.draw();
        this.update();
        callback && callback();
    }
}

export type BackgroundParticlesProps = React.DetailsHTMLAttributes<HTMLCanvasElement> & {

};
export const BackgroundParticles: FC<BackgroundParticlesProps> = (props) => {
    const {className,...others} = props;
    const cname = classnames(
        `-z-10 absolute inset-0 h-[100vh] w-[100vw]
        bg-gradient-to-tr from-yellow-100 to-yellow-500 dark:from-indigo-400
        dark:to-indigo-900
        `
        ,className);
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        console.log('ref current:',ref.current);
        let animation : Animation|undefined = new Animation(ref);
        animation.setup();
        let handler : number;
        const next = () => {
            animation?.next(() => {
                handler = requestAnimationFrame(next);
            })
        };
        handler = requestAnimationFrame(next);
        return () => {
            if(animation){
                animation.unsetup();
                animation = undefined;
            }
            cancelAnimationFrame(handler);
        }
    },[]);
    const mounted = useMountedState();
    if(!mounted) return null;
    return <>
        <meta name="theme-color" content="#EEC134" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#39358A" media="(prefers-color-scheme: dark)" />

        <canvas ref={ref} className={cname} style={{
            // background : "linear-gradient(180deg, #222649,#1a1d29)",
        }} {...others}/>
    </>;
}
