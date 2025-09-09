import React, { useRef, useEffect } from 'react';
import { Bold, Italic, List, Link as LinkIcon } from '../../ui/Icons';
import Button from '../../ui/Button';

interface RichTextEditorProps {
    id: string;
    value: string;
    onChange: (html: string) => void;
    placeholder: string;
    variables: { label: string, value: string }[];
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ id, value, onChange, placeholder, variables }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    // This effect syncs the editor when the `value` prop changes from an external source (e.g., AI generation or template selection),
    // but prevents re-rendering the innerHTML on every user keystroke, which fixes the cursor jumping issue.
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const execCmd = (command: string, valueArg?: string) => {
        document.execCommand(command, false, valueArg);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            editorRef.current.focus();
        }
    };
    
    const handleLink = () => {
        const url = prompt('Enter the URL:');
        if (url) {
            execCmd('createLink', url);
        }
    };

    const handleInsertVariable = (variable: string) => {
        const editor = editorRef.current;
        if (!editor) return;
        
        editor.focus();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            execCmd('insertText', `{${variable}}`);
            return;
        }

        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(`{${variable}}`);
        range.insertNode(textNode);
        
        // Move cursor after the inserted text
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        onChange(editor.innerHTML);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        // Update parent state with the latest HTML content from the editor.
        const currentHTML = (e.currentTarget as HTMLDivElement).innerHTML;
        if (value !== currentHTML) {
            onChange(currentHTML);
        }
    };

    return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-primary-500">
            <div className="flex items-center p-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-t-lg">
                <EditorButton onClick={() => execCmd('bold')} aria-label="Bold"><Bold className="w-4 h-4" /></EditorButton>
                <EditorButton onClick={() => execCmd('italic')} aria-label="Italic"><Italic className="w-4 h-4" /></EditorButton>
                <EditorButton onClick={() => execCmd('insertUnorderedList')} aria-label="Bulleted List"><List className="w-4 h-4" /></EditorButton>
                <EditorButton onClick={handleLink} aria-label="Add Link"><LinkIcon className="w-4 h-4" /></EditorButton>
                
                 <div className="relative group ml-auto">
                    <Button size="sm" variant="secondary" className="!text-xs">Insert Variable</Button>
                     <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 hidden group-hover:block z-20 border dark:border-gray-700">
                        {variables.map(v => (
                             <a key={v.value} href="#" onClick={(e) => { e.preventDefault(); handleInsertVariable(v.value); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 capitalize">
                                 {v.label}
                             </a>
                        ))}
                    </div>
                </div>
            </div>
            <div
                ref={editorRef}
                id={id}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                className="w-full p-3 min-h-[80px] bg-white dark:bg-gray-700 focus:outline-none rounded-b-lg prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: value }} // Set initial content, effect handles subsequent updates
                data-placeholder={placeholder}
            />
        </div>
    );
};

const EditorButton: React.FC<{onClick: () => void; children: React.ReactNode; 'aria-label': string}> = ({ onClick, children, 'aria-label': ariaLabel }) => (
    <button
        type="button"
        onMouseDown={e => e.preventDefault()} // Prevent editor from losing focus
        onClick={onClick}
        aria-label={ariaLabel}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
    >
        {children}
    </button>
);

export default RichTextEditor;