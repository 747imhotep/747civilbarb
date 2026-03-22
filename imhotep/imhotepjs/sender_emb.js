// ======================================
// civilisationoubarbarie.org
// sender_emb.js
// Dead Angle Institute
// Comment Modal + Sender API integration
// 504 lines
// Last updated: 2024-06-10
// ======================================

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        FORMSPREE_ENDPOINT: 'https://formspree.io/f/mkoqrerw',
        SENDER_API_ENDPOINT: 'https://deadangleinstitute.org/api/sender-subscribe',  // producion endpoint
        SENDER_LIST_ID: 'eV2XyW',  // Your Sender.net list ID
        HONEYPOT_FIELD: '_honey',
        DEBUG: true
    };

    class ImhotepCommentHandler {
        constructor() {
            this.form = null;
            this.modal = null;
            this.openBtn = null;
            this.closeBtn = null;
            this.clearBtn = null;
            this.keyAtOpen = null;
            
            this.init();
        }

        init() {
            // Retry mechanism for form detection
            let attempts = 0;
            const maxAttempts = 20;
            const interval = 200;
            
            const findForm = () => {
                this.form = document.getElementById('cmtForm');
                this.modal = document.getElementById('cmt-modal');
                this.openBtn = document.getElementById('open-cmt-modal');
                this.closeBtn = document.getElementById('cmt-close');
                this.clearBtn = document.getElementById('clearFormBtn');
                
                if (this.form) {
                    console.log('✅ Form found');
                    this.setupEventListeners();
                    this.setupKeySelection();
                    this.populateKeyField();
                    this.watchForKeyChanges();
                    
                    if (CONFIG.DEBUG) {
                        console.log('✅ Imhotep Comment Handler initialized');
                    }
                } else {
                    attempts++;
                    if (attempts < maxAttempts) {
                        console.log(`⏳ Form not found, retrying (${attempts}/${maxAttempts})...`);
                        setTimeout(findForm, interval);
                    } else {
                        console.error('❌ Form not found after multiple attempts');
                    }
                }
            };
    
            findForm();
        }

        setupEventListeners() {
            // ==============================
            // Modal controls
            // ==============================
            if (this.openBtn) {
                this.openBtn.addEventListener('click', () => this.openModal());
            }
            
            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', () => this.closeModal());
            }
            
            if (this.clearBtn) {
                this.clearBtn.addEventListener('click', () => this.clearForm());
            }

            //==============================
            // Close modal when clicking outside
            //==============================
            window.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });

            //==============================
            // Form submission
            //==============================
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));

            //==============================
            // Listen for key selection from comments-new.js
            //==============================
            document.addEventListener('imhotep:keySelected', (e) => {
                this.setSelectedKey(e.detail.key);
            });
        }

        setupKeySelection() {
            const keyButtons = document.querySelectorAll('[data-imhotep-key]');
            keyButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const key = e.target.dataset.imhotepKey;
                    this.setSelectedKey(key);
                });
            });
        }

        setSelectedKey(key) {
            const keyInput = document.getElementById('cle');
            if (keyInput) {
                keyInput.value = key;
                console.log(`🔑 Key selected: ${key}`);
                this.openModal();
            }
        }

        openModal() {
            if (this.modal) {
                this.modal.classList.add('active');
                this.modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        }

        closeModal() {
            if (this.modal) {
                this.modal.classList.remove('active');
                this.modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        }

        clearForm() {
            this.form.reset();
            
            const urlParams = new URLSearchParams(window.location.search);
            const keyFromUrl = urlParams.get('cle');
            if (keyFromUrl) {
                this.setSelectedKey(keyFromUrl);
            }
        }

        populateKeyField() {
            const keyInput = document.getElementById('cle');
            if (!keyInput) return;
            
            if (window.currentImhotepKey) {
                const keyNumber = window.currentImhotepKey.match(/Clé \d+/)?.[0] || window.currentImhotepKey;
                keyInput.value = keyNumber;
                console.log('🔑 Key populated:', keyNumber);
            } else {
                keyInput.value = "Clé";
            }
        }

        watchForKeyChanges() {
            if (!this.modal) return;
            
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (this.modal.classList.contains('active')) {
                            this.populateKeyField();
                            this.keyAtOpen = document.getElementById('cle')?.value;
                            
                            if (CONFIG.DEBUG) {
                                console.log('🔒 Key locked at modal open:', this.keyAtOpen);
                            }
                        }
                    }
                });
            });
            
            observer.observe(this.modal, { attributes: true });
        }

        clearKeyField() {
            const keyInput = document.getElementById('cle');
            if (keyInput) {
                keyInput.value = '';
            }
            this.keyAtOpen = null;
            
            if (CONFIG.DEBUG) {
                console.log('🧹 Key field cleared');
            }
        }

        async handleSubmit(e) {
            e.preventDefault();

            //==============================
            // Check honeypot
            //==============================
            if (this.isSpam()) {
                console.log('🤖 Spam detected');
                this.showMessage('Message envoyé', 'success');
                this.form.reset();
                this.closeModal();
                return;
            }

            const formData = new FormData(this.form);

            //==============================
            // Validate
            //==============================
            const errors = this.validateForm(formData);
            if (errors.length > 0) {
                this.showMessage(errors.join('<br>'), 'error');
                return;
            }

            //==============================
            // Prepare data
            //==============================
            const commentData = {
                name: formData.get('name'),
                email: formData.get('email'),
                cle: formData.get('cle') || this.keyAtOpen || "Clé",
                message: formData.get('message'),
                reference_id: this.generateReferenceId(),
                page: window.location.pathname,
                timestamp: new Date().toISOString(),
                consent: formData.get('consent') === 'on',
                user_agent: navigator.userAgent
            };

            this.showLoading(true);

            try {
                //==============================
                // Submit to both endpoints in parallel
                //==============================
                const [senderResult, formspreeResult] = await Promise.allSettled([
                    this.submitToSender(commentData).catch(err => {
                        console.error('Sender error:', err);
                        throw err;
                    }),
                    this.submitToFormspree(commentData).catch(err => {
                        console.error('Formspree error:', err);
                        throw err;
                    })
                ]);

                //==============================
                // Handle results
                //==============================
                if (senderResult.status === 'fulfilled' && formspreeResult.status === 'fulfilled') {
                    this.showMessage('✨ Commentaire envoyé avec la Clé d\'Imhotep!', 'success');
                    this.form.reset();
                    this.closeModal();
                    this.clearKeyField();
                    this.trackSuccess(commentData);
                } 
                else if (senderResult.status === 'fulfilled' && formspreeResult.status === 'rejected') {
                    console.warn('⚠️ Formspree failed but Sender succeeded', formspreeResult.reason);
                    this.showMessage('Commentaire partiellement envoyé', 'warning');
                }
                else if (senderResult.status === 'rejected' && formspreeResult.status === 'fulfilled') {
                    console.warn('⚠️ Sender failed but Formspree succeeded', senderResult.reason);
                    this.showMessage('Commentaire enregistré, problème de newsletter', 'warning');
                }
                else {
                    throw new Error('Both submissions failed');
                }

            } catch (error) {
                console.error('❌ Submission error:', error);
                this.showMessage('Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
            } finally {
                this.showLoading(false);
            }
        }

        async submitToSender(data) {
            try {
                // Prepare custom fields matching your Sender.net setup
                const payload = {
                    email: data.email,
                    name: data.name,
                    list_id: CONFIG.SENDER_LIST_ID,
                    fields: {
                        num_cle: data.cle,
                        message: data.message,
                        comment_count: (this.getCommentCount() + 1).toString(),
                        last_comment_date: new Date().toISOString()
                    }
                };

                if (CONFIG.DEBUG) {
                    console.log('📤 Sending to Sender.net:', payload);
                }

                const response = await fetch(CONFIG.SENDER_API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (!response.ok) {
                    console.error('Sender API error response:', result);
                    throw new Error(result.error || `Sender API error: ${response.status}`);
                }

                if (CONFIG.DEBUG) {
                    console.log('✅ Sender.net subscription successful:', result);
                }

                return result;

            } catch (error) {
                console.error('❌ Sender.net error:', error);
                throw error;
            }
        }

        async submitToFormspree(data) {
            const formspreePayload = {
                name: data.name,
                email: data.email,
                cle: data.cle,
                message: data.message,
                reference_id: data.reference_id,
                page: data.page,
                consent: data.consent,
                _replyto: data.email,
                _subject: `Commentaire Imhotep: ${data.cle}`
            };

            const response = await fetch(CONFIG.FORMSPREE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formspreePayload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Formspree error');
            }

            return result;
        }

        generateReferenceId() {
            return 'ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
        }

        getCommentCount() {
            let count = localStorage.getItem('imhotep_comment_count');
            if (count === null) {
                count = 0;
                localStorage.setItem('imhotep_comment_count', count);
            }
            return parseInt(count);
        }

        isSpam() {
            const honeyField = this.form.querySelector(`[name="${CONFIG.HONEYPOT_FIELD}"]`);
            return honeyField && honeyField.value && honeyField.value.length > 0;
        }

        validateForm(formData) {
            const errors = [];
            
            if (!formData.get('name') || formData.get('name').trim() === '') {
                errors.push('Le nom est requis');
            }
            
            const email = formData.get('email');
            if (!email || !this.isValidEmail(email)) {
                errors.push('Email valide requis');
            }
            
            if (!formData.get('message') || formData.get('message').trim() === '') {
                errors.push('Le commentaire est requis');
            }
            
            if (formData.get('consent') !== 'on') {
                errors.push('Vous devez accepter les conditions');
            }
            
            return errors;
        }

        isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }

        showMessage(message, type) {
            const alertDiv = document.createElement('div');
            alertDiv.className = `imhotep-alert imhotep-alert-${type}`;
            alertDiv.innerHTML = message;
            alertDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#ff9800' : '#f44336'};
                color: white;
                border-radius: 5px;
                z-index: 10001;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            `;

            document.body.appendChild(alertDiv);
            setTimeout(() => alertDiv.remove(), 5000);
        }

        showLoading(show) {
            let loader = document.getElementById('imhotep-loader');
            
            if (show && !loader) {
                loader = document.createElement('div');
                loader.id = 'imhotep-loader';
                loader.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.5);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 10002;
                    ">
                        <div style="
                            background: white;
                            padding: 30px;
                            border-radius: 10px;
                            text-align: center;
                        ">
                            <div class="spinner" style="
                                border: 4px solid #f3f3f3;
                                border-top: 4px solid #3498db;
                                border-radius: 50%;
                                width: 40px;
                                height: 40px;
                                animation: spin 1s linear無限;
                                margin: 0 auto 15px;
                            "></div>
                            <p>Envoi en cours...</p>
                        </div>
                    </div>
                `;
                
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
                
                document.body.appendChild(loader);
            } else if (!show && loader) {
                loader.remove();
            }
        }

        trackSuccess(data) {
            if (CONFIG.DEBUG) {
                console.log('📊 Comment submitted:', {
                    key: data.cle,
                    reference: data.reference_id,
                    page: data.page
                });
            }
        }
    }

    //==============================
    // Initialize when DOM is ready
    //==============================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new ImhotepCommentHandler());
    } else {
        new ImhotepCommentHandler();
    }

})();