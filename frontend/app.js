// Seleciona o form e a mensagem
const form = document.querySelector("form");
const msg = document.getElementById("msg");

// Função para ajustar o horário automaticamente
function setHorarioSegundaASexta(dateStr) {
  const date = new Date(dateStr);

  if (date.getDay() >= 1 && date.getDay() <= 5) {
    date.setHours(18, 0, 0, 0);
  }

  return date.toISOString().slice(0, 19);
}

// 🔥 NOVO: pegar extras selecionados
function getExtrasSelecionados() {
  const select = document.getElementById("extras");
  const selected = Array.from(select.selectedOptions);
  return selected.map(option => parseInt(option.value));
}

// Só executa se existir formulário
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const scheduled_date_input = document.getElementById("date").value;

    const data = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      street: document.getElementById("street").value,
      number: document.getElementById("number").value,
      neighborhood: document.getElementById("neighborhood").value,
      city: document.getElementById("city").value,
      scheduled_date: setHorarioSegundaASexta(scheduled_date_input),
      service_id: parseInt(document.getElementById("service_id").value),
      quantity: 1,

      // 🔥 AQUI ESTÁ A MÁGICA
      additional_ids: getExtrasSelecionados()
    };

    try {
      const res = await fetch("/appointments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        msg.innerText = "✅ Agendamento criado com sucesso!";
      } else {
        msg.innerText = "❌ " + (result.detail || "Erro desconhecido");
      }

    } catch (err) {
      console.error(err);
      msg.innerText = "❌ Erro no envio - veja o console (F12)";
    }
  });
}

// 🔥 NAVEGAÇÃO
function irParaVeiculo() {
  window.location.href = "/vehicle";
}

function irParaEstofado() {
  window.location.href = "/estofado";
}
// 🔒 ACESSO ADMIN OCULTO
let cliques = 0;

document.getElementById("logo-admin").addEventListener("click", () => {

    cliques++;

    if (cliques >= 5) {
        window.location.href = "/admin";
    }

    setTimeout(() => {
        cliques = 0;
    }, 3000);

});
