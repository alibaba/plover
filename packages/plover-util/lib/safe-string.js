class SafeString {
  constructor(string) {
    this.string = typeof string === 'string' ?
      string : '' + string;
  }


  toString() {
    return this.string;
  }


  toHTML() {
    return this.string;
  }
}


module.exports = SafeString;
