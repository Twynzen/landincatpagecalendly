// ============================================
// Motor de Efectos de Escritura
// ============================================

class TypewriterEngine {
    constructor() {
        this.defaultSpeed = 25; // ms por carácter
        this.fastSpeed = 15;
        this.slowSpeed = 40;
        this.punctuationDelay = 200;
        this.paragraphDelay = 400;
        this.isTyping = false;
        this.currentTyping = null;
    }
    
    // Escribir texto con efecto de máquina de escribir
    async typeText(element, text, options = {}) {
        const {
            speed = this.defaultSpeed,
            onStart = () => {},
            onComplete = () => {},
            onCharacter = () => {},
            preserveHtml = false,
            showCursor = true
        } = options;
        
        this.isTyping = true;
        onStart();
        
        // Limpiar elemento
        element.innerHTML = '';
        
        // Agregar cursor si es necesario
        if (showCursor) {
            element.classList.add('typing-cursor');
        }
        
        // Dividir en párrafos si hay saltos de línea
        const paragraphs = text.split('\n').filter(p => p.trim());
        
        for (let i = 0; i < paragraphs.length; i++) {
            if (i > 0) {
                // Crear nuevo párrafo
                const br = document.createElement('br');
                element.appendChild(br);
                await this.delay(this.paragraphDelay);
            }
            
            const paragraph = paragraphs[i];
            await this.typeParagraph(element, paragraph, speed, onCharacter);
        }
        
        // Remover cursor
        if (showCursor) {
            element.classList.remove('typing-cursor');
        }
        
        this.isTyping = false;
        onComplete();
    }
    
    // Escribir párrafo individual
    async typeParagraph(element, text, speed, onCharacter) {
        // Detectar HTML si es necesario
        const hasHtml = /<[^>]*>/.test(text);
        
        if (hasHtml) {
            await this.typeHtmlText(element, text, speed, onCharacter);
        } else {
            await this.typePlainText(element, text, speed, onCharacter);
        }
    }
    
    // Escribir texto plano
    async typePlainText(element, text, speed, onCharacter) {
        const span = document.createElement('span');
        element.appendChild(span);
        
        for (let i = 0; i < text.length; i++) {
            if (!this.isTyping) break; // Permitir cancelación
            
            const char = text[i];
            span.textContent += char;
            onCharacter(char, i);
            
            // Delay variable según carácter
            let delay = speed;
            if (char === '.' || char === '!' || char === '?') {
                delay = this.punctuationDelay;
            } else if (char === ',' || char === ';') {
                delay = speed * 2;
            }
            
            await this.delay(delay);
        }
    }
    
    // Escribir texto con HTML (básico)
    async typeHtmlText(element, htmlText, speed, onCharacter) {
        // Parsear HTML de forma simple
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText;
        
        await this.typeNodeContent(element, tempDiv, speed, onCharacter);
    }
    
    // Escribir contenido de nodo recursivamente
    async typeNodeContent(container, sourceNode, speed, onCharacter) {
        for (const child of sourceNode.childNodes) {
            if (!this.isTyping) break;
            
            if (child.nodeType === Node.TEXT_NODE) {
                // Nodo de texto
                const text = child.textContent;
                const span = document.createElement('span');
                container.appendChild(span);
                
                for (let i = 0; i < text.length; i++) {
                    if (!this.isTyping) break;
                    
                    const char = text[i];
                    span.textContent += char;
                    onCharacter(char, i);
                    
                    let delay = speed;
                    if (char === '.' || char === '!' || char === '?') {
                        delay = this.punctuationDelay;
                    }
                    
                    await this.delay(delay);
                }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                // Nodo elemento
                const newElement = document.createElement(child.tagName.toLowerCase());
                
                // Copiar atributos
                for (const attr of child.attributes) {
                    newElement.setAttribute(attr.name, attr.value);
                }
                
                container.appendChild(newElement);
                
                // Escribir contenido del elemento
                await this.typeNodeContent(newElement, child, speed, onCharacter);
            }
        }
    }
    
    // Escribir múltiples párrafos con separación
    async typeMultipleParagraphs(container, paragraphs, options = {}) {
        const {
            speed = this.defaultSpeed,
            paragraphDelay = this.paragraphDelay,
            onStart = () => {},
            onComplete = () => {},
            onParagraphComplete = () => {}
        } = options;
        
        this.isTyping = true;
        onStart();
        
        for (let i = 0; i < paragraphs.length; i++) {
            if (!this.isTyping) break;
            
            const p = document.createElement('p');
            container.appendChild(p);
            
            await this.typeText(p, paragraphs[i], {
                speed,
                showCursor: false
            });
            
            onParagraphComplete(i);
            
            if (i < paragraphs.length - 1) {
                await this.delay(paragraphDelay);
            }
        }
        
        this.isTyping = false;
        onComplete();
    }
    
    // Escribir con múltiples velocidades (énfasis)
    async typeWithEmphasis(element, parts, options = {}) {
        const { onComplete = () => {} } = options;
        
        this.isTyping = true;
        element.innerHTML = '';
        element.classList.add('typing-cursor');
        
        for (const part of parts) {
            if (!this.isTyping) break;
            
            const { text, speed = this.defaultSpeed, className = '' } = part;
            
            const span = document.createElement('span');
            if (className) span.className = className;
            element.appendChild(span);
            
            await this.typePlainText(span, text, speed, () => {});
        }
        
        element.classList.remove('typing-cursor');
        this.isTyping = false;
        onComplete();
    }
    
    // Efecto de escritura con borrado (como corrección)
    async typeWithCorrection(element, wrongText, correctText, options = {}) {
        const {
            typeSpeed = this.fastSpeed,
            deleteSpeed = this.fastSpeed / 2,
            pauseBeforeDelete = 800,
            pauseAfterDelete = 300,
            onComplete = () => {}
        } = options;
        
        this.isTyping = true;
        element.innerHTML = '';
        element.classList.add('typing-cursor');
        
        // Escribir texto incorrecto
        await this.typeText(element, wrongText, {
            speed: typeSpeed,
            showCursor: false
        });
        
        // Pausa
        await this.delay(pauseBeforeDelete);
        
        // Borrar texto
        for (let i = wrongText.length; i > 0; i--) {
            if (!this.isTyping) break;
            element.textContent = wrongText.substring(0, i - 1);
            await this.delay(deleteSpeed);
        }
        
        // Pausa después de borrar
        await this.delay(pauseAfterDelete);
        
        // Escribir texto correcto
        await this.typeText(element, correctText, {
            speed: typeSpeed,
            showCursor: false
        });
        
        element.classList.remove('typing-cursor');
        this.isTyping = false;
        onComplete();
    }
    
    // Efecto de escritura en cascada (múltiples elementos)
    async typeCascade(elements, texts, options = {}) {
        const {
            staggerDelay = 200,
            speed = this.defaultSpeed,
            onComplete = () => {}
        } = options;
        
        const promises = elements.map((element, index) => {
            return new Promise(resolve => {
                setTimeout(async () => {
                    await this.typeText(element, texts[index] || '', { speed });
                    resolve();
                }, index * staggerDelay);
            });
        });
        
        await Promise.all(promises);
        onComplete();
    }
    
    // Escribir lista con bullets animados
    async typeList(container, items, options = {}) {
        const {
            speed = this.defaultSpeed,
            itemDelay = 300,
            bulletChar = '•',
            onComplete = () => {}
        } = options;
        
        this.isTyping = true;
        
        for (let i = 0; i < items.length; i++) {
            if (!this.isTyping) break;
            
            const li = document.createElement('div');
            li.className = 'typed-list-item';
            li.style.display = 'flex';
            li.style.gap = '0.5rem';
            li.style.marginBottom = '0.5rem';
            
            const bullet = document.createElement('span');
            bullet.textContent = bulletChar;
            bullet.style.color = 'var(--accent-primary)';
            bullet.style.fontWeight = 'bold';
            
            const text = document.createElement('span');
            
            li.appendChild(bullet);
            li.appendChild(text);
            container.appendChild(li);
            
            // Animar aparición del bullet
            bullet.style.opacity = '0';
            bullet.style.transform = 'scale(0)';
            bullet.style.transition = 'all 0.2s ease';
            
            setTimeout(() => {
                bullet.style.opacity = '1';
                bullet.style.transform = 'scale(1)';
            }, 50);
            
            await this.delay(100);
            
            // Escribir texto del item
            await this.typeText(text, items[i], {
                speed,
                showCursor: false
            });
            
            if (i < items.length - 1) {
                await this.delay(itemDelay);
            }
        }
        
        this.isTyping = false;
        onComplete();
    }
    
    // Detener escritura actual
    stop() {
        this.isTyping = false;
        if (this.currentTyping) {
            clearTimeout(this.currentTyping);
            this.currentTyping = null;
        }
    }
    
    // Utilidad para delays
    delay(ms) {
        return new Promise(resolve => {
            this.currentTyping = setTimeout(resolve, ms);
        });
    }
    
    // Verificar si está escribiendo
    get busy() {
        return this.isTyping;
    }
}

// CSS para cursor de escritura
const typewriterCSS = `
.typing-cursor::after {
    content: '|';
    color: var(--accent-primary, #00ff88);
    animation: cursor-blink 1s ease infinite;
    margin-left: 2px;
}

@keyframes cursor-blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

.typed-list-item {
    opacity: 0;
    animation: fadeInUp 0.3s ease forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;

// Agregar CSS al documento
if (!document.querySelector('#typewriter-css')) {
    const style = document.createElement('style');
    style.id = 'typewriter-css';
    style.textContent = typewriterCSS;
    document.head.appendChild(style);
}

// Exportar instancia global
window.TypewriterEngine = TypewriterEngine;
window.typewriter = new TypewriterEngine();