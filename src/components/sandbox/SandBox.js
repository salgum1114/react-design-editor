import UnsafetyWordException from '../exception/UnsafetyWordException';
import NoExistWordException from '../exception/NoExistWordException';

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

const parameters = [
    'value',
    'animations',
    'styles',
    'userProperty',
];

const SandBox = {
    verify: (code) => {
        const newCode = code.toString();
        if (excludeWords.some(word => code.includes(word))) {
            throw new UnsafetyWordException();
        }
        if (!includeWords.some(word => code.includes(word))) {
            throw new NoExistWordException();
        }
        return new Function(parameters, '"use strict"; ' + newCode);
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
