const excludeWords = [
    'window',
    'Window',
    'alert',
    'console',
    'this',
    'eval',
    'new',
    'function',
    'Function',
    'document',
];

const includeWords = [
    'return',
];

class UnsafetyWordException {
    constructor() {
        this.message = 'Includes unsafety word.';
        this.name = 'UnsafetyWordException';
    }

    toString() {
        return `${this.name}: ${this.message}`;
    }
}

class NoExistWordException {
    constructor() {
        this.message = 'Does not exist word.';
        this.name = 'NoExistWordException';
    }

    toString() {
        return `${this.name}: ${this.message}`;
    }
}

const SandBox = {
    verify: (code) => {
        const newCode = code.toString();
        if (excludeWords.some(word => code.includes(word))) {
            throw new UnsafetyWordException();
        }
        if (!includeWords.some(word => code.includes(word))) {
            throw new NoExistWordException();
        }
        return new Function('value', 'animations', 'styles', 'userProperty', '"use strict"; ' + newCode);
    },
    compile: (code) => {
        try {
            return SandBox.verify(code);
        } catch (error) {
            if (error.toString) {
                console.error(error.toString());
            } else {
                console.error(error.message);
            }
        }
    },
};

export default SandBox;
