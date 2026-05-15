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


  if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if(confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                // 🌟 Limpiamos la sesión simulada del navegador
                localStorage.removeItem('crm_user_logged');
                
                // 🚀 Redirigimos al Login de vuelta inmediatamente
                window.location.href = 'login.html';
            }
        });
    }
});
