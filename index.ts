type JsonReplacer = (key: string, value: any) => any;
type JsonReviver = (key: string, value: any) => any;

const TYPE_IDENTIFIERS = {
	MAP: '__map__',
	SET: '__set__',
	REGEXP: '__regexp__'
} as const;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;
};

class EnhancedJSON {
	private static readonly originalStringify = JSON.stringify;
	private static readonly originalParse = JSON.parse;

	static safeParse<T = any>(text: string, reviver?: JsonReviver): T | string {
		try {
			return this.parse(text, reviver);
		} catch (error) {
			return text;
		}
	}

	static parse<T = any>(text: string, reviver?: JsonReviver): T {
		const enhancedReviver: JsonReviver = (key: string, value: any): any => {
			// Check if value is an object with our type identifiers
			if (isPlainObject(value)) {
				if (value[TYPE_IDENTIFIERS.MAP] && Array.isArray(value.map)) {
					return new Map(value.map);
				}

				if (value[TYPE_IDENTIFIERS.SET] && Array.isArray(value.set)) {
					return new Set(value.set);
				}

				if (value[TYPE_IDENTIFIERS.REGEXP] && typeof value.source === 'string' && typeof value.flags === 'string') {
					return new RegExp(value.source, value.flags);
				}
			}

			return reviver ? reviver(key, value) : value;
		};

		return this.originalParse(text, enhancedReviver);
	}

	static stringify(value: unknown, replacer?: JsonReplacer | (string | number)[] | null, space?: string | number): string {
		const enhancedReplacer: JsonReplacer = (key: string, value: any): any => {
			if (typeof replacer === 'function') {
				value = replacer.call(this, key, value);
			}

			if (value instanceof Map) {
				return {
					[TYPE_IDENTIFIERS.MAP]: true,
					map: Array.from(value.entries())
				};
			}

			if (value instanceof Set) {
				return {
					[TYPE_IDENTIFIERS.SET]: true,
					set: Array.from(value.values())
				};
			}

			if (value instanceof RegExp) {
				return {
					[TYPE_IDENTIFIERS.REGEXP]: true,
					flags: value.flags,
					source: value.source
				};
			}

			return value;
		};

		return this.originalStringify(value, enhancedReplacer, space);
	}
}

export default EnhancedJSON;
