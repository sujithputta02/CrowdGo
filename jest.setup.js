import '@testing-library/jest-dom';

// Simple polyfills for Web APIs in Node environment
// These are minimal implementations just for testing Next.js API routes

if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this._url = typeof input === 'string' ? input : input.url;
      this._method = init.method || 'GET';
      this._headers = new Map(Object.entries(init.headers || {}));
      this._body = init.body;
    }
    
    get url() {
      return this._url;
    }
    
    get method() {
      return this._method;
    }
    
    get headers() {
      return this._headers;
    }
    
    get body() {
      return this._body;
    }
    
    async json() {
      return typeof this._body === 'string' ? JSON.parse(this._body) : this._body;
    }
    
    async text() {
      return typeof this._body === 'string' ? this._body : JSON.stringify(this._body);
    }
  };
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this._body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || '';
      this.headers = new Map(Object.entries(init.headers || {}));
      this.ok = this.status >= 200 && this.status < 300;
    }
    
    static json(data, init = {}) {
      const body = typeof data === 'string' ? data : JSON.stringify(data);
      const response = new Response(body, {
        ...init,
        status: init?.status || 200,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
      });
      return response;
    }
    
    async json() {
      if (!this._body) return null;
      return typeof this._body === 'string' ? JSON.parse(this._body) : this._body;
    }
    
    async text() {
      if (!this._body) return '';
      return typeof this._body === 'string' ? this._body : JSON.stringify(this._body);
    }
  };
}

if (typeof Headers === 'undefined') {
  global.Headers = class Headers extends Map {
    constructor(init) {
      super(init ? Object.entries(init) : []);
    }
    
    get(name) {
      return super.get(name?.toLowerCase());
    }
    
    set(name, value) {
      return super.set(name?.toLowerCase(), value);
    }
    
    has(name) {
      return super.has(name?.toLowerCase());
    }
    
    append(name, value) {
      const existing = this.get(name);
      if (existing) {
        this.set(name, `${existing}, ${value}`);
      } else {
        this.set(name, value);
      }
    }
  };
}
