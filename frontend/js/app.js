document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    navLinks.forEach((link) => {
        link.addEventListener('click', (evento) => {
            evento.preventDefault();

            navLinks.forEach((l) => {
                l.classList.remove('text-white', 'bg-slate-800');
                l.classList.add('text-gray-300');
            });

            link.classList.remove('text-gray-300');
            link.classList.add('text-white', 'bg-slate-800');

            const sectionName = link.getAttribute('data-section');
            if (breadcrumbCurrent && sectionName) {
                breadcrumbCurrent.innerText = sectionName;
            }

            if (sectionName) {
                const todasLasVistas = document.querySelectorAll('.view-section');
                todasLasVistas.forEach((view) => {
                    view.classList.add('hidden');
                });

                let targetId = 'view-' + sectionName.toLowerCase();
                
                if (sectionName === 'Configuración') {
                    targetId = 'view-config';
                }

                const targetView = document.getElementById(targetId);
                if (targetView) {
                    targetView.classList.remove('hidden');
                }
            }

            if (window.innerWidth < 768 && !sidebar.classList.contains('-translate-x-full')) {
                toggleSidebar();
            }
        });
    });

    function toggleSidebar() {
        sidebar.classList.toggle('-translate-x-full');
        sidebarOverlay.classList.toggle('hidden');
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleSidebar);
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }

    const logoutBtn = document.getElementById('logout-btn');
    const modalLogout = document.getElementById('modal-logout');
    const btnCancelLogout = document.getElementById('btn-cancel-logout');
    const btnConfirmLogout = document.getElementById('btn-confirm-logout');

    function toggleLogoutModal() {
        if (modalLogout) {
            modalLogout.classList.toggle('hidden');
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', toggleLogoutModal);
    }
    
    if (btnCancelLogout) {
        btnCancelLogout.addEventListener('click', toggleLogoutModal);
    }

    if (btnConfirmLogout) {
        btnConfirmLogout.addEventListener('click', () => {
            localStorage.removeItem('crm_user_logged');
            window.location.replace('login.html');
        });
    }

    if (modalLogout) {
        modalLogout.addEventListener('click', (evento) => {
            if (evento.target === modalLogout) {
                toggleLogoutModal();
            }
        });
    }

    const modalNewLead = document.getElementById('modal-new-lead');
    const btnNewLead = document.getElementById('btn-new-lead'); 
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
        modalNewLead.addEventListener('click', (evento) => {
            if (evento.target === modalNewLead) {
                toggleLeadModal();
            }
        });
    }

    async function loadDashboardData() {
        try {
            const response = await fetch('http://localhost:8080/v1/dashboard.php');
            
            if (!response.ok) {
                throw new Error('Error en la comunicación con el servidor HTTP: ' + response.status);
            }

            const data = await response.json();

            if (data.status === 'success') {
                const kpis = data.data.kpis;
                const leads = data.data.leads;

                const kpiTotalLeads = document.getElementById('kpi-total-leads');
                const kpiVentas = document.getElementById('kpi-ventas-cerradas');
                const kpiIngresos = document.getElementById('kpi-ingresos');
                const kpiTasa = document.getElementById('kpi-tasa-cierre');

                if (kpiTotalLeads) kpiTotalLeads.textContent = kpis.total_leads;
                if (kpiVentas) kpiVentas.textContent = kpis.ventas_cerradas;
                if (kpiIngresos) kpiIngresos.textContent = '$' + Number(kpis.ingresos).toLocaleString();
                if (kpiTasa) kpiTasa.textContent = kpis.tasa_cierre + '%';

                const colProspeccion = document.getElementById('col-prospeccion');
                const colNegociacion = document.getElementById('col-negociacion');
                const colGanado = document.getElementById('col-ganado');
                
                const countProspeccion = document.getElementById('count-prospeccion');
                const countNegociacion = document.getElementById('count-negociacion');
                const countGanado = document.getElementById('count-ganado');

                if (!colProspeccion || !colNegociacion || !colGanado) return;

                colProspeccion.innerHTML = '';
                colNegociacion.innerHTML = '';
                colGanado.innerHTML = '';

                let cProspeccion = 0;
                let cNegociacion = 0;
                let cGanado = 0;

                leads.forEach((lead) => {
                    let badgeClass = '';
                    let badgeText = '';
                    let opacityClass = '';
                    let svgIcon = '';
                    let dateText = lead.fecha_contacto ? new Date(lead.fecha_contacto).toLocaleDateString() : 'Desconocida';

                    if (lead.estado === 'Cerrado/Ganado') {
                        badgeClass = 'bg-green-100 text-green-700';
                        badgeText = 'Ganado';
                        opacityClass = 'opacity-80';
                        svgIcon = `<svg class="w-3.5 h-3.5 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
                        dateText = 'Cerrado el: ' + dateText;
                    } else {
                        if (lead.prioridad === 'Alta') {
                            badgeClass = 'bg-red-100 text-red-600';
                        } else if (lead.prioridad === 'Media') {
                            badgeClass = 'bg-yellow-100 text-yellow-700';
                        } else {
                            badgeClass = 'bg-blue-100 text-blue-600';
                        }
                        
                        badgeText = lead.prioridad || 'N/A';
                        opacityClass = '';
                        svgIcon = `<svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
                        dateText = 'Contacto: ' + dateText;
                    }

                    const empresaNombre = lead.empresa || 'Sin Empresa';
                    const montoFormateado = '$' + Number(lead.monto || 0).toLocaleString();

                    const cardHTML = `
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md cursor-pointer transition-shadow group ${opacityClass}">
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="font-bold text-slate-800 group-hover:text-brand transition-colors">${empresaNombre}</h4>
                            <span class="${badgeClass} text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">${badgeText}</span>
                        </div>
                        <p class="text-xl font-bold text-slate-900 mb-2">${montoFormateado}</p>
                        <div class="flex items-center text-xs text-slate-500">
                            ${svgIcon}
                            ${dateText}
                        </div>
                    </div>`;

                    if (lead.estado === 'Prospección') {
                        colProspeccion.innerHTML += cardHTML;
                        cProspeccion++;
                    } else if (lead.estado === 'Negociación') {
                        colNegociacion.innerHTML += cardHTML;
                        cNegociacion++;
                    } else if (lead.estado === 'Cerrado/Ganado') {
                        colGanado.innerHTML += cardHTML;
                        cGanado++;
                    }
                });

                if (countProspeccion) countProspeccion.textContent = cProspeccion;
                if (countNegociacion) countNegociacion.textContent = cNegociacion;
                if (countGanado) countGanado.textContent = cGanado;

            } else {
                throw new Error(data.message || 'Error desconocido reportado por el backend');
            }

        } catch (error) {
            console.error('Error al cargar el dashboard:', error);
        }
    }

    loadDashboardData();

    const formNewLead = document.getElementById('form-new-lead');
    
    if (formNewLead) {
        formNewLead.addEventListener('submit', async (evento) => {
            evento.preventDefault();

            const empresa = document.getElementById('lead_empresa').value.trim();
            const monto = document.getElementById('lead_monto').value.trim();
            const prioridad = document.getElementById('lead_prioridad').value;

            const sqlRegex = /('|"|;|--|\/\*|\*\/|\b(SELECT|UNION|INSERT|DELETE|UPDATE|DROP|ALTER|EXEC)\b)/i;
            if (sqlRegex.test(empresa) || sqlRegex.test(monto)) {
                alert('Se han detectado caracteres inválidos.');
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/v1/create-lead.php', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ 
                        empresa: empresa, 
                        monto: monto, 
                        prioridad: prioridad 
                    })
                });

                if (!response.ok) {
                    throw new Error('Error en la comunicación con el servidor HTTP: ' + response.status);
                }

                const data = await response.json();

                if (data.status === 'success') {
                    toggleLeadModal();
                    formNewLead.reset();
                    loadDashboardData(); 
                } else {
                    throw new Error(data.message || 'Error al guardar el lead');
                }

            } catch (error) {
                console.error('Error al guardar lead:', error);
                alert('Ocurrió un error: ' + error.message);
            }
        });
    }
});
