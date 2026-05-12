// 🔥 LÓGICA DE LOGIN (Para a tela admin.html)
const btnEntrar = document.getElementById("btn-entrar");

if (btnEntrar) {
    btnEntrar.onclick = async () => {
        const senha = document.getElementById("senha").value;

        // Corrigido para o endereço completo do seu servidor
        const res = await fetch("http://127.0.0.1:8000/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senha })
        });
        
        if (res.ok) {
            localStorage.setItem("admin_logado", "true");
            window.location.href = "/admin/home";

        } else {
           document.getElementById("erro-login").innerText = "Senha incorreta";
        }
    };
}

// 🔥 NAVEGAÇÃO PARA AS NOVAS TELAS
// Agora cada botão redireciona para uma URL exclusiva no backend

function irParaFinanceiro() {
    window.location.href = "/admin/financeiro";
}

function irParaAgenda() {
    window.location.href = "/admin/agenda";
}

function irParaCancelamentos() {
    window.location.href = "/admin/cancelamentos";
}

// 🔥 FORMATAR DATA (Pode ser usada nas outras telas importando este JS)
function formatarData(data) {
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR") + " " +
           d.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
}
