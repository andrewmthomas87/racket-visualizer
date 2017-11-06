
class StringUtil {

	public static isProcedureOpenerCharacter(character: string): boolean {
		return '([{'.indexOf(character) !== -1
	}

	public static getProcedureCloserFor(character: string): string | null {
		switch (character) {
			case '(':
				return ')'
			case '[':
				return ']'
			case '{':
				return '}'
			default:
				return null
		}
	}

	public static isNumberOpenerCharacter(character: string): boolean {
		return '0123456789.+-'.indexOf(character) !== -1
	}

	public static isWhiteSpaceCharacter(character: string): boolean {
		return /\s/.test(character)
	}

	public static isIdentifierCharacter(character: string): boolean {
		return '()[]{}",\'`;#|\\'.indexOf(character) === -1
	}

	public static isItemEndingCharacter(character: string, opener: boolean = false): boolean {
		return character === '' || StringUtil.isWhiteSpaceCharacter(character) || ')]},'.indexOf(character) !== -1 || (opener && StringUtil.isWhiteSpaceCharacter(character) || '([{,'.indexOf(character) !== -1)
	}

	public static isDigit(character: string): boolean {
		return /\d/.test(character)
	}

	public static isPlusOrMinus(character: string): boolean {
		return '+-'.indexOf(character) !== -1
	}

}

export default StringUtil
