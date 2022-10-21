const canvasRef = document.querySelector('#canvas');
const context = canvasRef.getContext("2d");
let img = new Image();
let arr = [];




function btnCollapseAnimation(duration) {
    if (arr.length > 0) {
        let start = performance.now();

        requestAnimationFrame(function btnCollapseAnimation(time) {
            let timeFraction = (time - start) / duration;
            let progress = timeFraction / (duration / 100);

            context.clearRect(0, 0, canvasRef.width, canvasRef.height);

            for (let i = 0; i < arr.length; i++) {
                let a = arr[i].start;
                let b = arr[i].end;
                MouseDrawer.drawLine(a, b, context);
                a = {
                    x: MouseDrawer.lerp(a.x, b.x, progress),
                    y: MouseDrawer.lerp(a.y, b.y, progress)
                };
                b = {
                    x: MouseDrawer.lerp(b.x, a.x, progress),
                    y: MouseDrawer.lerp(b.y, a.y, progress)
                };
                arr[i] = new Object({start: a, end: b});
            }

            if (timeFraction > 1) {
                context.clearRect(0, 0, canvasRef.width, canvasRef.height);
                context.beginPath();
                arr = [];
                img.src = canvasRef.toDataURL();
            } else {
                requestAnimationFrame(btnCollapseAnimation);
            }

        });
    }
}

class Canvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = context;
        this.canvas.width = window.innerWidth - (window.innerWidth / 10);
        this.canvas.height = window.innerHeight - (window.innerHeight / 5);
        this.destroyEvents();
    }

    destroyEvents() {
        this.canvas.onmousemove = null;
        this.canvas.onmousedown = null;
        this.canvas.onmouseup = null;
    }
}

class MouseDrawer extends Canvas {
    constructor(canvas) {
        super(canvas);
        this.position = null;
        this.count = false;

        this.listen();
    }

    listen() {
        this.canvas.onmousemove = this.mouseMoveHandler.bind(this);
        this.canvas.onmousedown = this.mouseDownHandler.bind(this);
        this.canvas.oncontextmenu = MouseDrawer.mouseCancelHandler.bind(this);
    }

    mouseDownHandler(e) {
        if (e.button === 0) {
            this.count = !this.count;
            this.ctx.beginPath();

            this.position = {
                x: e.pageX - e.target.offsetLeft,
                y: e.pageY - e.target.offsetTop
            };

            const line = {
                start: this.position,
                end: this.position,
            };

            if (this.count) {
                this.start = this.position;
            } else {
                this.end = this.position;
                let obj = new Object({start: this.start, end: this.end});
                for (let i = 0; i < arr.length; i++) {
                    this.point = MouseDrawer.getIntersection(arr[i].start, arr[i].end, this.start, this.end);
                    if (this.point) {
                        MouseDrawer.drawDot(this.ctx, this.point)
                    }
                }
                arr.push(obj);
            }

            this.saved = this.canvas.toDataURL();
            this.draw(this.ctx, line);
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            this.count = false;
        }
    }

    mouseMoveHandler(e) {
        if (this.count) {
            const currentPosition = {
                x: e.pageX - e.target.offsetLeft,
                y: e.pageY - e.target.offsetTop
            };

            let line = {
                start: this.position,
                end: currentPosition,
            };

            this.draw(this.ctx, line);
        }
    }

    static mouseCancelHandler(e) {
        e.preventDefault();
    }

    draw(ctx, line) {
        const {
            start,
            end
        } = line;
        if (!start || !end) {
            throw new Error('Start or end of line not defined.')
        }

        img.src = this.saved;
        img.onload = () => {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            MouseDrawer.drawLine(start, end, ctx);
            for (let i = 0; i < arr.length; i++) {
                this.point = MouseDrawer.getIntersection(arr[i].start, arr[i].end, start, end);
                if (this.point) {
                    MouseDrawer.drawDot(this.ctx, this.point)
                }
            }
        };
    }

    static drawLine = (A, B, ctx) => {
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
    };

    static drawDot(ctx, point) {
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'black';
    }

    static lerp(A, B, t) {
        return A + (B - A) * t;
    }

    static getIntersection(A, B, C, D) {
        const top = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
        const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

        const top1 = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
        const bottom1 = (B.y - A.y) * (D.x - C.x) - (B.x - A.x) * (D.y - C.y);

        if (bottom1 !== 0 && bottom !== 0) {
            const t1 = top1 / bottom1;
            const t = top / bottom;

            if ((t1 >= 0 && t1 <= 1) && (t >= 0 && t <= 1)) {
                return {
                    x: MouseDrawer.lerp(A.x, B.x, t),
                    y: MouseDrawer.lerp(A.y, B.y, t)
                }
            }
        }
        return null;
    }
}

new MouseDrawer(canvasRef);