document.addEventListener('DOMContentLoaded', () => {

    const dataInput = document.getElementById('data');
    const horaSelect = document.getElementById('horario');
    const nome = document.getElementById('nome');
    const telefone = document.getElementById('celular');
    const endereco = document.getElementById('endereco');
    const resumoTotal = document.getElementById('resumoTotal');
    const msgDiv = document.getElementById('msg');
    const btnConfirmar = document.getElementById('confirmar');

    // =========================
    // DADOS LOCALSTORAGE
    // =========================
    const servico =
        localStorage.getItem('servico') ||
        localStorage.getItem('veiculo_nome') ||
        localStorage.getItem('estofado_nome') ||
        "servico";

    const total = localStorage.getItem('total') || "0";

    const service_id =
        localStorage.getItem('service_id') || 1;

    // =========================
    // TOTAL
    // =========================
    if (resumoTotal) {
        resumoTotal.textContent = `R$ ${total}`;
    }

    // =========================
    // SERVIÇO NA SEDE
    // =========================
    const isPremiumOuIntermediario =
        service_id == 2 || service_id == 3;

    if (endereco) {

        if (isPremiumOuIntermediario) {

            endereco.placeholder =
                "Endereço será enviado pelo WhatsApp";

        } else {

            endereco.placeholder =
                "Digite seu endereço";
        }
    }

    // =========================
    // BLOQUEIA DATAS PASSADAS
    // =========================
    if (dataInput) {

        const hoje =
            new Date().toISOString().split("T")[0];

        dataInput.setAttribute("min", hoje);
    }

    // =========================
    // AVISOS
    // =========================
    function mostrarAviso(msg, bg, color) {

        if (!msgDiv) return;

        msgDiv.innerHTML = `
            <div style="
                background:${bg};
                color:${color};
                padding:12px 15px;
                border-radius:10px;
                font-weight:600;
                margin-bottom:10px;
                text-align:center;
            ">
                ${msg}
            </div>
        `;

        setTimeout(() => {
            msgDiv.innerHTML = "";
        }, 4000);
    }

    // =========================
    // BUSCA HORÁRIOS
    // =========================
    if (dataInput && horaSelect) {

        dataInput.addEventListener('change', async () => {

            const dataVal = dataInput.value;

            if (!dataVal) return;

            const partes = dataVal.split("-");

            const dataObj = new Date(
                partes[0],
                partes[1] - 1,
                partes[2]
            );

            const diaSemana = dataObj.getDay();

            // DOMINGO
            if (diaSemana === 0) {

                horaSelect.innerHTML =
                    '<option>Domingo indisponível</option>';

                return;
            }

            // PREMIUM SÓ SÁBADO
            if (isPremiumOuIntermediario && diaSemana !== 6) {

                mostrarAviso(
                    "⚠️ Apenas aos sábados",
                    "#fef3c7",
                    "#92400e"
                );

                dataInput.value = "";

                horaSelect.innerHTML =
                    '<option>Escolha sábado</option>';

                return;
            }

            horaSelect.innerHTML =
                '<option>Carregando...</option>';

            try {

                const url =
                    "/appointments/available?date=" +
                    dataVal +
                    "&service=" +
                    encodeURIComponent(servico);

                const response = await fetch(url);

                const result = await response.json();

                const disponiveis =
                    result.disponiveis;

                horaSelect.innerHTML =
                    '<option value="">Selecione horário</option>';

                if (
                    disponiveis &&
                    disponiveis.length > 0
                ) {

                    disponiveis.forEach(hora => {

                        const opt =
                            document.createElement("option");

                        opt.value = hora;
                        opt.textContent = hora;

                        horaSelect.appendChild(opt);
                    });

                } else {

                    horaSelect.innerHTML =
                        '<option>Sem horários</option>';
                }

            } catch (error) {

                console.error(
                    "Erro horários:",
                    error
                );

                horaSelect.innerHTML =
                    '<option>Erro ao carregar</option>';
            }
        });
    }

    // =========================
    // CONFIRMAR AGENDAMENTO
    // =========================
    if (btnConfirmar) {

        btnConfirmar.addEventListener('click', async () => {

            if (
                !nome.value ||
                !telefone.value ||
                !endereco.value ||
                !dataInput.value ||
                !horaSelect.value
            ) {

                mostrarAviso(
                    "⚠️ Preencha todos os campos",
                    "#fee2e2",
                    "#b91c1c"
                );

                return;
            }

            // =========================
            // TELEFONE
            // =========================
            let cleanPhone =
                telefone.value.replace(/\D/g, "");

            if (!cleanPhone.startsWith("55")) {
                cleanPhone = "55" + cleanPhone;
            }

            // =========================
            // PREÇO
            // =========================
            const precoLimpo = parseFloat(
                total
                    .toString()
                    .replace("R$", "")
                    .replace(".", "")
                    .replace(",", ".")
                    .trim()
            );

            // =========================
            // PAYLOAD
            // =========================
            const payload = {

                name: nome.value,

                phone: `+${cleanPhone}`,

                address: isPremiumOuIntermediario
                    ? "Campo Vicente, Bellmont, N: 1414"
                    : endereco.value,

                city: "Nova Hartz",

                service_name: servico,

                service_id: parseInt(service_id),

                quantity: 1,

                valor_total: precoLimpo,

                scheduled_date:
                    `${dataInput.value}T${horaSelect.value}:00`
            };

            try {

                const response = await fetch(
                    "/appointments/",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify(payload)
                    }
                );

                // =========================
                // SUCESSO
                // =========================
                if (response.ok) {

                    console.log(localStorage);

                    const veiculo =
                        localStorage.getItem("veiculo_nome");

                    const estofado =
                         JSON.parse(localStorage.getItem("servicos_estofado")) || [];

                    const servicoPrincipal =
                        localStorage.getItem("servico_selecionado") ||
                        localStorage.getItem("servico");

                    const extra =
                        localStorage.getItem("extra_nome");

                    const higienizacao =
                        localStorage.getItem("higienizacao_nome");

                    let detalhesServico = "";

                    // =========================
                    // FLUXO VEÍCULO
                    // =========================
                    if (veiculo) {

                        detalhesServico +=
                            `🚗 *Veículo:* ${veiculo}\n\n`;

                        if (servicoPrincipal) {

                            detalhesServico +=
                                `🛠️ *Serviço:* ${servicoPrincipal}\n\n`;
                        }

                        if (extra) {

                            detalhesServico +=
                                `✨ *Extras:* ${extra}\n\n`;
                        }

                        if (higienizacao) {

                            detalhesServico +=
                                `🧼 *Higienização:* ${higienizacao}\n\n`;
                        }
                    }

                    // FLUXO ESTOFADO
                    // =========================
                    if (estofado.length > 0) {

                        detalhesServico += `🛋️ *Estofados:*\n\n`;

                        estofado.forEach(item => {

                            detalhesServico +=
                                `• ${item.nome} - R$ ${parseFloat(item.preco).toFixed(2)}\n`;
                        });

                        detalhesServico += `\n`;
                    }
                    // =========================
                    // MENSAGEM WHATS
                    // =========================
                    const msgZap =
`✅ *Novo Agendamento RF Clean*

👤 *Cliente:* ${nome.value}

📅 *Data:* ${dataInput.value}

⏰ *Hora:* ${horaSelect.value}

${detalhesServico}

📍 *Endereço:* ${
    isPremiumOuIntermediario
    ? "Campo Vicente, Bellmont, N: 1414"
    : endereco.value
}

💰 *Total:* R$ ${total}`;

                    // =========================
                    // LINK WHATS
                    // =========================
                    const zapUrl =
                        `https://wa.me/555197810660?text=${encodeURIComponent(msgZap)}`;

                    mostrarAviso(
                        "✔️ Agendamento feito com sucesso!",
                        "#dcfce7",
                        "#166534"
                    );

                    setTimeout(() => {

                        window.open(
                            zapUrl,
                            "_blank"
                        );

                        window.location.href = "/";

                    }, 1500);

                } else {

                    const errorData =
                        await response.json();

                    mostrarAviso(
                        `❌ ${errorData.detail || "Erro ao agendar"}`,
                        "#fee2e2",
                        "#b91c1c"
                    );
                }

            } catch (err) {

                console.error(
                    "Erro no envio:",
                    err
                );

                mostrarAviso(
                    "❌ Erro de conexão com o servidor",
                    "#fee2e2",
                    "#b91c1c"
                );
            }
        });
    }

    // =========================
    // MÁSCARA TELEFONE
    // =========================
    if (telefone) {

        telefone.addEventListener('input', (e) => {

            let v =
                e.target.value.replace(/\D/g, "");

            if (v.length > 11) {
                v = v.slice(0, 11);
            }

            v = v.replace(
                /^(\d{2})(\d)/,
                "($1) $2"
            );

            v = v.replace(
                /(\d{5})(\d)/,
                "$1-$2"
            );

            e.target.value = v;
        });
    }
});

// =========================
// VOLTAR
// =========================
function voltar() {
    window.history.back();
}