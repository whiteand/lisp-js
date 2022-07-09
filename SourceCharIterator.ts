import { ILocation } from "./ILocation.ts";
import { LocatedChar } from "./LocatedChar.ts";
import { IBackableIterator } from "./IBackableIterator.ts";

export class SourceCharIterator
  implements ILocation, IBackableIterator<LocatedChar> {
  private text: string;
  private ptr: number;
  private _line: number;
  private _column: number;
  private _source: string;
  constructor(source: string, text: string, ptr: number) {
    this.text = text;
    this.ptr = 0;
    this._source = source;
    this._line = 1;
    this._column = 1;
    while (this.ptr < ptr) {
      this._movePointerNext();
    }
  }

  get source() {
    return this._source;
  }
  get line() {
    return this._line;
  }
  get column() {
    return this._column;
  }

  _movePointerNext() {
    if (this.ptr >= this.text.length) return;
    const c = this.text[this.ptr];
    this.ptr++;
    if (c === "\n") {
      this._line++;
      this._column = 1;
    } else {
      this._column++;
    }
  }

  _movePointerBack() {
    if (this.ptr <= 0) return;
    this.ptr--;
    const c = this.text[this.ptr];
    if (c !== "\n") {
      this._column--;
      return;
    }
    this._line--;
    this._column = 1;
    let ptr = this.ptr - 1;
    while (ptr >= 0 && this.text[ptr] !== "\n") {
      ptr--;
      this._column++;
    }
  }

  next(): IteratorResult<LocatedChar, void> {
    if (this.ptr >= this.text.length) {
      return { value: undefined, done: true };
    }
    const c = this.text[this.ptr];
    const res = new LocatedChar(
      this._source,
      this._line,
      this._column,
      c,
    );
    this._movePointerNext();
    return {
      value: res,
      done: false,
    };
  }

  back() {
    if (this.ptr <= 0) {
      return;
    }
    this._movePointerBack();
  }
}
