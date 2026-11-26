/* ==========================================================================
   DevSec Portfolio — Vanilla ES6+ JS
   Sem dependências, mobile-first, acessível
   ========================================================================== */

(() => {
  'use strict';

  /* -------------------------------------------------------------------------
     Utilitários
     ------------------------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const trapFocus = (element) => {
    const focusable = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    element.addEventListener('keydown', handleTab);
    return () => element.removeEventListener('keydown', handleTab);
  };

  /* -------------------------------------------------------------------------
     1. Hamburger Menu — ARIA toggle, fecha ao clicar link/ESC, focus trap
     ------------------------------------------------------------------------- */
  const initHamburger = () => {
    const toggle = $('.nav__toggle');
    const menu = $('#nav-menu');
    if (!toggle || !menu) return;

    let cleanupTrap = null;
    let lastFocused = null;

    const open = () => {
      toggle.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
      lastFocused = document.activeElement;
      cleanupTrap = trapFocus(menu);
      $('[role="menuitem"]', menu)?.focus();
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
      cleanupTrap?.();
      lastFocused?.focus();
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      toggle.getAttribute('aria-expanded') === 'true' ? close() : open();
    });

    menu.querySelectorAll('[role="menuitem"]').forEach((link) => {
      link.addEventListener('click', close);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') close();
    });

    // Fecha ao redimensionar para desktop
    const mq = window.matchMedia('(min-width: 640px)');
    const handleResize = (e) => { if (e.matches) close(); };
    mq.addEventListener?.('change', handleResize) || mq.addListener(handleResize);
  };

  /* -------------------------------------------------------------------------
     2. Project Filter Tabs — ARIA tablist, filtra por data-category
     ------------------------------------------------------------------------- */
  const initProjectFilters = () => {
    const tabs = $$('.filter-btn');
    const panels = {
      all: $('#panel-todos'),
      suporte: $('#panel-suporte'),
      sheets: $('#panel-sheets'),
      seguranca: $('#panel-seg'),
    };
    const grids = {
      all: $('#projects-grid-all'),
      suporte: $('#projects-grid-suporte'),
      sheets: $('#projects-grid-sheets'),
      seguranca: $('#projects-grid-seg'),
    };

    if (!tabs.length || !panels.all) return;

    // Dados dos projetos baseados na experiência real
    const projects = [
      {
        id: 'automacao-sheets',
        category: 'sheets',
        icon: '📊',
        title: 'Automação de Autorizações Médicas (Google Sheets)',
        desc: 'Desenvolvimento de automações no Google Sheets/Apps Script para cálculo automático de vencimento de autorizações de exames, eliminando processo manual e reduzindo erros operacionais no setor de faturamento hospitalar.',
        tech: ['Google Sheets', 'Apps Script', 'JavaScript', 'Automação'],
        links: [], // Sem link GitHub (projeto interno)
      },
      {
        id: 'relatorios-seg',
        category: 'seguranca',
        icon: '📋',
        title: 'Relatórios Técnicos Mensais de Segurança',
        desc: 'Compilação e apresentação de relatórios mensais executivos e técnicos com documentação detalhada de incidentes, métricas de detecção, tempos de resposta e recomendações de hardening para clientes da BlueEye.',
        tech: ['Relatórios Técnicos', 'KPIs de Segurança', 'Documentação', 'Comunicação'],
        links: [], // Sem link GitHub (documentos internos)
      },
      // Projetos de Estudo / Repositórios Acadêmicos
      {
        id: 'engenharia-prompt-ia',
        category: 'suporte',
        icon: '🤖',
        title: 'Engenharia de Prompt para IA',
        desc: 'Repositório de estudos sobre engenharia de prompt, técnicas de prompting, few-shot, chain-of-thought e otimização de interações com LLMs.',
        tech: ['Prompt Engineering', 'LLMs', 'IA Generativa', 'Python'],
        links: [{ href: 'https://github.com/GustavoMendesPereira/engenharia_de_prompt_ia', label: 'GitHub' }],
      },
      {
        id: 'gama',
        category: 'suporte',
        icon: '🎮',
        title: 'Sistema de Cadastro de Estudantes — Projeto Acadêmico',
        desc: 'Projeto desenvolvido durante a faculdade (ADS/UDF) com o intuito de criar um sistema completo de cadastro de estudantes e suas respectivas disciplinas. Implementado em Python, contempla CRUD de alunos, matrícula em disciplinas, validações de regras de negócio e persistência de dados.',
        tech: ['Python', 'CRUD', 'POO', 'ADS'],
        links: [{ href: 'https://github.com/GustavoMendesPereira/GAMA', label: 'GitHub' }],
      },
      {
        id: 'materia-desenvolvimento-web',
        category: 'suporte',
        icon: '🌐',
        title: 'Matéria de Desenvolvimento Web',
        desc: 'Repositório com exercícios, projetos e anotações da disciplina de Desenvolvimento Web do curso de ADS — HTML, CSS, JavaScript, frameworks e boas práticas.',
        tech: ['HTML', 'CSS', 'JavaScript', 'Web Dev', 'ADS'],
        links: [{ href: 'https://github.com/GustavoMendesPereira/Materia_Desenvolvimento_Web', label: 'GitHub' }],
      },
    ];

    // Renderiza cards
    const renderCard = (p) => {
      let tagClass, tagLabel;
      if (p.category === 'seguranca') {
        tagClass = 'sec'; tagLabel = '🛡️ Segurança';
      } else if (p.category === 'sheets') {
        tagClass = 'sec'; tagLabel = '📊 Google Sheets';
      } else {
        tagClass = 'back'; tagLabel = '⚙️ Backend';
      }
      return `
      <article class="project-card animate-in" data-category="${p.category}">
        <div class="project-card__header">
          <span class="project-card__icon" aria-hidden="true">${p.icon}</span>
          <div class="project-card__tags">
            <span class="project-card__tag project-card__tag--${tagClass}">${tagLabel}</span>
          </div>
        </div>
        <h3 class="project-card__title">${p.title}</h3>
        <p class="project-card__desc">${p.desc}</p>
        <div class="project-card__tech">
          ${p.tech.map(t => `<span>${t}</span>`).join('')}
        </div>
        <div class="project-card__links">
          ${p.links.map(l => `<a href="${l.href}" class="project-card__link">${l.label}</a>`).join('')}
        </div>
      </article>
    `;
    };

    const renderAll = () => {
      Object.values(grids).forEach(g => { if (g) g.innerHTML = ''; });
      projects.forEach(p => {
        if (grids.all) grids.all.insertAdjacentHTML('beforeend', renderCard(p));
        if (grids[p.category]) grids[p.category].insertAdjacentHTML('beforeend', renderCard(p));
      });
      // Re-trigger entrance animations
      requestAnimationFrame(() => {
        $$('.project-card').forEach((el, i) => {
          el.style.animationDelay = `${i * 80}ms`;
        });
      });
    };

    const setActive = (category) => {
      tabs.forEach(t => {
        const isActive = t.dataset.filter === category;
        t.setAttribute('aria-selected', isActive);
        t.classList.toggle('filter-btn--active', isActive);
      });
      Object.entries(panels).forEach(([key, panel]) => {
        if (!panel) return;
        const show = key === category;
        panel.hidden = !show;
        panel.classList.toggle('projetos__panel--active', show);
        if (show) panel.removeAttribute('hidden');
      });
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => setActive(tab.dataset.filter));
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); setActive(tab.dataset.filter);
        }
      });
    });

    renderAll();
    setActive('all');
  };

  /* -------------------------------------------------------------------------
     3. Form Validation — blur/submit, inline errors aria-live, honeypot, toast
     ------------------------------------------------------------------------- */
  const initFormValidation = () => {
    const form = $('#contact-form');
    if (!form) return;

    const fields = {
      nome: { el: $('#nome'), validate: v => v.trim().length >= 2, msg: 'Nome deve ter pelo menos 2 caracteres' },
      email: { el: $('#email'), validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'E-mail inválido' },
      assunto: { el: $('#assunto'), validate: v => v !== '', msg: 'Selecione um assunto' },
      mensagem: { el: $('#mensagem'), validate: v => v.trim().length >= 10, msg: 'Mensagem deve ter pelo menos 10 caracteres' },
    };

    const statusEl = $('#form-status');
    const toastContainer = getOrCreateToastContainer();

    const showError = (fieldName, message) => {
      const { el } = fields[fieldName];
      const errorEl = $(`#${fieldName}-error`);
      if (!el || !errorEl) return;
      el.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
    };

    const clearError = (fieldName) => {
      const { el } = fields[fieldName];
      const errorEl = $(`#${fieldName}-error`);
      if (!el || !errorEl) return;
      el.setAttribute('aria-invalid', 'false');
      errorEl.textContent = '';
    };

    const validateField = (fieldName) => {
      const { el, validate, msg } = fields[fieldName];
      if (!el) return true;
      const valid = validate(el.value);
      valid ? clearError(fieldName) : showError(fieldName, msg);
      return valid;
    };

    // Blur validation
    Object.keys(fields).forEach(name => {
      fields[name].el?.addEventListener('blur', () => validateField(name));
      fields[name].el?.addEventListener('input', () => {
        if (fields[name].el.getAttribute('aria-invalid') === 'true') validateField(name);
      });
    });

    // Honeypot (campo invisível para bots)
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.tabIndex = -1;
    honeypot.autocomplete = 'off';
    honeypot.style.cssText = 'position:absolute;left:-9999px;opacity:0;pointer-events:none;';
    honeypot.setAttribute('aria-hidden', 'true');
    form.appendChild(honeypot);

    const showToast = (message, type = 'success') => {
      const toast = document.createElement('div');
      toast.className = `toast toast--${type}`;
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'polite');
      toast.innerHTML = `
        <span class="toast__icon" aria-hidden="true">${type === 'success' ? '✓' : '✕'}</span>
        <span class="toast__msg">${message}</span>
        <button class="toast__close" aria-label="Fechar">&times;</button>
      `;
      toast.querySelector('.toast__close').addEventListener('click', () => toast.remove());
      toastContainer.appendChild(toast);
      setTimeout(() => toast.remove(), 5000);
    };

    const getOrCreateToastContainer = () => {
      let container = $('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
      return container;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot check
      if (honeypot.value) return; // Bot detectado, ignora silenciosamente

      // Valida todos
      const allValid = Object.keys(fields).every(validateField);
      if (!allValid) {
        showToast('Por favor, corrija os erros no formulário', 'error');
        const firstInvalid = Object.keys(fields).find(name =>
          fields[name].el.getAttribute('aria-invalid') === 'true'
        );
        fields[firstInvalid]?.el?.focus();
        return;
      }

      // Simula envio (substituir por fetch real)
      const submitBtn = $('button[type="submit"]', form);
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      try {
        // Aqui faria: await fetch('/api/contact', { method: 'POST', body: new FormData(form) })
        await new Promise(r => setTimeout(r, 1000)); // Simula network

        showToast('Mensagem enviada com sucesso! Retornarei em breve.', 'success');
        form.reset();
        Object.keys(fields).forEach(clearError);
      } catch {
        showToast('Erro ao enviar. Tente novamente ou mande e-mail direto.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  };

  /* -------------------------------------------------------------------------
     4. Typing Effect — ciclo de 3 roles no hero subtitle
     ------------------------------------------------------------------------- */
  const initTypingEffect = () => {
    const target = $('#typing-target');
    if (!target) return;

    const roles = [
      'Estudante ADS | Suporte Técnico & Segurança',
      'Automação Python & Google Sheets',
      'Monitoramento SIEM & Resposta a Incidentes',
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 60;
    const deleteSpeed = 30;
    const pauseEnd = 1800;
    const pauseStart = 500;

    const type = () => {
      const currentRole = roles[roleIndex];
      if (isDeleting) {
        target.textContent = currentRole.slice(0, charIndex - 1);
        charIndex--;
      } else {
        target.textContent = currentRole.slice(0, charIndex + 1);
        charIndex++;
      }

      let delay = isDeleting ? deleteSpeed : typeSpeed;

      if (!isDeleting && charIndex === currentRole.length) {
        delay = pauseEnd;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = pauseStart;
      }

      setTimeout(type, delay);
    };

    // Respeita prefers-reduced-motion
    if (!prefersReducedMotion()) {
      type();
    } else {
      target.textContent = roles[0];
    }
  };

  /* -------------------------------------------------------------------------
     5. Skill Bars Animation — IntersectionObserver + requestAnimationFrame
     ------------------------------------------------------------------------- */
  const initSkillBars = () => {
    const skills = $$('.skill');
    if (!skills.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -50px 0px' });

    skills.forEach(skill => observer.observe(skill));
  };

  /* -------------------------------------------------------------------------
     6. Smooth Scroll — anchors internos (respeita prefers-reduced-motion)
     ------------------------------------------------------------------------- */
  const initSmoothScroll = () => {
    if (prefersReducedMotion()) return;

    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = $(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Atualiza URL sem recarregar
        history.pushState(null, '', href);
        // Foco para acessibilidade
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.removeAttribute('tabindex');
      });
    });
  };

  /* -------------------------------------------------------------------------
     7. Entrance Animations — IntersectionObserver para .animate-in
     ------------------------------------------------------------------------- */
  const initEntranceAnimations = () => {
    if (prefersReducedMotion()) {
      $$('.animate-in').forEach(el => el.style.opacity = '1');
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    $$('.animate-in').forEach(el => observer.observe(el));
  };

  /* -------------------------------------------------------------------------
     8. Header Scroll Effect — backdrop blur intensifica ao rolar
     ------------------------------------------------------------------------- */
  const initHeaderScroll = () => {
    const header = $('.header');
    if (!header) return;

    let lastScroll = 0;
    const handleScroll = () => {
      const y = window.scrollY;
      if (y > 20) header.classList.add('header--scrolled');
      else header.classList.remove('header--scrolled');
      lastScroll = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
  };

  /* -------------------------------------------------------------------------
     Init — Executa tudo quando DOM pronto
     ------------------------------------------------------------------------- */
  const init = () => {
    initHamburger();
    initProjectFilters();
    initFormValidation();
    initTypingEffect();
    initSkillBars();
    initSmoothScroll();
    initEntranceAnimations();
    initHeaderScroll();

    // Marca body como carregado para CSS transitions
    document.body.classList.add('loaded');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();