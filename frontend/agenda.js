
let idSelecionado = null;

async function renderizar() {
    const lista = document.getElementById("lista");
    const mesSelecionado = document.getElementById("mes").value

    try {
        const res = await fetch("http://127.0.0.1:8000/appointments/admin/agendamentos", {
            headers: {
                "x-admin": "1234"
            }
        });

        const agendamentos = await res.json();

        console.log(agendamentos);


        const hoje = new Date();

        const filtrados = agendamentos.filter(item => {

            const dataAgendamento = new Date(item.scheduled_date);

            // mês selecionado no select
            const mesAgendamento = dataAgendamento.getMonth() + 1;

            // remove datas passadas
            const futuro = dataAgendamento >= hoje;

            // se não selecionou mês → não mostra nada
            if (!mesSelecionado) {
                return false;
            }

            // filtra mês + somente futuros
            return mesAgendamento == mesSelecionado && futuro;
        });
        
        lista.innerHTML = "";

        if (filtrados.length === 0) {
            lista.innerHTML = "<p>Nenhum agendamento encontrado</p>";
            return;
        }

        filtrados.forEach(item => {

            const data = new Date(item.scheduled_date);

            const horario = data.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            });

            lista.innerHTML += `
                <div class="card">

                    <div class="info">

                        <strong>
                            ${item.name || "Cliente"}
                        </strong>

                        <span>
                            ${item.service_name || "Serviço"}
                        </span>

                        <span>
                            Horário: ${horario}
                        </span>

                    </div>

                    <button 
                        class="btn-x"
                        onclick="abrirModal(${item.id})"
                    >
                        ✕
                    </button>

                </div>
            `;
    });

    } catch (erro) {
        console.error(erro);
        lista.innerHTML = "<p>Erro ao carregar</p>";
    }
}

function abrirModal(id) {
    idSelecionado = id;
    document.getElementById("modal").style.display = "flex";
}

function fecharModal() {
    document.getElementById("modal").style.display = "none";
}

async function confirmarExclusao() {

    try {

        const res = await fetch(
            `http://127.0.0.1:8000/appointments/admin/agendamentos/${idSelecionado}`,
            {
                method: "DELETE",
                headers: {
                    "x-admin": "1234"
                }
            }
        );

        if(!res.ok){
            throw new Error("Erro ao excluir");
        }

        fecharModal();

        renderizar();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao excluir agendamento");
    }
}

function formatarData(data) {
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR") + " " +
           d.toLocaleTimeString("pt-BR", {
               hour: "2-digit",
               minute: "2-digit"
           });
}