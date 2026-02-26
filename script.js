// Variáveis Globais
let sessions = JSON.parse(localStorage.getItem('studySessions')) || [];
//Busca o nome salvo
let userName = localStorage.getItem('studyUserName');
let subjectChartInstance = null;
let evolutionChartInstance = null;

// Inicialização
document.getElementById('date').valueAsDate = new Date();
// Verifica se existe usuário salvo
checkUser();
// Atualiza interface e gráficos
updateUI();

// Gerenciamento de Usuário
function checkUser() {
    if (!userName) {
        document.getElementById('nameConfig').classList.remove('hidden');
    } else {
        document.getElementById('userNameDisplay').innerText = userName;
    }
}

function saveName() {
    const nameInput = document.getElementById('nameInput').value;
    if (nameInput) {
        userName = nameInput;
        localStorage.setItem('studyUserName', userName);
        document.getElementById('nameConfig').classList.add('hidden');
        document.getElementById('userNameDisplay').innerText = userName;
    }
}

// 2. Adicionar Sessão
function addSession(e) {
    // Impede o formulário de recarregar a página.
    e.preventDefault();
    
    const subject = document.getElementById('subject').value;
    const hours = parseFloat(document.getElementById('hours').value);
    const date = document.getElementById('date').value;

    // Gera ID único baseado em timestamp.
    const newSession = { id: Date.now(), subject, hours, date };
    
    sessions.push(newSession);
    saveData();
    updateUI();
    
    alert(`Boa! +${hours} horas de ${subject} adicionadas!`);
    document.getElementById('subject').value = '';
    document.getElementById('hours').value = '';
}

// Salvar e Ler Dados
// Converte array em string e Salva no navegador
function saveData() {
    localStorage.setItem('studySessions', JSON.stringify(sessions));
}

function clearData() {
    if(confirm("Tem certeza que quer apagar todo seu progresso?")) {
        localStorage.removeItem('studySessions');
        sessions = [];
        updateUI();
    }
}

// 4. Atualizar Interface e Gráficos
function updateUI() {
    const total = sessions.reduce((acc, curr) => acc + curr.hours, 0);
    document.getElementById('totalHoursDisplay').innerText = total.toFixed(1) + "h";

    const list = document.getElementById('historyList');
    list.innerHTML = '';
    
    // Injetando o HTML usando as nossas novas classes do CSS puro
    sessions.slice().reverse().slice(0, 5).forEach(s => {
        list.innerHTML += `<li class="history-item">
            <span><strong>${s.subject}</strong> <small>(${s.date})</small></span>
            <span class="badge-hours">${s.hours}h</span>
        </li>`;
    });

    renderCharts();
}

// 5. Gráficos (Chart.js)
function renderCharts() {
    // AQUI ESTÁ A MUDANÇA: O JS agora lê o CSS
    const estilosGlobais = getComputedStyle(document.documentElement);
    
    // Pegando as variáveis do CSS (com uma cor de segurança caso o CSS demore a carregar)
    const coresRosca = [
        estilosGlobais.getPropertyValue('--cor-1').trim() || '#4F46E5',
        estilosGlobais.getPropertyValue('--cor-2').trim() || '#10B981',
        estilosGlobais.getPropertyValue('--cor-3').trim() || '#F59E0B',
        estilosGlobais.getPropertyValue('--cor-4').trim() || '#EF4444',
        estilosGlobais.getPropertyValue('--cor-5').trim() || '#8B5CF6',
        estilosGlobais.getPropertyValue('--cor-6').trim() || '#EC4899'
    ];
    const corBarras = estilosGlobais.getPropertyValue('--cor-barras').trim() || '#6366F1';

    // Processamento de Dados
    const subjectMap = {};
    sessions.forEach(s => { subjectMap[s.subject] = (subjectMap[s.subject] || 0) + s.hours; });

    const dateMap = {};
    const sortedSessions = sessions.sort((a,b) => new Date(a.date) - new Date(b.date));
    sortedSessions.forEach(s => { dateMap[s.date] = (dateMap[s.date] || 0) + s.hours; });

    // Renderizando o Gráfico de Rosca
    const ctxSubject = document.getElementById('subjectChart').getContext('2d');
    if (subjectChartInstance) subjectChartInstance.destroy();
    subjectChartInstance = new Chart(ctxSubject, {
        type: 'doughnut',
        data: {
            labels: Object.keys(subjectMap),
            datasets: [{
                data: Object.values(subjectMap),
                backgroundColor: coresRosca, // Usando as cores do CSS aqui
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Renderizando o Gráfico de Barras
    const ctxEvo = document.getElementById('evolutionChart').getContext('2d');
    if (evolutionChartInstance) evolutionChartInstance.destroy();
    evolutionChartInstance = new Chart(ctxEvo, {
        type: 'bar',
        data: {
            labels: Object.keys(dateMap),
            datasets: [{
                label: 'Horas Estudadas',
                data: Object.values(dateMap),
                backgroundColor: corBarras, // Usando a cor do CSS aqui
                borderRadius: 5
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}