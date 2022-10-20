const canvasRef = document.querySelector('#canvas');
let arr = [];

class Canvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
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
        this.img = new Image();
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
            //MouseDrawer.drawLine(this.ctx, arr);
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
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
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.draw(this.ctx, line);
            //MouseDrawer.drawLine(this.ctx, arr);

            for (let i = 0; i < arr.length; i++) {
                this.point = MouseDrawer.getIntersection(arr[i].start, arr[i].end, this.position, currentPosition);
                if (this.point) {
                    MouseDrawer.drawDot(this.ctx, this.point)
                }
            }
        }
    }

    static mouseCancelHandler(e) {
        e.preventDefault();
    }

    static drawLine(ctx, arr) {
        ctx.beginPath();
        for (let i = 0; i < arr.length; i++) {
            let start = arr[i].start;
            let end = arr[i].end;
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    }

    draw(ctx, line) {
        const {
            start,
            end,
            lineWidth,
            lineCap = 'round',
            strokeStyle
        } = line;
        if (!start || !end) {
            throw new Error('Start or end of line not defined.')
        }

        this.img.src = this.saved;
        this.img.onload = () => {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.lineWidth = lineWidth;
            ctx.lineCap = lineCap;
            ctx.strokeStyle = strokeStyle;
            ctx.stroke();
        };
    }

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

        if (bottom !== 0) {
            const t = top / bottom;
            if (t >= 0 && t <= 1) {
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