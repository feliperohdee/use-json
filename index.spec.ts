import { expect, describe, it } from 'vitest';
import EnhancedJSON from './index';

describe('/index', () => {
	describe('parse', () => {
		it('should parse Map correctly', () => {
			const json = '{"__map__":true,"map":[["key1","value1"],["key2","value2"]]}';
			const result = EnhancedJSON.parse(json);
			expect(result instanceof Map).toBe(true);
			expect(Array.from(result.entries())).toEqual([
				['key1', 'value1'],
				['key2', 'value2']
			]);
		});

		it('should parse Set correctly', () => {
			const json = '{"__set__":true,"set":["value1","value2","value3"]}';
			const result = EnhancedJSON.parse(json);
			expect(result instanceof Set).toBe(true);
			expect(Array.from(result.values())).toEqual(['value1', 'value2', 'value3']);
		});

		it('should parse RegExp correctly', () => {
			const json = '{"__regexp__":true,"source":"test","flags":"gi"}';
			const result = EnhancedJSON.parse(json);
			expect(result instanceof RegExp).toBe(true);
			expect(result.source).toBe('test');
			expect(result.flags).toBe('gi');
		});

		it('should handle nested complex types', () => {
			const json =
				'{"map":{"__map__":true,"map":[["key1",{"__set__":true,"set":["a","b"]}]]},' +
				'"set":{"__set__":true,"set":[{"__map__":true,"map":[["nested","value"]]}]},' +
				'"regexp":{"__regexp__":true,"source":"test","flags":"gi"}}';
			const result = EnhancedJSON.parse(json);

			// Check Map
			expect(result.map instanceof Map).toBe(true);
			const nestedSet = result.map.get('key1');
			expect(nestedSet instanceof Set).toBe(true);
			expect(Array.from(nestedSet.values())).toEqual(['a', 'b']);

			// Check Set
			expect(result.set instanceof Set).toBe(true);
			const setValues = Array.from(result.set.values());
			expect(setValues[0] instanceof Map).toBe(true);
			expect(Array.from((setValues[0] as Map<string, string>).entries())).toEqual([['nested', 'value']]);

			// Check RegExp
			expect(result.regexp instanceof RegExp).toBe(true);
			expect(result.regexp.source).toBe('test');
			expect(result.regexp.flags).toBe('gi');
		});

		it('should work with custom reviver function', () => {
			const json = '{"__map__":true,"map":[["key1","value1"]]}';
			const reviver = (key: string, value: any) => {
				if (key === 'map') {
					return 'revived';
				}
				return value;
			};

			const result = EnhancedJSON.parse(json, reviver);
			expect(result.map).toBe('revived');
		});
	});

	describe('safeParse', () => {
		it('should return the original text if it is not valid JSON', () => {
			const text = 'invalid json';
			const result = EnhancedJSON.safeParse(text);
			expect(result).toBe(text);
		});

		it('should return the parsed object if it is valid JSON', () => {
			const text = '{"map":{"__map__":true,"map":[["key1","value1"]]}}';
			const result = EnhancedJSON.safeParse(text);

			expect(result.map instanceof Map).toBe(true);
			expect(result.map.get('key1')).toBe('value1');
		});
	});

	describe('stringify', () => {
		it('should stringify Map correctly', () => {
			const map = new Map([
				['key1', 'value1'],
				['key2', 'value2']
			]);
			const result = EnhancedJSON.stringify(map);
			expect(result).toBe('{"__map__":true,"map":[["key1","value1"],["key2","value2"]]}');
		});

		it('should stringify Set correctly', () => {
			const set = new Set(['value1', 'value2', 'value3']);
			const result = EnhancedJSON.stringify(set);
			expect(result).toBe('{"__set__":true,"set":["value1","value2","value3"]}');
		});

		it('should stringify RegExp correctly', () => {
			const regexp = /test/gi;
			const result = EnhancedJSON.stringify(regexp);
			expect(result).toBe('{"__regexp__":true,"flags":"gi","source":"test"}');
		});

		it('should handle nested complex types', () => {
			const data = {
				map: new Map([['key1', new Set(['a', 'b'])]]),
				set: new Set([new Map([['nested', 'value']])]),
				regexp: /test/gi
			};
			const result = EnhancedJSON.stringify(data);
			expect(result).toBe(
				'{"map":{"__map__":true,"map":[["key1",{"__set__":true,"set":["a","b"]}]]},' +
					'"set":{"__set__":true,"set":[{"__map__":true,"map":[["nested","value"]]}]},' +
					'"regexp":{"__regexp__":true,"flags":"gi","source":"test"}}'
			);
		});

		it('should work with custom replacer function', () => {
			const map = new Map([['key1', 'value1']]);
			const replacer = (key: string, value: any) => {
				if (key === 'map') {
					return 'replaced';
				}

				return value;
			};

			const result = EnhancedJSON.stringify(map, replacer);
			expect(result).toBe('{"__map__":true,"map":"replaced"}');
		});
	});

	describe('edge cases', () => {
		it('should handle empty Map and Set', () => {
			const emptyMap = new Map();
			const emptySet = new Set();

			const mapResult = EnhancedJSON.parse(EnhancedJSON.stringify(emptyMap));
			const setResult = EnhancedJSON.parse(EnhancedJSON.stringify(emptySet));

			expect(mapResult instanceof Map).toBe(true);
			expect(setResult instanceof Set).toBe(true);
			expect(mapResult.size).toBe(0);
			expect(setResult.size).toBe(0);
		});

		it('should handle null and undefined values in Map', () => {
			const map = new Map([
				['null', null],
				['undefined', undefined]
			]);
			const result = EnhancedJSON.parse(EnhancedJSON.stringify(map));

			expect(result instanceof Map).toBe(true);
			expect(result.get('null')).toBeNull();
			expect(result.get('undefined')).toBeNull();
		});

		it('should preserve object references in Map and Set', () => {
			const obj = { id: 1 };
			const map = new Map([[obj, 'value']]);
			const set = new Set([obj]);

			const result = EnhancedJSON.parse(EnhancedJSON.stringify({ map, set }));

			const mapKey = Array.from(result.map.keys())[0];
			const setValue = Array.from(result.set.values())[0];

			expect(mapKey).toEqual(obj);
			expect(setValue).toEqual(obj);
		});
	});
});
