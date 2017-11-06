import StringUtil from './StringUtil'

enum ItemType {
	PROCEDURE,
	LAMBDA,
	IDENTIFIER,
	STRING_LITERAL,
	NUMERIC_LITERAL,
	BOOLEAN_LITERAL
}

interface Procedure {
	type: ItemType.PROCEDURE
	name: string
	args: Array<Item>
}

interface Lambda {
	type: ItemType.LAMBDA
	args: Array<Identifier>
	body: Item
}

interface Identifier {
	type: ItemType.IDENTIFIER
	name: string
}

interface StringLiteral {
	type: ItemType.STRING_LITERAL
	value: string
}

interface NumericLiteral {
	type: ItemType.NUMERIC_LITERAL
	value: string
}

interface BooleanLiteral {
	type: ItemType.BOOLEAN_LITERAL
	value: boolean
}

type Literal = StringLiteral | NumericLiteral | BooleanLiteral

type Item = Procedure | Lambda | Identifier | Literal

interface ItemWrapper<T extends Item> {
	item: T
	index: number
	length: number
}

class ParseException {

	public message: string
	public index: number

	public constructor(message: string, index: number) {
		this.message = message
		this.index = index
	}

}

function getItemTypeFor(character: string): ItemType | null {
	if (character === '') {
		return null
	}
	else if (StringUtil.isProcedureOpenerCharacter(character)) {
		return ItemType.PROCEDURE
	}
	else if (character === '"') {
		return ItemType.STRING_LITERAL
	}
	else if (StringUtil.isNumberOpenerCharacter(character)) {
		return ItemType.NUMERIC_LITERAL
	}
	else if (character === '#') {
		return ItemType.BOOLEAN_LITERAL
	}
	else {
		return ItemType.IDENTIFIER
	}
}

function ensureItemEnd(subject: string, source: string, index: number) {
	if (!StringUtil.isItemEndingCharacter(source.charAt(index))) {
		throw new ParseException(`Failed to parse ${subject}: expected end but found character '${source.charAt(index)}'`, index)
	}
}

function ensureWhiteSpace(subject: string, source: string, index: number) {
	if (!StringUtil.isWhiteSpaceCharacter(source.charAt(index))) {
		throw new ParseException(`Failed to parse ${subject}: expected white space but found character '${source.charAt(index)}'`, index)
	}
}

function getWhiteSpaceLength(source: string, index: number): number {
	let length = 0
	while (StringUtil.isWhiteSpaceCharacter(source.charAt(index + length))) {
		length++
	}

	return length
}

function parse(source: string, index: number = 0): ItemWrapper<Item> {
	const character = source.charAt(index)
	switch (getItemTypeFor(character)) {
		case ItemType.PROCEDURE:
			return parseProcedure(source, index) || parseLambda(source, index)
		case ItemType.IDENTIFIER: {
			const item: ItemWrapper<Item> | null = parseIdentifier(source, index) || parseNumericLiteral(source, index)
			if (!item) {
				throw new ParseException('Failed to parse invalid item', index)
			}
			return item
		}
		case ItemType.STRING_LITERAL:
			return parseStringLiteral(source, index)
		case ItemType.NUMERIC_LITERAL: {
			const item: ItemWrapper<Item> | null = parseNumericLiteral(source, index) || parseIdentifier(source, index)
			if (!item) {
				throw new ParseException('Failed to parse invalid item', index)
			}
			return item
		}
		case ItemType.BOOLEAN_LITERAL:
			return parseBooleanLiteral(source, index)
		default:
			throw new ParseException('Failed to parse invalid item', index)
	}
}

function parseProcedure(source: string, index: number): ItemWrapper<Procedure> | null {
	let length = 1

	length += getWhiteSpaceLength(source, index + length)

	if (getItemTypeFor(source.charAt(index + length)) !== ItemType.IDENTIFIER && '+-'.indexOf(source.charAt(index + length)) === -1) {
		throw new ParseException(`Failed to parse procedure: expected identifier but found character '${source.charAt(index + length)}'`, index + length)
	}
	const identifier: ItemWrapper<Identifier> | null = parseIdentifier(source, index + length)
	if (!identifier) {
		throw new ParseException('Failed to parse procedure: expected identifier but found number', index + length)
	}
	else if (identifier.item.name === 'lambda' || identifier.item.name === 'λ') {
		return null
	}
	length += identifier.length

	const procedureCloserCharacter = StringUtil.getProcedureCloserFor(source.charAt(index))

	const whiteSpaceAfterIdentifier = getWhiteSpaceLength(source, index + length)
	if (source.charAt(index + length + whiteSpaceAfterIdentifier) === procedureCloserCharacter) {
		length += whiteSpaceAfterIdentifier + 1

		return {
			item: {
				type: ItemType.PROCEDURE,
				name: identifier.item.name,
				args: []
			},
			index, length
		}
	}

	ensureWhiteSpace('procedure', source, index + length)
	length += whiteSpaceAfterIdentifier

	const args: Array<Item> = []
	while (source.charAt(index + length) !== procedureCloserCharacter) {
		if (source.charAt(index + length) === '') {
			throw new ParseException('Failed to parse procedure: unexpected end', index + length)
		}

		const arg: ItemWrapper<Item> = parse(source, index + length)
		args.push(arg.item)
		length += arg.length

		if (source.charAt(index + length) !== procedureCloserCharacter) {
			ensureWhiteSpace('procedure', source, index + length)
			length += getWhiteSpaceLength(source, index + length)
		}
	}
	length++

	return {
		item: {
			type: ItemType.PROCEDURE,
			name: identifier.item.name,
			args
		},
		index, length
	}
}

function parseLambda(source: string, index: number): ItemWrapper<Lambda> {
	let length = 1

	length += getWhiteSpaceLength(source, index + length)

	if (getItemTypeFor(source.charAt(index + length)) !== ItemType.IDENTIFIER) {
		throw new ParseException(`Failed to parse lambda: expected identifier but found character '${source.charAt(index + length)}'`, index + length)
	}
	const identifier: ItemWrapper<Identifier> | null = parseIdentifier(source, index + length, true)
	if (!identifier) {
		throw new ParseException('Failed to parse lambda: expected identifier but found number', index + length)
	}
	else if (identifier.item.name !== 'lambda' && identifier.item.name !== 'λ') {
		throw new ParseException(`Failed to parse lambda: expected lambda but found procedure '${identifier.item.name}'`, index + length)
	}

	length += identifier.length

	length += getWhiteSpaceLength(source, index + length)

	const argumentsOpenerCharacter = source.charAt(index + length)
	if (!StringUtil.isProcedureOpenerCharacter(argumentsOpenerCharacter)) {
		throw new ParseException(`Failed to parse lambda: expected arguments group but found character '${argumentsOpenerCharacter}'`, index + length)
	}
	length++

	length += getWhiteSpaceLength(source, index + length)

	const argumentsCloserCharacter = StringUtil.getProcedureCloserFor(argumentsOpenerCharacter)

	const args: Array<Identifier> = []
	while (source.charAt(index + length) !== argumentsCloserCharacter) {
		if (source.charAt(index + length) === '') {
			throw new ParseException('Failed to parse lambda: unexpected end', index + length)
		}

		const arg: ItemWrapper<Identifier> | null = parseIdentifier(source, index + length)
		if (!arg) {
			throw new ParseException('Failed to parse lambda: expected identifier but found number', index + length)
		}
		args.push(arg.item)
		length += arg.length

		length += getWhiteSpaceLength(source, index + length)
	}
	length++

	length += getWhiteSpaceLength(source, index + length)

	if (source.charAt(index + length) === argumentsCloserCharacter) {
		throw new ParseException('Failed to parse lambda: expected body but found close', index + length)
	}
	else if (source.charAt(index + length) === '') {
		throw new ParseException('Failed to parse lambda: unexpected end', index + length)
	}

	const bodyWrapper = parse(source, index + length)
	const body = bodyWrapper.item
	length += bodyWrapper.length

	length += getWhiteSpaceLength(source, index + length)

	if (source.charAt(index + length) !== argumentsCloserCharacter) {
		throw new ParseException(`Failed to parse lambda: expected close but found character '${source.charAt(index + length)}'`, index + length)
	}
	length++

	return {
		item: {
			type: ItemType.LAMBDA,
			args, body
		},
		index, length
	}
}

function parseIdentifier(source: string, index: number, opener: boolean = false): ItemWrapper<Identifier> | null {
	let name = ''
	let length = 0
	let character: string
	let escaping = false
	while (true) {
		character = source.charAt(index + length)
		if (escaping) {
			if (character === '') {
				throw new ParseException('Failed to parse identifier: unexpected end', index + length)
			}

			escaping = false
		}
		else if (character === '\\') {
			escaping = true
		}
		else if (StringUtil.isItemEndingCharacter(character, opener)) {
			break
		}
		else if (!StringUtil.isIdentifierCharacter(character)) {
			throw new ParseException(`Failed to parse identifier: unexpected character '${character}'`, index + length)
		}

		name += character
		length++
	}

	if (!(name.length === 1 && '+-'.indexOf(name) !== -1) && /^[+-]?[0-9]*\.?[0-9]*(e[0-9]+)?$/.test(name)) {
		return null
	}

	return {
		item: {
			type: ItemType.IDENTIFIER,
			name
		},
		index, length
	}
}

function parseStringLiteral(source: string, index: number): ItemWrapper<StringLiteral> {
	let value = ''
	let length = 1
	let character: string
	let escaping = false
	while (true) {
		character = source.charAt(index + length)
		if (character === '') {
			throw new ParseException('Failed to parse string literal: unexpected end', index + length)
		}
		else if (escaping) {
			escaping = false
		}
		else if (character === '\\') {
			escaping = true
		}
		else if (character === '"') {
			length++
			break
		}

		value += character
		length++
	}

	return {
		item: {
			type: ItemType.STRING_LITERAL,
			value
		},
		index, length
	}
}

function parseNumericLiteral(source: string, index: number): ItemWrapper<NumericLiteral> | null {
	let value = source.charAt(index)
	let length = 1
	let character: string
	let decimal = value === '.'
	let exponent = false
	try {
		while (true) {
			character = source.charAt(index + length)
			if (StringUtil.isItemEndingCharacter(character)) {
				break
			}

			value += character

			if (character === '.' && !exponent) {
				if (decimal) {
					throw new ParseException('Failed to parse numeric literal: multiple decimal points', index + length)
				}

				decimal = true
			}
			else if (character === 'e') {
				if (exponent) {
					throw new ParseException('Failed to parse numeric literal: multiple exponents', index + length)
				}

				exponent = true
			}
			else if (!StringUtil.isDigit(character) && !(StringUtil.isPlusOrMinus(character) && source.charAt(index + length - 1) === 'e')) {
				throw new ParseException(`Failed to parse numeric literal: unexpected character '${character}'`, index + length)
			}

			length++
		}
	}
	catch (ex) {
		if (value.length === 1 && '+-'.indexOf(value) !== -1 || !/^[+-]?[0-9]*\.?[0-9]*(e[0-9]+)?$/.test(value)) {
			return null
		}
		else {
			throw ex
		}
	}

	if (value.length === 1 && '+-'.indexOf(value) !== -1 || !/^[+-]?[0-9]*\.?[0-9]*(e[0-9]+)?$/.test(value)) {
		return null
	}

	return {
		item: {
			type: ItemType.NUMERIC_LITERAL,
			value
		},
		index, length
	}
}

function parseBooleanLiteral(source: string, index: number): ItemWrapper<BooleanLiteral> {
	let value: boolean
	let length: number
	switch (source.charAt(index + 1)) {
		case 't':
			if (StringUtil.isItemEndingCharacter(source.charAt(index + 2))) {
				length = 2
			}
			else if (source.substr(index + 2, 3) === 'rue') {
				ensureItemEnd('boolean literal', source, index + 6)

				length = 5
			}
			else {
				throw new ParseException(`Failed to parse boolean literal: unexpected character '${source.charAt(index + 2)}'`, index + 2)
			}

			value = true
			break
		case 'f':
			if (StringUtil.isItemEndingCharacter(source.charAt(index + 2))) {
				length = 2
			}
			else if (source.substr(index + 2, 4) === 'alse') {
				ensureItemEnd('boolean literal', source, index + 7)

				length = 6
			}
			else {
				throw new ParseException(`Failed to parse boolean literal: unexpected character '${source.charAt(index + 2)}'`, index + 2)
			}

			value = false
			break
		case 'T':
			ensureItemEnd('boolean literal', source, index + 2)

			value = true
			length = 2
			break
		case 'F':
			ensureItemEnd('boolean literal', source, index + 2)

			value = false
			length = 2
			break
		default:
			throw new ParseException(`Failed to parse boolean literal: unexpected character '${source.charAt(index + 1)}'`, index + 1)
	}

	return {
		item: {
			type: ItemType.BOOLEAN_LITERAL,
			value
		},
		index, length
	}
}

export { ItemType, Procedure, Identifier, StringLiteral, NumericLiteral, BooleanLiteral, Literal, Item, ItemWrapper, ParseException, parse as default }
