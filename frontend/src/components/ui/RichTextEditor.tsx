import React, { useRef, useState, useEffect } from 'react';
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    AlignLeft,
    AlignCenter,
    AlignRight
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = "Escribe tu historia...",
    className = "",
    minHeight = "300px"
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Comandos de formato
    const executeCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleContentChange();
    };

    // Manejo de cambios de contenido
    const handleContentChange = () => {
        if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            onChange(content);
        }
    };

    // Manejo especial para el evento input
    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        handleContentChange();
        
        // Asegurar que el texto siempre se escriba de izquierda a derecha
        const target = e.currentTarget;
        if (target) {
            // Forzar dirección LTR después de cada cambio
            target.style.direction = 'ltr';
            target.style.textAlign = 'left';
        }
    };

    // Inicializar contenido
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            // Preservar la posición del cursor
            const selection = window.getSelection();
            const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
            
            editorRef.current.innerHTML = value;
            
            // Restaurar la posición del cursor si existía
            if (range) {
                try {
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                } catch (e) {
                    // Si no se puede restaurar, colocar al final
                    const newRange = document.createRange();
                    newRange.selectNodeContents(editorRef.current);
                    newRange.collapse(false);
                    selection?.removeAllRanges();
                    selection?.addRange(newRange);
                }
            }
        }
    }, [value]);

    // Botones de la barra de herramientas
    const toolbarButtons = [
        {
            icon: Bold,
            command: 'bold',
            title: 'Negrita (Ctrl+B)',
            shortcut: 'Ctrl+B'
        },
        {
            icon: Italic,
            command: 'italic',
            title: 'Cursiva (Ctrl+I)',
            shortcut: 'Ctrl+I'
        },
        {
            icon: Underline,
            command: 'underline',
            title: 'Subrayado (Ctrl+U)',
            shortcut: 'Ctrl+U'
        },
        {
            icon: List,
            command: 'insertUnorderedList',
            title: 'Lista con viñetas'
        },
        {
            icon: ListOrdered,
            command: 'insertOrderedList',
            title: 'Lista numerada'
        },
        {
            icon: Quote,
            command: 'formatBlock',
            value: 'blockquote',
            title: 'Cita'
        },
        {
            icon: AlignLeft,
            command: 'justifyLeft',
            title: 'Alinear a la izquierda'
        },
        {
            icon: AlignCenter,
            command: 'justifyCenter',
            title: 'Centrar'
        },
        {
            icon: AlignRight,
            command: 'justifyRight',
            title: 'Alinear a la derecha'
        },
        {
            icon: Undo,
            command: 'undo',
            title: 'Deshacer (Ctrl+Z)'
        },
        {
            icon: Redo,
            command: 'redo',
            title: 'Rehacer (Ctrl+Y)'
        }
    ];

    // Manejo de atajos de teclado
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    executeCommand('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    executeCommand('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    executeCommand('underline');
                    break;
                case 'z':
                    e.preventDefault();
                    executeCommand('undo');
                    break;
                case 'y':
                    e.preventDefault();
                    executeCommand('redo');
                    break;
            }
        }
    };

    // Obtener texto plano para el contador de caracteres
    const getPlainText = () => {
        if (editorRef.current) {
            return editorRef.current.innerText || '';
        }
        return '';
    };

    return (
        <div className={`rich-editor border rounded-lg ${isFocused ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-300'} ${className}`}>
            {/* Barra de herramientas */}
            <div className="border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg">
                <div className="flex flex-wrap gap-1">
                    {toolbarButtons.map((button, index) => {
                        const IconComponent = button.icon;
                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => executeCommand(button.command, button.value)}
                                className="p-2 rounded hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors"
                                title={button.title}
                            >
                                <IconComponent className="w-4 h-4" />
                            </button>
                        );
                    })}
                    
                    {/* Selector de tamaño de fuente */}
                    <div className="border-l border-gray-300 ml-2 pl-2">
                        <select
                            onChange={(e) => executeCommand('fontSize', e.target.value)}
                            className="text-sm border-none bg-transparent focus:outline-none"
                            defaultValue="3"
                        >
                            <option value="1">Muy pequeño</option>
                            <option value="2">Pequeño</option>
                            <option value="3">Normal</option>
                            <option value="4">Grande</option>
                            <option value="5">Muy grande</option>
                            <option value="6">Enorme</option>
                        </select>
                    </div>

                    {/* Selector de encabezados */}
                    <select
                        onChange={(e) => executeCommand('formatBlock', e.target.value)}
                        className="text-sm border-none bg-transparent focus:outline-none ml-2"
                        defaultValue="div"
                    >
                        <option value="div">Párrafo normal</option>
                        <option value="h1">Título 1</option>
                        <option value="h2">Título 2</option>
                        <option value="h3">Título 3</option>
                        <option value="h4">Título 4</option>
                    </select>
                </div>
            </div>

            {/* Área de edición */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                className="p-4 focus:outline-none"
                style={{ 
                    minHeight,
                    lineHeight: '1.6',
                    fontSize: '16px',
                    direction: 'ltr', // Forzar dirección izquierda a derecha
                    textAlign: 'left'  // Alinear texto a la izquierda
                }}
                data-placeholder={placeholder}
                suppressContentEditableWarning={true}
            />

            {/* Información adicional */}
            <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 rounded-b-lg">
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>
                        {getPlainText().length} caracteres
                    </div>
                    <div className="text-xs">
                        Tip: Usa Ctrl+B para negrita, Ctrl+I para cursiva, Ctrl+U para subrayado
                    </div>
                </div>
            </div>

            {/* Estilos internos para el editor */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    [contenteditable]:empty:before {
                        content: attr(data-placeholder);
                        color: #9CA3AF;
                        font-style: italic;
                    }
                    
                    .rich-editor [contenteditable] {
                        direction: ltr !important;
                        text-align: left !important;
                        unicode-bidi: normal !important;
                    }
                    
                    .rich-editor [contenteditable] h1 {
                        font-size: 2em;
                        font-weight: bold;
                        margin: 0.5em 0;
                        direction: ltr !important;
                        text-align: left !important;
                    }
                    
                    .rich-editor [contenteditable] h2 {
                        font-size: 1.5em;
                        font-weight: bold;
                        margin: 0.5em 0;
                        direction: ltr !important;
                        text-align: left !important;
                    }
                    
                    .rich-editor [contenteditable] h3 {
                        font-size: 1.3em;
                        font-weight: bold;
                        margin: 0.5em 0;
                        direction: ltr !important;
                        text-align: left !important;
                    }
                    
                    .rich-editor [contenteditable] h4 {
                        font-size: 1.1em;
                        font-weight: bold;
                        margin: 0.5em 0;
                        direction: ltr !important;
                        text-align: left !important;
                    }
                    
                    .rich-editor [contenteditable] blockquote {
                        border-left: 4px solid #E5E7EB;
                        padding-left: 1em;
                        margin: 1em 0;
                        font-style: italic;
                        color: #6B7280;
                        direction: ltr !important;
                        text-align: left !important;
                    }
                    
                    .rich-editor [contenteditable] ul, .rich-editor [contenteditable] ol {
                        padding-left: 2em;
                        margin: 1em 0;
                        direction: ltr !important;
                        text-align: left !important;
                    }
                    
                    .rich-editor [contenteditable] li {
                        margin: 0.5em 0;
                        direction: ltr !important;
                        text-align: left !important;
                    }
                    
                    .rich-editor [contenteditable] p {
                        margin: 0.5em 0;
                        direction: ltr !important;
                        text-align: left !important;
                    }
                    
                    .rich-editor [contenteditable] div {
                        direction: ltr !important;
                        text-align: left !important;
                    }
                    
                    .rich-editor [contenteditable] strong {
                        font-weight: bold;
                    }
                    
                    .rich-editor [contenteditable] em {
                        font-style: italic;
                    }
                    
                    .rich-editor [contenteditable] u {
                        text-decoration: underline;
                    }
                `
            }} />
        </div>
    );
};

export default RichTextEditor;
