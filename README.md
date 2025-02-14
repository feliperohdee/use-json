# use-json

A TypeScript library that extends JavaScript's native JSON functionality to support serialization of Maps, Sets, and RegExp objects.

[![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/-Vitest-729B1B?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Why This Package?

JavaScript's built-in `JSON.stringify()` and `JSON.parse()` functions don't support serializing certain built-in objects like `Map`, `Set`, and `RegExp`. When you try to serialize these objects:

```typescript
// Standard JSON
JSON.stringify(new Map([['key', 'value']])); // '{}'
JSON.stringify(new Set([1, 2, 3])); // '{}'
JSON.stringify(/test/gi); // '{}'
```

This library solves this limitation by providing an enhanced JSON serializer that properly handles these data types while maintaining compatibility with the standard JSON format.

## 🚀 Features

- ✅ Full support for `Map`, `Set`, and `RegExp` serialization
- 🔄 Maintains the original JSON API's simplicity
- 📦 Type-safe with TypeScript
- 🎯 Compatible with custom replacer and reviver functions
- 🔍 Preserves all object properties (like RegExp flags)
- 🎭 Handles nested structures seamlessly

## 📦 Installation

```bash
npm install use-json
# or
yarn add use-json
```

## 🛠️ Usage

### Basic Usage

```typescript
import JSON from 'use-json';

// Maps
const map = new Map([['key', 'value']]);
const mapJson = JSON.stringify(map);
const mapBack = JSON.parse(mapJson);
// mapBack instanceof Map === true

// Sets
const set = new Set([1, 2, 3]);
const setJson = JSON.stringify(set);
const setBack = JSON.parse(setJson);
// setBack instanceof Set === true

// RegExp
const regexp = /test/gi;
const regexpJson = JSON.stringify(regexp);
const regexpBack = JSON.parse(regexpJson);
// regexpBack instanceof RegExp === true
```

### Nested Structures

```typescript
const complex = {
	map: new Map([['key', new Set([1, 2, 3])]]),
	set: new Set([new Map([['nested', 'value']])]),
	regexp: /test/gi
};

const json = JSON.stringify(complex);
const restored = JSON.parse(json);
// All nested structures are properly restored
```

### Custom Replacer and Reviver

```typescript
// Custom replacer
const json = JSON.stringify(data, (key, value) => {
	if (key === 'sensitive') return undefined;
	return value;
});

// Custom reviver
const obj = JSON.parse(json, (key, value) => {
	if (key === 'date') return new Date(value);
	return value;
});
```

## 🧪 Testing

```bash
# Run tests
yarn test
```

## 📝 How It Works

The library works by:

1. Adding type identifiers to serialized objects (`__map__`, `__set__`, `__regexp__`)
2. Converting Maps and Sets to arrays during serialization
3. Preserving RegExp flags and source
4. Automatically reconstructing the original objects during parsing

## 📄 License

MIT

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👨‍💻 Author

**Felipe Rohde**

- Twitter: [@felipe_rohde](https://twitter.com/felipe_rohde)
- Github: [@feliperohdee](https://github.com/feliperohdee)
- Email: feliperohdee@gmail.com
