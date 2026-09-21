import React, { useState, useEffect } from 'react';
import './App.css';

// ⚠️ SUBSTITUA PELA SUA URL REAL DO API GATEWAY
const API_URL = "https://SEU_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/prod/batalha";

function App() {
  const [nickname, setNickname] = useState('');
  const [jogadorRegistado, setJogadorRegistado] = useState(false);
  const [pontuacao, setPontuacao] = useState(0);
  const [vitorias, setVitorias] = useState(0);
  
  // Estado para guardar a lista do ranking
  const [ranking, setRanking] = useState([]);
  const [carregandoRanking, setCarregandoRanking] = useState(false);

  // 1. Função para carregar o Ranking via GET
  const buscarRanking = async () => {
    setCarregandoRanking(true);
    try {
      const response = await fetch(API_URL, { method: 'GET' });
      const data = await response.json();
      if (Array.isArray(data)) {
        setRanking(data);
      }
    } catch (error) {
      console.error("Erro ao procurar ranking:", error);
    } finally {
      setCarregandoRanking(false);
    }
  };

  // Carrega o ranking assim que a aplicação abre
  useEffect(() => {
    buscarRanking();
  }, []);

  // 2. Função para salvar o resultado da partida via POST
  const salvarResultado = async (pontosFinais, vitoriasFinais) => {
    if (!nickname) return;

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname,
          pontuacao: pontosFinais,
          vitorias: vitoriasFinais
        })
      });
      // Recarrega o ranking após salvar a nova pontuação
      buscarRanking();
    } catch (error) {
      console.error("Erro ao salvar resultado:", error);
    }
  };

  // Registo do Treinador
  const handleEntrarJogo = (e) => {
    e.preventDefault();
    if (nickname.trim() !== '') {
      setJogadorRegistado(true);
    }
  };

  // Exemplo de Simulação de Fim de Jogo (Chame isto quando a batalha terminar)
  const simularFimDeJogo = () => {
    const novaPontuacao = pontuacao + 100;
    const novasVitorias = vitorias + 1;
    
    setPontuacao(novaPontuacao);
    setVitorias(novasVitorias);

    // Salva automaticamente na AWS
    salvarResultado(novaPontuacao, novasVitorias);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>⚡ Pokémon Battle Game</h1>

      {/* TELA DE REGISTO DO NICKNAME */}
      {!jogadorRegistado ? (
        <form onSubmit={handleEntrarJogo} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Digite o seu Nickname para Jogar:</h3>
          <input
            type="text"
            placeholder="Ex: AshKetchum"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{ padding: '10px', fontSize: '16px', marginRight: '10px' }}
          />
          <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
            Entrar
          </button>
        </form>
      ) : (
        /* ÁREA DA BATALHA */
        <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #4CAF50', borderRadius: '8px' }}>
          <h2>Treinador: {nickname}</h2>
          <p>Vitórias: {vitorias} | Pontuação: {pontuacao} pts</p>
          
          <button onClick={simularFimDeJogo} style={{ padding: '10px 20px', backgroundColor: '#FFCB05', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            ⚔️ Simular Batalha e Salvar Pontuação
          </button>
        </div>
      )}

      <hr />

      {/* COMPONENTE DO RANKING / LEADERBOARD */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>🏆 Leaderboard / Ranking</h2>
          <button onClick={buscarRanking} style={{ padding: '8px 12px', cursor: 'pointer' }}>
            🔄 Atualizar
          </button>
        </div>

        {carregandoRanking ? (
          <p>A carregar o ranking...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#333', color: '#fff', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Posição</th>
                <th style={{ padding: '10px' }}>Nickname</th>
                <th style={{ padding: '10px' }}>Vitórias</th>
                <th style={{ padding: '10px' }}>Pontuação</th>
              </tr>
            </thead>
            <tbody>
              {ranking.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '10px', textAlign: 'center' }}>Nenhum registo encontrado.</td>
                </tr>
              ) : (
                ranking.map((item, idx) => (
                  <tr key={item.id || idx} style={{ borderBottom: '1px solid #ddd', backgroundColor: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{idx + 1}º</td>
                    <td style={{ padding: '10px' }}>{item.nickname || 'Anónimo'}</td>
                    <td style={{ padding: '10px' }}>{item.vitorias || 0}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#2e7d32' }}>{item.pontuacao || 0} pts</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;