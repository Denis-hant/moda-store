document.addEventListener("DOMContentLoaded", () => {
    // ═══════════════════════════════════════════════════════════════
    // HEADER GLOW EFFECT
    // ═══════════════════════════════════════════════════════════════

    const HeaderGlow = {
        element: document.querySelector(".header"),
        lastScrollY: window.scrollY,

        init() {
            if (!this.element) return;
            
            this.updatePosition();
            window.addEventListener('resize', () => this.updatePosition(), { passive: true });
            window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        },

        updatePosition() {
            const rect = this.element.getBoundingClientRect();
            const left = (rect.left + window.scrollX) + 'px';
            const width = rect.width + 'px';
            const top = (rect.bottom + window.scrollY) + 'px';

            document.body.style.setProperty('--header-glow-left', left);
            document.body.style.setProperty('--header-glow-width', width);
            document.body.style.setProperty('--header-glow-top', top);
        },

        handleScroll() {
            const currentY = window.scrollY;
            const SCROLL_THRESHOLD = 40;

            if (currentY > this.lastScrollY && currentY > SCROLL_THRESHOLD) {
                this.element.classList.add("scrolled");
                this.updatePosition();
            } else if (currentY < this.lastScrollY) {
                this.element.classList.remove("scrolled");
            }

            this.lastScrollY = currentY;
        }
    };

    HeaderGlow.init();


    // ═══════════════════════════════════════════════════════════════
    // REGISTRATION MODAL
    // ═══════════════════════════════════════════════════════════════

    const RegisterModal = {
        modal: document.getElementById('registerModal'),
        form: document.getElementById('registerForm'),
        triggers: document.querySelectorAll('.js-open-register'),
        successElement: null,

        init() {
            if (!this.modal) return;
            
            this.successElement = this.modal.querySelector('.register__success');
            this.attachEventListeners();
        },

        attachEventListeners() {
            // Open modal buttons
            this.triggers.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.open();
                });
            });

            // Close modal (overlay and buttons)
            this.modal.addEventListener('click', (ev) => {
                if (ev.target.dataset.action === 'close' || ev.target.closest('[data-action="close"]')) {
                    this.close();
                }
            });

            // Form submission
            if (this.form) {
                this.form.addEventListener('submit', (e) => this.handleFormSubmit.call(this, e));
            }

            // Password visibility toggles
            this.setupPasswordToggles();

            // Floating labels
            this.setupFloatingLabels();
        },

        open() {
            this.modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');
            
            const firstInput = this.modal.querySelector('input');
            if (firstInput) firstInput.focus();
            
            document.addEventListener('keydown', this.trapTab.bind(this));
            document.addEventListener('keydown', this.onEscClose.bind(this));
        },

        close() {
            this.modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            document.removeEventListener('keydown', this.trapTab.bind(this));
            document.removeEventListener('keydown', this.onEscClose.bind(this));
        },

        onEscClose(e) {
            if (e.key === 'Escape') this.close();
        },

        trapTab(e) {
            if (e.key !== 'Tab') return;
            
            const focusable = this.modal.querySelectorAll(
                'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
            );
            
            if (!focusable.length) return;
            
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        },

        handleFormSubmit(e) {
            e.preventDefault();

            const formData = {
                name: document.getElementById('register-name'),
                email: document.getElementById('register-email'),
                password: document.getElementById('register-password'),
                confirm: document.getElementById('register-confirm')
            };

            if (!this.validateForm(formData)) return;

            this.showSuccessState();
            setTimeout(() => this.resetForm(), 1600);
        },

        validateForm(formData) {
            let isValid = true;

            // Name validation
            if (!formData.name.value.trim()) {
                this.showError(formData.name, 'Пожалуйста, укажите имя');
                isValid = false;
            } else {
                this.clearError(formData.name);
            }

            // Email validation
            const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            if (!emailPattern.test(formData.email.value.trim())) {
                this.showError(formData.email, 'Введите корректный email');
                isValid = false;
            } else {
                this.clearError(formData.email);
            }

            // Password validation
            if ((formData.password.value || '').length < 8) {
                this.showError(formData.password, 'Пароль должен быть не короче 8 символов');
                isValid = false;
            } else {
                this.clearError(formData.password);
            }

            // Password confirmation
            if (formData.password.value !== formData.confirm.value) {
                this.showError(formData.confirm, 'Пароли не совпадают');
                isValid = false;
            } else {
                this.clearError(formData.confirm);
            }

            return isValid;
        },

        showError(input, message) {
            const formField = input.closest('.form-field');
            const errorElement = formField.querySelector('.error');
            
            errorElement.textContent = message;
            input.setAttribute('aria-invalid', 'true');
            formField.classList.add('error-shake');
            
            setTimeout(() => formField.classList.remove('error-shake'), 460);
        },

        clearError(input) {
            const formField = input.closest('.form-field');
            const errorElement = formField.querySelector('.error');
            
            errorElement.textContent = '';
            input.removeAttribute('aria-invalid');
        },

        showSuccessState() {
            this.form.hidden = true;
            
            if (this.successElement) {
                this.successElement.hidden = false;
                const registerBox = this.modal.querySelector('.register');
                if (registerBox) registerBox.classList.add('register--success');
            }
        },

        resetForm() {
            const registerBox = this.modal.querySelector('.register');
            
            if (registerBox) registerBox.classList.remove('register--success');
            
            this.close();
            this.form.reset();
            this.form.hidden = false;
            
            if (this.successElement) this.successElement.hidden = true;
        },

        setupPasswordToggles() {
            document.querySelectorAll('.password-toggle').forEach(btn => {
                btn.addEventListener('click', () => this.togglePasswordVisibility(btn));
            });

            // Initialize toggle states
            document.querySelectorAll('.password-toggle').forEach(btn => {
                btn.setAttribute('aria-pressed', 'false');
                btn.classList.remove('active');
            });
        },

        togglePasswordVisibility(btn) {
            const inputWrap = btn.closest('.input-wrap');
            const input = inputWrap?.querySelector('input');
            
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            
            btn.setAttribute('aria-pressed', String(isPassword));
            btn.setAttribute('aria-label', isPassword ? 'Скрыть пароль' : 'Показать пароль');
            btn.classList.toggle('active', isPassword);
            
            // Pulse animation
            try {
                btn.animate(
                    [
                        { transform: 'scale(0.98)' },
                        { transform: 'scale(1.02)' },
                        { transform: 'scale(1)' }
                    ],
                    { duration: 220, easing: 'ease-out' }
                );
            } catch (e) {}
            
            input.focus();
        },

        setupFloatingLabels() {
            document.querySelectorAll('.register__form input').forEach(input => {
                const formField = input.closest('.form-field');
                if (!formField) return;

                const updateLabelState = () => {
                    if (input.value && input.value.trim()) {
                        formField.classList.add('filled');
                    } else {
                        formField.classList.remove('filled');
                    }
                };

                input.addEventListener('input', updateLabelState);
                input.addEventListener('blur', updateLabelState);
                updateLabelState(); // Initial state
            });
        }
    };

    RegisterModal.init();


    // ═══════════════════════════════════════════════════════════════
    // FOOTER ANIMATION
    // ═══════════════════════════════════════════════════════════════

    const FooterAnimation = {
        element: document.querySelector(".footer"),
        observer: null,

        init() {
            if (!this.element) return;

            this.observer = new IntersectionObserver(
                entries => this.handleIntersection(entries),
                { threshold: 0.2 }
            );

            this.observer.observe(this.element);
        },

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.element.classList.add("visible");
                    this.observer.unobserve(this.element);
                }
            });
        }
    };

    FooterAnimation.init();

});




