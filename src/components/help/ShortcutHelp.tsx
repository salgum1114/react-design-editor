import React from 'react';
import i18next from 'i18next';

const shortcuts = [
    [
        { key: ['esc'], description: i18next.t('shortcut.escape') },
        { key: ['h'], description: i18next.t('shortcut.h') },
        { key: ['q'], description: i18next.t('shortcut.q') },
        { key: ['w'], description: i18next.t('shortcut.w') },
        { key: ['o'], description: i18next.t('shortcut.o') },
        { key: ['p'], description: i18next.t('shortcut.p') },
        { key: ['+'], description: i18next.t('shortcut.plus') },
        { key: ['-'], description: i18next.t('shortcut.minus') },
        { key: ['↑'], description: i18next.t('shortcut.arrow-up') },
        { key: ['↓'], description: i18next.t('shortcut.arrow-down') },
        { key: ['←'], description: i18next.t('shortcut.arrow-left') },
        { key: ['→'], description: i18next.t('shortcut.arrow-right') },
    ],
    [
        { key: ['delete | backspace'], description: i18next.t('shortcut.delete') },
        { key: ['ctrl | cmd', 'a'], description: i18next.t('shortcut.ctrl-a') },
        { key: ['ctrl | cmd', 'c'], description: i18next.t('shortcut.ctrl-c') },
        { key: ['ctrl | cmd', 'v'], description: i18next.t('shortcut.ctrl-v') },
        { key: ['ctrl | cmd', 'x'], description: i18next.t('shortcut.ctrl-x') },
        { key: ['ctrl | cmd', 'z'], description: i18next.t('shortcut.ctrl-z') },
        { key: ['ctrl | cmd', 'y'], description: i18next.t('shortcut.ctrl-y') },
        { key: ['alt', 'mouse left'], description: i18next.t('shortcut.alt-mouse-left') },
        { key: ['shift', 'mouse left'], description: i18next.t('shortcut.shfit-mouse-left') },
        { key: ['mouse left'], description: i18next.t('shortcut.mouse-left') },
        { key: ['mouse right'], description: i18next.t('shortcut.mouse-right') },
    ],
];

const ShortcutHelp: React.SFC = () => {
    return (
        <div className="rde-shortcut-help">
            {shortcuts.map((column, idx) => {
                return (
                    <ul className="rde-shortcut-help-list" key={idx}>
                        {column.map(shortcut => {
                            return (
                                <li key={shortcut.key.toString()} className="rde-shortcut-help-key">
                                    {shortcut.key.map(key => {
                                        return (
                                            <kbd key={key} className="rde-shortcut-help-key-unit">
                                                <span>{key}</span>
                                            </kbd>
                                        );
                                    })}
                                    <span className="rde-shortcut-help-key-def">
                                        {shortcut.description}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                );
            })}
        </div>
    );
};

export default ShortcutHelp;
