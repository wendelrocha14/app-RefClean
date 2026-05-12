document.addEventListener("DOMContentLoaded", () => {
    // Limpa seleções anteriores
     const precosPacotes = {
                "Pacote Intermediário": {
                    "Hatch": 450,
                    "Sedan": 470,
                    "SUV": 500,
                    "4x4": 550
                },
                "Pacote Premium": {
                    "Hatch": 600,
                    "Sedan": 650,
                    "SUV": 700,
                    "4x4": 750
                } 
            };
    localStorage.removeItem("veiculo_nome");
    localStorage.removeItem("veiculo_preco");
    localStorage.removeItem("servico_selecionado");

    localStorage.removeItem("servicos_estofado");
    localStorage.removeItem("estofado_nome");
    localStorage.removeItem("estofado_preco");

    localStorage.setItem("total", "0");

    const cards = document.querySelectorAll(".card[data-type]");
    const listaVeiculos = document.getElementById("lista-veiculos");
    const listaMotos = document.getElementById("lista-motos");
    const listaExtras = document.getElementById("lista-extras");
    const totalEl = document.getElementById("total");

    const containerAgendamento = document.getElementById("container-agendamento");
    const btnIrAgendamento = document.getElementById("btn-ir-agendamento");
    const btnConfirmarHorario = document.getElementById("btn-confirmar-horario")

    const btnHigLocalizada = document.getElementById("btn-higienizacao-localizada");
    const opcoesHig = document.getElementById("opcoes-higienizacao");

    function verificarBotaoAgendamento() {
        const veiculo = localStorage.getItem("veiculo_nome");
        const servico = localStorage.getItem("servico_selecionado");
        if (veiculo && servico && containerAgendamento) {
            containerAgendamento.style.display = "block";
        } else if (containerAgendamento) {
            containerAgendamento.style.display = "none";
        }
    }

    const resumoCard = document.getElementById("resumo-servico");
    const fecharResumo = document.getElementById("fechar-resumo");

    function preencherResumo() {
        const veiculo = localStorage.getItem("veiculo_nome") || "-";
        const servicos = localStorage.getItem("servico_selecionado") || "";
        const total = localStorage.getItem("total") || "0";

        let principal = "-";
        let extras = [];
        let higienizacao = [];

        // Filtra a lista removendo espaços e itens vazios
        const lista = servicos.split(",").map(s => s.trim()).filter(s => s !== "");

        const isMoto = veiculo.toLowerCase().includes("moto");

        lista.forEach(item => {
            if (isMoto) {
                principal = item;
                return;
            }

            // --- AJUSTE AQUI ---
            // Agora reconhece "Detalhada" como Serviço Principal
            const itemLower = item.toLowerCase();
            
            if (itemLower.includes("pacote") || 
                itemLower.includes("lavagem") || 
                itemLower.includes("detalhada")) { 
                principal = item;
            } 
            else if (itemLower.includes("higienização") || itemLower.includes("higienizacao")) {
                higienizacao.push(item);
            } 
            else {
                extras.push(item);
            }
        });

        // Atualiza os textos no HTML
        document.getElementById("resumo-veiculo").innerText = "Veículo: " + veiculo;
        document.getElementById("resumo-servico-tipo").innerText = "Serviço: " + principal;

        if (isMoto) {
            document.getElementById("resumo-extras").innerText = "Extras: -";
            document.getElementById("resumo-higienizacao").innerText = "Higienização: -";
        } else {
            // Se não houver nada no array, mostra "-"
            document.getElementById("resumo-extras").innerText = 
                "Extras: " + (extras.length > 0 ? extras.join(", ") : "-");

            document.getElementById("resumo-higienizacao").innerText = 
                "Higienização: " + (higienizacao.length > 0 ? higienizacao.join(", ") : "-");
        }

        document.getElementById("resumo-total").innerText = "R$ " + parseFloat(total).toFixed(2);
    }

   if (btnIrAgendamento) {
        btnIrAgendamento.addEventListener("click", (e) => {
        e.stopPropagation();

        preencherResumo();

        // ESCONDE TUDO
        cards.forEach(c => c.style.display = "none");

        if (listaVeiculos) listaVeiculos.style.display = "none";
        if (listaMotos) listaMotos.style.display = "none";
        if (listaExtras) listaExtras.style.display = "none";
        if (containerAgendamento) containerAgendamento.style.display = "none";
        if (totalEl) totalEl.style.display = "none";

        // MOSTRA RESUMO
        if (resumoCard) {
            resumoCard.style.display = "block";
        }
    });
}
    
    fecharResumo.addEventListener("click", () => {
    resumoCard.style.display = "none";
    restaurarCards();
});

    function voltarPasso() {
        const servicosAbertos = document.getElementById("lista-servicos");
        const listaV = listaVeiculos.style.display === "flex";
        const listaM = listaMotos.style.display === "flex";
        const listaE = listaExtras.style.display === "flex";

        if (servicosAbertos || listaV || listaM || listaE) {
            restaurarCards();
        } else {
            window.location.href = "/";
        }
    }

    function restaurarCards() {
        cards.forEach(c => c.style.display = "flex");

        if (listaVeiculos) listaVeiculos.style.display = "none";
        if (listaMotos) listaMotos.style.display = "none";
        if (listaExtras) listaExtras.style.display = "none";

        // 🔥 RESET BRUTO DA HIGIENIZAÇÃO (GARANTE QUE SOME DA TELA)
        localStorage.removeItem("higienizacao_confirmada");

        const listasHig = [
            document.getElementById("opcoes-higienizacao"),
            document.getElementById("lista-higienizacao")
        ];

        listasHig.forEach(lista => {
            if (lista) {
                lista.style.display = "none";
                lista.innerHTML = "";
            }
        });

        // 🔥 REMOVE QUALQUER LISTA DINÂMICA (ESSA É A CHAVE PRO TEU BUG)
        document.querySelectorAll("#lista-servicos").forEach(el => el.remove());

        if (btnHigLocalizada) {
            btnHigLocalizada.style.display = "block";
            btnHigLocalizada.innerHTML = "Higienização Localizada";
            btnHigLocalizada.className = "card";
        }

        verificarBotaoAgendamento();

    // 🔥 GARANTE QUE VOLTA PRO TOPO (evita parecer que ainda tá aberto)
        window.scrollTo({ top: 0, behavior: "smooth" });
}
    function isolarCard(cardClicado) {
        cards.forEach(c => { if (c !== cardClicado) c.style.display = "none"; });
        if (containerAgendamento) containerAgendamento.style.display = "none";
        if (btnHigLocalizada) btnHigLocalizada.style.display = "none";
    }

    function mostrarAvisoNoCard(cardPai, mensagem, botaoTexto, callback) {
        let container = document.getElementById("lista-servicos");
        if (container) container.remove();
        container = document.createElement("div");
        container.id = "lista-servicos";
        container.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:15px; width:100%; padding:20px; text-align:center;";
        container.innerHTML = `
            <p style="color: #333; font-size: 14px; font-weight: 500;">${mensagem}</p>
            <button id="btn-fechar-aviso" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; width: 100%; font-weight: bold;">
                ✕ ${botaoTexto}
            </button>
        `;
        cardPai.insertAdjacentElement("afterend", container);
        document.getElementById("btn-fechar-aviso").onclick = (e) => {
            e.stopPropagation();
            if (callback) callback();
            else restaurarCards();
        };
    }

            cards.forEach((card) => {
                card.addEventListener("click", () => {
                    const tipo = card.dataset.type;
                    const veiculoSelecionado = localStorage.getItem("veiculo_nome");

                    // AJUSTE: Permite clicar em "Moto" mesmo sem veículo selecionado
                    if (tipo !== "moto" && (tipo === "servico" || tipo === "extra") && !veiculoSelecionado) {
                        isolarCard(card);
                        mostrarAvisoNoCard(card, "Selecione o tipo de veículo primeiro.", "Escolher veículo");
                        return;
                    }

                    isolarCard(card);
                    
                    if (tipo === "veiculo") {
                        carregarLista("vehicle", listaVeiculos);
                    } 
                    else if (tipo === "moto") {
                        // MUDANÇA AQUI: Já define como Moto e abre a lista
                        localStorage.setItem("veiculo_nome", "Moto");
                        carregarLista("moto", listaMotos);
                        verificarBotaoAgendamento();
                    } 
                    else if (tipo === "extra") {
                        listaExtras.style.display = "block";
                        carregarLista("extra", listaExtras);
                    }
                    else if (tipo === "servico") {
                        listaExtras.style.display = "block";
                        carregarLista("service_vehicle", listaExtras);
                }
            });
        });




    const btnHigManual = document.getElementById("card-higienizacao-localizada");
    const listaHigManual = document.getElementById("lista-higienizacao");

    if (btnHigManual) {
        btnHigManual.onclick = () => {
            const servicoAtual = localStorage.getItem("servico_selecionado") || "";
            const ehDetalhadaPro = servicoAtual.includes("Detalhada PRO");
            const veiculoSelecionado = localStorage.getItem("veiculo_nome");

            if (!veiculoSelecionado) {
                isolarCard(btnHigManual);
                mostrarAvisoNoCard(btnHigManual, "Selecione o tipo de veículo primeiro.", "Escolher veículo");
                return;
            }

            isolarCard(btnHigManual);

                if (!ehDetalhadaPro) {
                    // 🔥 Lógica do Aviso
                    let container = document.getElementById("lista-servicos");
                    if (container) container.remove();
                    
                    container = document.createElement("div");
                    container.id = "lista-servicos";
                    container.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:15px; width:100%; padding:20px; text-align:center;";
                    
                    container.innerHTML = `
                        <div id="fechar-so-este-aviso" style="color:red; cursor:pointer; font-weight:bold; align-self:flex-start;">✕ Fechar</div>
                        <p style="color: #333; font-size: 14px; font-weight: 500;">Este serviço não inclui lavagem detalhada, selecione Lavagem PRO ou deseja continuar?</p>
                        <button id="confirmar-so-este-aviso" style="background: #2563eb; color: white; border: none; padding: 15px; border-radius: 8px; cursor: pointer; width: 100%; font-weight: bold;">
                            Sim, continuar
                        </button>
                    `;

                    btnHigManual.insertAdjacentElement("afterend", container);

                    // Ação de fechar: Volta tudo ao normal
                    document.getElementById("fechar-so-este-aviso").onclick = () => restaurarCards();

                    // Ação de confirmar: LIMPA O AVISO e mostra a lista
                    document.getElementById("confirmar-so-este-aviso").onclick = () => {
                        // 1. Remove o aviso da tela para ele não "encavalar" com os serviços
                        container.remove(); 

                        localStorage.setItem("higienizacao_confirmada", "true");
                        
                        // 2. Abre a lista de serviços
                        listaHigManual.style.display = "flex";
                        carregarLista("higienizacao_localizada", listaHigManual);
                    };
                } else {
                    // Se já for Detalhada PRO, abre direto
                    listaHigManual.style.display = "flex";
                    carregarLista("higienizacao_localizada", listaHigManual);
                }

    };
}
    
    if (btnHigLocalizada) {
        btnHigLocalizada.onclick = (e) => {
            e.stopPropagation();
            btnHigLocalizada.style.display = "none";
            carregarLista("higienizacao_localizada", opcoesHig);
            opcoesHig.style.display = "block";
        };
    }

    async function carregarLista(filtroType, elementoLista) {
        elementoLista.style.display = "flex";
        elementoLista.style.flexDirection = "column";
        elementoLista.innerHTML = "<p style='padding:15px;'>Carregando...</p>";
        try {
            const res = await fetch("/services");
            const services = await res.json();
            const filtrados = services.filter(s => s.type === filtroType);
            elementoLista.innerHTML = "";
            const descricoes = {
                "Pacote Intermediário": [
                    "Lavagem externa detalhada",
                    "Remoção dos bancos (quando necessário)",
                    "Higienização profunda dos bancos",
                    "Limpeza de portas e porta-malas",
                    "Hidratação de plásticos internos"
                ],
                "Pacote Premium": [
                    "Lavagem técnica detalhada",
                    "Desmontagem técnica para higienização completa",
                    "Higienização profunda dos bancos",
                    "Higienização de teto",
                    "Limpeza detalhada de portas e porta-malas",
                    "Hidratação de plásticos internos",
                    "Revitalização de plásticos",
                    "Aplicação de cera",
                    "Remoção de manchas de chuva (vidros)",
                    "Higienização de carpete"
                ],
                "Detalhada PRO": [
                    "Lavagem detalhada",
                    "Aspiração completa",
                    "Pretinho",
                    "Perfume"
                ],
                "Higienização Localizada - 1 Banco": [
                    "Limpeza profunda do banco",
                    "Remoção de manchas",
                    "Secagem profissional"
                ],
                "Higienização Localizada - 2 Bancos": [
                    "Limpeza profunda dos bancos",
                    "Remoção de manchas",
                    "Secagem profissional"
                ],
                "Higienização Localizada - Completa": [
                    "Limpeza completa dos bancos",
                    "Remoção de manchas",
                    "Higienização geral"
                ]
            };
        
            const btnFechar = document.createElement("div");
            btnFechar.innerHTML = "✕ Fechar";
            btnFechar.style.cssText = "color:red; cursor:pointer; font-weight:bold; padding:10px; width:100%;";
            btnFechar.onclick = (e) => {
                e.stopPropagation();
                restaurarCards();
            };

            elementoLista.appendChild(btnFechar);

           filtrados.forEach(v => {
                const carroEscolhido = localStorage.getItem("veiculo_nome");
                
                // --- 1. AQUI ENTRA A REGRA (Lógica) ---
                let precoFinal = v.price;
                if (precosPacotes[v.name] && carroEscolhido) {
                    precoFinal = precosPacotes[v.name][carroEscolhido] || v.price;
                }
                // --------------------------------------

                const item = document.createElement("div");
                item.classList.add("card");

                item.innerHTML = `
                    <span>${v.name}</span>
                    <strong>R$ ${precoFinal.toFixed(2)}</strong> <!-- 2. MUDADO DE v.price PARA precoFinal -->
                `;

               item.onclick = (e) => {
                    e.stopPropagation();

                    // Se o serviço for do tipo higienização, a sua função assume o controle
                    if (v.type === "higienizacao_localizada") {
                        const interceptou = tratarHigienizacao(v);
                        if (interceptou) return; // Para a execução aqui se o aviso foi mostrado
                    }

                    if (filtroType === "moto") {

                        localStorage.setItem("servico_selecionado", v.name);

                        localStorage.setItem("total", v.price.toString());

                        if (totalEl) {
                            totalEl.innerText = `TOTAL: R$ ${v.price.toFixed(2)}`

                        }
                        verificarBotaoAgendamento();

                        restaurarCards();

                        return;
                    }

                    // Se não for higienização, segue a vida normal do código
                    if (descricoes[v.name]) {
                        mostrarDetalhe(v, descricoes[v.name], filtroType, item);
                    } else {
                        selecionarItem(v, filtroType);
                    }
};
            elementoLista.appendChild(item);
           });
                // 🔥 REMOVE O BOTÃO DE QUALQUER LUGAR ANTES
            if (btnHigLocalizada && btnHigLocalizada.parentNode) {
                btnHigLocalizada.parentNode.removeChild(btnHigLocalizada);
            }

            // 🔥 ADICIONA SOMENTE EM EXTRA
            if (btnHigLocalizada && filtroType === "extra") {
                btnHigLocalizada.style.cssText = "display: flex; justify-content: space-between; align-items: center; width: 100%; border: none; cursor: pointer; background: #fff;";
                btnHigLocalizada.innerHTML = `<span>Higienização Localizada</span><span style="font-size: 20px; color: #ccc;">›</span>`;
                
                elementoLista.appendChild(btnHigLocalizada);
                btnHigLocalizada.style.display = "flex";
            }

        } catch (err) { 
            elementoLista.innerHTML = "<p>Erro ao carregar.</p>"; 
        }
    }

        // 🔥 NOVA FUNÇÃO (COLAR AQUI)
    function tratarHigienizacao(v) {
        const servicoAtual = localStorage.getItem("servico_selecionado") || "";
        const ehDetalhadaPro = servicoAtual.includes("Detalhada PRO");
        
        const jaConfirmou = localStorage.getItem("higienizacao_confirmada") === "true";

        // 🔥 Só mostra aviso se NÃO for detalhada E ainda não confirmou
        if (!ehDetalhadaPro && !jaConfirmou) {

            mostrarAvisoNoCard(
                document.getElementById("card-extra"),
                "Esse serviço não inclui lavagem. Deseja continuar?",
                "Continuar",
                () => {

                    localStorage.setItem("higienizacao_confirmada", "true");
                    // salva confirmação
                    localStorage.setItem("total", v.price.toString());

                    localStorage.setItem("servico_selecionado", v.name);
                    
                    if (totalEl) {
                        totalEl.innerText = `TOTAL: R$ ${v.price.toFixed(2)}`;
                    }
                    restaurarCards();
                }
        );
        return true;

    }
     if (!ehDetalhadaPro && jaConfirmou) {
        localStorage.setItem("total", v.price.toString());
        localStorage.setItem("servico_selecionado", v.name);

        if (totalEl) {
            totalEl.innerText = `TOTAL: R$ ${v.price.toFixed(2)}`;
        }

        restaurarCards();
        return true;
    }

    // ✅ Se tiver PRO → segue fluxo normal
    return false;
}
    function selecionarItem(v, tipo) {
        let total = parseFloat(localStorage.getItem("total") || "0");
        let selecionados = localStorage.getItem("servico_selecionado") || "";

        if (tipo === "vehicle" || tipo === "moto") {
            localStorage.setItem("veiculo_nome", v.name);
            localStorage.setItem("veiculo_preco", v.price);
            total = v.price;
       } else {
    if (selecionados.includes(v.name)) return restaurarCards();

    const veiculoNome = localStorage.getItem("veiculo_nome");

    // 🔥 USA A TABELA PARA INTERMEDIÁRIO E PREMIUM
    if (precosPacotes[v.name] && precosPacotes[v.name][veiculoNome]) {
        total = precosPacotes[v.name][veiculoNome];
    } else {
        // 🔥 resto continua igual
        total += v.price;
    }

    selecionados = selecionados ? `${selecionados}, ${v.name}` : v.name;
    localStorage.setItem("servico_selecionado", selecionados);
}

        localStorage.setItem("total", total.toString());
        if (totalEl) totalEl.innerText = `TOTAL: R$ ${total.toFixed(2)}`;
        restaurarCards();
    }
    function mostrarDetalhe(v, lista, tipo, item) {
        item.onclick = null;
        const originalHTML = item.cloneNode(true);
       

    // 1. Damos ao item o visual de card branco arredondado
    item.style.cssText = "background:white; border-radius:15px; padding:20px; box-shadow:0 4px 15px rgba(0,0,0,0.1); display:flex; flex-direction:column; width:100%; box-sizing:border-box;";

    item.innerHTML = `
        <!-- Cabeçalho com o nome e o X para fechar -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3 style="margin:0; font-size:18px; color:#333;">${v.name}</h3>
            <span class="fechar" style="cursor:pointer; color:#ef4444; font-weight:bold; font-size:22px; padding:5px;">✕</span>
        </div>

        <!-- Lista de itens com check verde, bem espaçada -->
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
            ${lista.map(i => `
                <div style="display:flex; align-items:start; gap:10px; font-size:14px; color:#4b5563;">
                    <span style="color:#22c55e;">✅</span>
                    <span style="line-height:1.4;">${i}</span>
                </div>
            `).join("")}
        </div>

        <!-- Botão de confirmar no estilo da imagem -->
        <button class="confirmar" style="
            width:100%;
            padding:15px;
            background:linear-gradient(135deg, #22c55e, #16a34a);
            color:#fff;
            border:none;
            border-radius:10px;
            font-weight:bold;
            font-size:16px;
            cursor:pointer;
            box-shadow: 0 4px 10px rgba(34, 197, 94, 0.2);
        ">
            Confirmar
        </button>
    `;

    // Mantendo sua lógica original de cliques sem mexer em nada
    item.querySelector(".confirmar").onclick = (e) => {
        e.stopPropagation();

        selecionarItem(v, tipo);
       
        setTimeout(() => {
            restaurarCards();
            window.scroll({ top: 0, behavior: "smooth"});
        }, 50);
    };

    item.querySelector(".fechar").onclick = (e) => {
    e.stopPropagation();

    const novoItem = originalHTML.cloneNode(true);

    item.replaceWith(novoItem);

    // 🔥 REATIVA O COMPORTAMENTO ORIGINAL
    novoItem.onclick = (ev) => {
        ev.stopPropagation();

        if (lista) {
            mostrarDetalhe(v, lista, tipo, novoItem);
        } else {
            selecionarItem(v, tipo);
        }
    };
 };

};
const btnConfirmar = document.getElementById("btn-confirmar-horario");

if (btnConfirmar) {
    btnConfirmar.addEventListener("click", () => {
        window.location.href = "/confirmar";
    });
}

});