document.addEventListener("DOMContentLoaded", () => {

    // Limpa seleções ao iniciar
    localStorage.removeItem("veiculo_nome");
    localStorage.removeItem("veiculo_preco");
    localStorage.removeItem("servico");
    localStorage.removeItem("servico_selecionado");

    localStorage.removeItem("extra_nome");
    localStorage.removeItem("higienizacao_nome");

    localStorage.removeItem("servicos_estofado");
    localStorage.removeItem("estofado_nome");
    localStorage.removeItem("estofado_preco");

    localStorage.setItem("total", "0");

    const cards = document.querySelectorAll(".card[data-type]");
    const totalEl = document.getElementById("total");
    const containerAgendamento = document.getElementById("container-agendamento");
    const btnIrAgendamento = document.getElementById("btn-ir-agendamento");

    let servicosBanco = [];
    let qtdCadeiras = 1;
    let qtdAlmofadas = 1;

    // =========================
    // CARREGAR DADOS
    // =========================

    async function carregarDados() {
        try {
            const res = await fetch("/services");
            servicosBanco = await res.json();

        } catch (err) {

            console.error("Erro ao carregar banco, usando dados locais.");

            servicosBanco = [
                { name: "Sofá 2 lugares", type: "estofado", price: 150 },
                { name: "Sofá 3 lugares", type: "estofado", price: 180 },
                { name: "Colchão Solteiro", type: "estofado", price: 150 },
                { name: "Colchão Casal", type: "estofado", price: 200 }
            ];
        }
    }

    carregarDados();

    // =========================
    // NOVO - ADICIONAR SERVIÇO
    // =========================

    function adicionarServico(nome, preco) {

        let servicos =
            JSON.parse(localStorage.getItem("servicos_estofado")) || [];

        servicos.push({
            nome: nome,
            preco: preco
        });

        localStorage.setItem(
            "servicos_estofado",
            JSON.stringify(servicos)
        );

        atualizarTotal();
        verificarBotaoAgendamento();
    }

    // =========================
    // NOVO - ATUALIZAR TOTAL
    // =========================

    function atualizarTotal() {

        let servicos =
            JSON.parse(localStorage.getItem("servicos_estofado")) || [];

        let total = 0;

        servicos.forEach(servico => {
            total += servico.preco;
        });

        localStorage.setItem("total", total);

        if (totalEl) {
            totalEl.innerText =
                `TOTAL: R$ ${total.toFixed(2)}`;
        }
    }

    // =========================
    // BOTÃO AGENDAMENTO
    // =========================

    function verificarBotaoAgendamento() {

        const servicos =
            JSON.parse(localStorage.getItem("servicos_estofado")) || [];

        if (servicos.length > 0 && containerAgendamento) {

            containerAgendamento.style.display = "block";

        } else if (containerAgendamento) {

            containerAgendamento.style.display = "none";
        }
    }

    // =========================
    // RESUMO
    // =========================

    function preencherResumoEstofado() {

        const servicos =
            JSON.parse(localStorage.getItem("servicos_estofado")) || [];

        const total =
            localStorage.getItem("total") || "0";

        let html = "";

        servicos.forEach(servico => {

            html += `
                <div style="
                    display:flex;
                    justify-content:space-between;
                    padding:10px 0;
                    border-bottom:1px solid #eee;
                ">
                    <span>${servico.nome}</span>
                    <strong>R$ ${parseFloat(servico.preco).toFixed(2)}</strong>
                </div>
            `;
        });

        document.getElementById("resumo-tipo-estofado").innerHTML = html;

        document.getElementById("resumo-total-estofado").innerText =
            "R$ " + parseFloat(total).toFixed(2);
    }

    // =========================
    // IR AGENDAMENTO
    // =========================

    if (btnIrAgendamento) {

        btnIrAgendamento.onclick = () => {

            preencherResumoEstofado();

            cards.forEach(c => c.style.display = "none");

            if (containerAgendamento)
                containerAgendamento.style.display = "none";

            if (totalEl)
                totalEl.style.display = "none";

            document.getElementById("resumo-estofado").style.display = "block";
        };
    }

    // =========================
    // ISOLAR CARD
    // =========================

    function isolarCard(cardClicado) {

        cards.forEach(c => {

            if (c !== cardClicado)
                c.style.display = "none";
        });

        if (containerAgendamento)
            containerAgendamento.style.display = "none";
    }

    // =========================
    // RESTAURAR
    // =========================

    function restaurarCards() {

        cards.forEach(c => c.style.display = "flex");

        const dinamicos =
            document.querySelectorAll(".lista-dinamica");

        dinamicos.forEach(e => e.remove());

        verificarBotaoAgendamento();
    }

    // =========================
    // SWIPE
    // =========================

    let touchstartX = 0;

    document.addEventListener('touchstart', e => {

        touchstartX = e.changedTouches.screenX;
    });

    document.addEventListener('touchend', e => {

        if (e.changedTouches.screenX - touchstartX > 100) {

            const aberto =
                document.querySelector(".lista-dinamica");

            if (aberto) {

                restaurarCards();

            } else {

                window.location.href = "/";
            }
        }
    });

    // =========================
    // CARDS
    // =========================

    cards.forEach((card) => {

        card.addEventListener("click", () => {

            const tipo = card.dataset.type;

            isolarCard(card);

            if (tipo === "tapete") {
                toggleAvisoTapete(card);
            }

            else if (tipo === "sofa") {
                toggleListaSimples(card, "sofa");
            }

            else if (tipo === "colchao") {
                toggleListaSimples(card, "colchao");
            }

            else if (tipo === "cadeira") {
                toggleQuantidade(card, "cadeira");
            }

            else if (tipo === "almofada") {
                toggleQuantidade(card, "almofada");
            }
        });
    });

    // =========================
    // AVISO TAPETE
    // =========================

    function toggleAvisoTapete(cardPrincipal) {

        const container = document.createElement("div");

        container.className = "lista-dinamica";

        container.style.cssText =
            "display:flex;flex-direction:column;align-items:center;gap:15px;padding:30px;background:white;border-radius:20px;margin-top:15px;width:100%;text-align:center;";

        cardPrincipal.after(container);

        container.innerHTML = `
            <div style="font-size:40px;">⏳</div>

            <p style="font-weight:500;color:#475569;">
                O serviço de <strong>Tapetes</strong>
                estará disponível em breve.
            </p>

            <button id="btn-v"
                style="
                    width:100%;
                    background:#2563eb;
                    color:white;
                    border:none;
                    padding:14px;
                    border-radius:12px;
                    font-weight:bold;
                    cursor:pointer;
                ">
                Voltar
            </button>
        `;

        container.querySelector('#btn-v').onclick =
            restaurarCards;
    }

    // =========================
    // LISTA SIMPLES
    // =========================

    function toggleListaSimples(cardPrincipal, tipoBuscado) {

        const container = document.createElement("div");

        container.className = "lista-dinamica";

        container.style.cssText =
            "display:flex;flex-direction:column;gap:10px;width:100%;margin-top:10px;";

        cardPrincipal.after(container);

        const servicos = servicosBanco.filter(s => {

            const nome = s.name.toLowerCase();

            if (tipoBuscado === "sofa") {

                return s.type === "estofado" &&
                    (nome.includes("sofá") || nome.includes("poltrona"));
            }

            if (tipoBuscado === "colchao") {

                return s.type === "estofado" &&
                    nome.includes("colchão");
            }

            return false;
        });

        container.innerHTML = `
            <div
                style="
                    color:red;
                    cursor:pointer;
                    font-weight:bold;
                    padding:10px;
                "
                id="fechar-l"
            >
                ✕ Voltar
            </div>
        `;

        container.querySelector('#fechar-l').onclick =
            restaurarCards;

        if (servicos.length === 0) {

            container.innerHTML += `
                <p style='padding:15px;color:#666;'>
                    Nenhuma opção disponível.
                </p>
            `;
        }

        servicos.forEach(s => {

            const item = document.createElement("div");

            item.className = "card";

            item.style.background = "#fff";

            item.innerHTML = `
                <span>${s.name}</span>
                <strong>R$ ${s.price.toFixed(2)}</strong>
            `;

            item.onclick = (e) => {

                e.stopPropagation();

                adicionarServico(s.name, s.price);

                restaurarCards();
            };

            container.appendChild(item);
        });
    }

    // =========================
    // QUANTIDADE
    // =========================

    function toggleQuantidade(cardPrincipal, tipo) {

        const container = document.createElement("div");

        container.className = "lista-dinamica";

        container.style.cssText =
            "display:flex;flex-direction:column;align-items:center;gap:15px;padding:20px;background:white;border-radius:15px;margin-top:10px;width:100%;";

        cardPrincipal.after(container);

        function renderSeletor() {

            const servicoBase =
                servicosBanco.find(s =>
                    s.name.toLowerCase().includes(tipo)
                ) || {
                    price: tipo === "cadeira" ? 40 : 20
                };

            let quantidade =
                (tipo === "cadeira")
                    ? qtdCadeiras
                    : qtdAlmofadas;

            let valorBase =
                quantidade * servicoBase.price;

            let precoFinal = valorBase;

            const temDesconto =
                (tipo === "cadeira" && quantidade >= 6);

            if (temDesconto) {
                precoFinal = valorBase * 0.9;
            }

            container.innerHTML = `
                <div
                    style="
                        width:100%;
                        color:red;
                        cursor:pointer;
                        font-weight:bold;
                    "
                    id="fechar-q"
                >
                    ✕ Voltar
                </div>

                <span style="font-weight:600;">
                    Quantidade de ${tipo === "cadeira"
                        ? "Cadeiras"
                        : "Almofadas"}
                </span>

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:25px;
                    "
                >
                    <button id="btn-menos"
                        style="
                            width:40px;
                            height:40px;
                            border-radius:10px;
                            border:1px solid #ddd;
                            background:#fff;
                            font-size:20px;
                        "
                    >
                        -
                    </button>

                    <span
                        style="
                            font-size:24px;
                            font-weight:bold;
                            color:#2563eb;
                        "
                    >
                        ${quantidade}
                    </span>

                    <button id="btn-mais"
                        style="
                            width:40px;
                            height:40px;
                            border-radius:10px;
                            border:1px solid #ddd;
                            background:#fff;
                            font-size:20px;
                        "
                    >
                        +
                    </button>
                </div>

                ${temDesconto
                    ? `
                        <div
                            style="
                                color:green;
                                font-weight:bold;
                                font-size:13px;
                            "
                        >
                            ✅ Desconto 10% aplicado!
                        </div>
                    `
                    : ''
                }

                <button
                    id="btn-confirmar-q"
                    style="
                        width:100%;
                        background:#2563eb;
                        color:white;
                        padding:15px;
                        border-radius:12px;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    Confirmar R$ ${precoFinal.toFixed(2)}
                </button>
            `;

            container.querySelector('#fechar-q').onclick =
                restaurarCards;

            container.querySelector('#btn-mais').onclick = () => {

                if (tipo === "cadeira") {
                    qtdCadeiras++;
                } else {
                    qtdAlmofadas++;
                }

                renderSeletor();
            };

            container.querySelector('#btn-menos').onclick = () => {

                if (tipo === "cadeira" && qtdCadeiras > 1) {
                    qtdCadeiras--;
                }

                else if (tipo === "almofada" && qtdAlmofadas > 1) {
                    qtdAlmofadas--;
                }

                renderSeletor();
            };

            container.querySelector('#btn-confirmar-q').onclick = () => {

                adicionarServico(
                    `${quantidade}x ${tipo === "cadeira"
                        ? "Cadeira"
                        : "Almofada"}`,
                    precoFinal
                );

                restaurarCards();
            };
        }

        renderSeletor();
    }

    // =========================
    // FECHAR RESUMO
    // =========================

    const fecharResumo =
        document.getElementById("fechar-resumo-estofado");

    if (fecharResumo) {

        fecharResumo.onclick = () => {

            document.getElementById("resumo-estofado").style.display = "none";

            restaurarCards();

            if (totalEl)
                totalEl.style.display = "flex";

            verificarBotaoAgendamento();
        };
    }

    // =========================
    // CONFIRMAR
    // =========================

    const btnConfirmar =
        document.getElementById("btn-confirmar-estofado");

    if (btnConfirmar) {

        btnConfirmar.onclick = () => {

            window.location.href = "/confirmar";
        };
    }

});