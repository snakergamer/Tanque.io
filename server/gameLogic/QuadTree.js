// server/gameLogic/QuadTree.js
class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    intersects(o) {
        return !(o.x > this.x + this.w || o.x + o.w < this.x || o.y > this.y + this.h || o.y + o.h < this.y);
    }
}

class QTNode {
    constructor(bounds, capacity) {
        this.bounds = bounds;
        this.capacity = capacity;
        this.items = [];
        this.divided = false;
    }

    insert(item) {
        if (!this.bounds.intersects(item.bounds)) return false;

        if (this.items.length < this.capacity) {
            this.items.push(item);
            return true;
        }

        if (!this.divided) {
            this.subdivide();
        }

        return (
            this.nw.insert(item) ||
            this.ne.insert(item) ||
            this.sw.insert(item) ||
            this.se.insert(item)
        );
    }

    subdivide() {
        let x = this.bounds.x;
        let y = this.bounds.y;
        let w = this.bounds.w / 2;
        let h = this.bounds.h / 2;

        this.nw = new QTNode(new Rect(x, y, w, h), this.capacity);
        this.ne = new QTNode(new Rect(x + w, y, w, h), this.capacity);
        this.sw = new QTNode(new Rect(x, y + h, w, h), this.capacity);
        this.se = new QTNode(new Rect(x + w, y + h, w, h), this.capacity);
        this.divided = true;
    }

    query(range, found = []) {
        if (!this.bounds.intersects(range)) return found;

        for (let item of this.items) {
            if (range.intersects(item.bounds)) {
                found.push(item.obj);
            }
        }

        if (this.divided) {
            this.nw.query(range, found);
            this.ne.query(range, found);
            this.sw.query(range, found);
            this.se.query(range, found);
        }

        return found;
    }
}

module.exports = { Rect, QTNode };
