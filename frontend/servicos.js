document.addEventListener("DOMContentLoaded", () => {
    const content = document.querySelector(".content");
    const totalEl = document.getElementById("total");

    // Recupera o tipo e preço do veículo selecionado na tela anterior
    const veiculoNome = localStorage.getItem("veiculo_nome") || "Hatch"; 
    const veiculoPrecoBase = parseFloat(localStorage.getItem("veiculo_preco")) || 0;

    // Tabela de preços dinâmicos conforme solicitado
    const precosDinamicos = {
        "Intermediário": { "Hatch": 450, "Sedan": 500, "SUV": 550, "4x4": 600 },
        "Premium": { "Hatch": 600, "Sedan": 650, "SUV": 700, "4x4": 750 }
    };

    // Lista de serviços com as descrições completas e características técnicas
    const servicos = [
        { 
            nome: "Detalhada Pro", 
            preco: 100, 
            tempo: "3 horas",
            desc: "Lavagem detalhada externa, aspiração completa + revitalização." 
        },
        { 
            nome: "Pacote Intermediário", 
            preco: precosDinamicos["Intermediário"][veiculoNome] || 450, 
            tempo: "10 horas",
            desc: "Lavagem detalhada, remoção dos bancos, higienização profunda dos bancos, limpeza de portas e porta mala, hidrataçao dos plasticos internos." 
        },
        { 
            nome: "Pacote Premium", 
            preco: precosDinamicos["Premium"][veiculoNome] || 600, 
            tempo: "10 horas",
            desc: "Lavagem tecnica detalhada, desmontagem tecnica e higienizaçao completa, higienização teto bancos portas e porta malas, revitalizaçao plasticos externos, hidrataçao plasticos internos, aplicaçao de cera liquida, remoção de chuva acida vidros, higienizaçaão carpete." 
        }
    ];

    content.innerHTML = "";

    servicos.forEach(s => {
        let expandido = false;
        const card = document.createElement("div");
        card.classList.add("card");
        card.style.cursor = "pointer";

        // Estado inicial do Card
        function renderNormal() {
            card.innerHTML = `
                <div class="card-left" style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <span style="font-weight: 600; color: #1e293b;">${s.nome}</span>
                    <span style="font-weight: 600; color: #1e293b;">+ R$ ${s.preco.toFixed(2)}</span>
                </div>
            `;
        }

        // Estado expandido (Mostra a descrição completa como solicitado)
        function renderExpandido() {
            card.innerHTML = ""; // Limpa para garantir que o novo layout entre limpo
            const htmlExpandido = `
                <div style="width: 100%; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="color: #111;">${s.nome}</strong>
                        <strong style="color: #111;">+ R$ ${s.preco.toFixed(2)}</strong>
                    </div>
                    
                    <div style="font-size: 13px; color: #6b7280; line-height: 1.5; text-align: left; padding: 5px 0;">
                        ${s.desc}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 10px; margin-top: 5px;">
                        <span style="color: #3A8DFF; font-size: 12px; font-weight: 600;">Tempo: ${s.tempo}</span>
                        <span style="color: #3A8DFF; font-size: 11px; font-weight: 500;">Clique novamente para confirmar</span>
                    </div>
                </div>
            `;
            card.insertAdjacentHTML('beforeend', htmlExpandido);
        }

        renderNormal();

        card.onclick = (e) => {
            e.stopPropagation();

            if (!expandido) {
                // FORÇA O CARD A CRESCER E MOSTRAR O TEXTO
                card.style.display = "block"; 
                card.style.height = "auto";
                card.style.minHeight = "120px";
                
                renderExpandido();
                expandido = true;
            } else {
                // SEGUNDO CLIQUE: SALVA OS DADOS
                localStorage.setItem("servico_nome", s.nome);
                localStorage.setItem("servico_preco", s.preco);
                localStorage.setItem("servico_tempo", s.tempo);

                const total = veiculoPrecoBase + s.preco;
                if (totalEl) {
                    totalEl.innerHTML = `<span>R$ ${total.toFixed(2)}</span>`;
                }

                // Efeito visual de confirmação
                card.style.border = "2px solid #2563eb";
                card.style.background = "rgba(58, 141, 255, 0.05)";

                setTimeout(() => {
                    window.location.href = "/confirmar";
                }, 400);
            }
        };

        content.appendChild(card);
    });
});
