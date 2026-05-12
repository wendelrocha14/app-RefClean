console.log("JS carregou");
if (localStorage.getItem("admin_logado") !== "true") {
    window.location.href = "/admin";
}

async function atualizarValor() {

    try {
        const mes = document.getElementById("mes").value;

        const res = await fetch(`http://127.0.0.1:8000/appointments/admin/financeiro?mes=${mes}`, {
            headers: {
                "x-admin": "1234"
            }
        });

        if (!res.ok) {
            throw new Error("Erro ao buscar dados");
        }

        const dados = await res.json();

        const valor = Number(dados.total_mes || 0);

        document.getElementById("valor").innerText =
            valor.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

    } catch (erro) {
        console.error(erro);
        document.getElementById("valor").innerText = "Erro ao carregar";
    }
}
document.addEventListener("DOMContentLoaded", () => {
    atualizarValor();
});

function voltarAdmin() {
    window.location.href = "/admin/home";
}

async function carregarGrafico() {

    const meses = [1,2,3,4,5,6,7,8,9,10,11,12];
    const valores = [];

    for (let mes of meses) {
        try {
            const res = await fetch(`http://127.0.0.1:8000/appointments/admin/financeiro?mes=${mes}`, {
                headers: {
                    "x-admin": "1234"
                }
            });

            const dados = await res.json();
            valores.push(dados.total_mes || 0);

        } catch {
            valores.push(0);
        }
    }

    const ctx = document.getElementById("graficoFinanceiro");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: [
                "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                "Jul", "Ago", "Set", "Out", "Nov", "Dez"
            ],
            datasets: [{
                label: "Faturamento mensal",
                data: valores,
                borderWidth: 3,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    atualizarValor();
    carregarGrafico();
});