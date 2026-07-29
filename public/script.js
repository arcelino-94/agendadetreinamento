// Script de suporte e inicialização da Agenda de Treinamentos
function exibirAgenda() {
  console.log("Agenda de Treinamentos inicializada com sucesso!");
  var root = document.getElementById('root');
  if (root && root.children.length === 0) {
    console.log("Aguardando montagem dos componentes React...");
  }
}

// Torna a função globalmente acessível
window.exibirAgenda = exibirAgenda;

// Executa ao carregar a página com segurança
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    exibirAgenda();
  });
} else {
  exibirAgenda();
}
