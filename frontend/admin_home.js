// 🔐 PROTEÇÃO (impede acesso direto)
if (localStorage.getItem("admin_logado") !== "true") {
    window.location.href = "/admin";
}

// 🚀 NAVEGAÇÃO
function irParaFinanceiro() {
    window.location.href = "/admin/financeiro";
}

function irParaAgenda() {
    window.location.href = "/admin/agenda";
}

// 🚪 LOGOUT
function logout() {
    localStorage.removeItem("admin_logado");
    window.location.href = "/admin";
}