document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const logoutBtn = document.getElementById('logout-btn');


    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            

            navLinks.forEach(l => {
                l.classList.remove('text-white', 'bg-slate-800');
                l.classList.add('text-gray-300');
            });
            

            link.classList.remove('text-gray-300');
            link.classList.add('text-white', 'bg-slate-800');
            

            const sectionName = link.getAttribute('data-section');
            if(breadcrumbCurrent && sectionName) {
                breadcrumbCurrent.innerText = sectionName;
            }

            if(sectionName) {
                // Ocultar todas las vistas activas
                document.querySelectorAll('.view-section').forEach(view => {
                    view.classList.add('hidden');
                });

                // Formatear el ID objetivo
                let targetId = 'view-' + sectionName.toLowerCase();
                if (sectionName === 'Configuración') targetId = 'view-config';

                // Mostrar solo la vista seleccionada
                const targetView = document.getElementById(targetId);
                if (targetView) {
                    targetView.classList.remove('hidden');
                }
            }


            if(window.innerWidth < 768 && !sidebar.classList.contains('-translate-x-full')) {
                toggleSidebar();
            }
        });
    });


    function toggleSidebar() {
        sidebar.classList.toggle('-translate-x-full');
        sidebarOverlay.classList.toggle('hidden');
    }

    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleSidebar);
    }
    if(sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }


    // Modal Confirmar Logout
    const modalLogout = document.getElementById('modal-logout');
    const btnCancelLogout = document.getElementById('btn-cancel-logout');
    const btnConfirmLogout = document.getElementById('btn-confirm-logout');

    function toggleLogoutModal() {
        if (modalLogout) {
            modalLogout.classList.toggle('hidden');
        }
    }

    if(logoutBtn) {
        logoutBtn.addEventListener('click', toggleLogoutModal);
    }
    if(btnCancelLogout) {
        btnCancelLogout.addEventListener('click', toggleLogoutModal);
    }
    if(btnConfirmLogout) {
        btnConfirmLogout.addEventListener('click', () => {
            // Limpiamos la sesión simulada del navegador
            localStorage.removeItem('crm_user_logged');
            // Redirigimos al Login
            window.location.replace('login.html');
        });
    }
    if(modalLogout) {
        modalLogout.addEventListener('click', (e) => {
            if (e.target === modalLogout) toggleLogoutModal();
        });
    }
    // Modal Nuevo Lead
    const modalNewLead = document.getElementById('modal-new-lead');
    const btnNewLead = document.getElementById('btn-new-lead'); // Debe existir en HTML
    const btnCancelLead = document.getElementById('btn-cancel-lead');
    const btnCloseIcon = document.getElementById('btn-close-modal-icon');

    function toggleLeadModal() {
        if (modalNewLead) {
            modalNewLead.classList.toggle('hidden');
        }
    }

    if (btnNewLead) btnNewLead.addEventListener('click', toggleLeadModal);
    if (btnCancelLead) btnCancelLead.addEventListener('click', toggleLeadModal);
    if (btnCloseIcon) btnCloseIcon.addEventListener('click', toggleLeadModal);

    if (modalNewLead) {
        modalNewLead.addEventListener('click', (e) => {
            if (e.target === modalNewLead) toggleLeadModal();
        });
    }
});
