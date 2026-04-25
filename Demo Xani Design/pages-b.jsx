// Remaining pages: Orçamentos, Gráficos, Agendadas, Contas, Dívidas, Calendário, Preferências, Marketing
const { useState: uS, useMemo: uM } = React;

/* ---------------- Orçamentos ---------------- */
function OrcamentosPage({ state }) {
  const { transacoes, orcamentos } = state;
  const now = new Date();
  const mes = now.getMonth()+1, ano = now.getFullYear();
  const doMes = transacoes.filter(t => {
    const [y,m] = t.data.split('-').map(Number);
    return y === ano && m === mes && t.tipo === 'despesa';
  });

  const rows = orcamentos.map(o => {
    const cat = CATEGORIAS.find(c => c.id === o.categoria_id);
    const gasto = doMes.filter(t => t.categoria_id === o.categoria_id).reduce((a,t) => a+t.valor, 0);
    const pct = (gasto / o.valor_limite) * 100;
    return { ...o, cat, gasto, pct, restante: o.valor_limite - gasto };
  });
  const totalLimite = rows.reduce((a,r) => a+r.valor_limite, 0);
  const totalGasto = rows.reduce((a,r) => a+r.gasto, 0);

  return (
    <div>
      <div className="hint-row"><span className="tag">/mês</span>{MESES[mes-1]} {ano} · orçamentos renovam automaticamente no dia 1</div>
      <div className="grid cols-3" style={{marginBottom: 24}}>
        <div className="card stat"><div className="label">Total orçamentado</div><div className="value">{fmtEUR(totalLimite)}</div></div>
        <div className="card stat"><div className="label">Já gasto</div><div className="value neg">{fmtEUR(totalGasto)}</div><div className="delta">{((totalGasto/totalLimite)*100).toFixed(0)}% do total</div></div>
        <div className="card stat"><div className="label">Disponível</div><div className="value pos">{fmtEUR(totalLimite - totalGasto)}</div></div>
      </div>

      <div className="grid cols-2">
        {rows.map(r => (
          <div key={r.id} className="card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 12}}>
              <div style={{display:'flex', alignItems:'center', gap: 10}}>
                <span style={{width:12, height:12, background:r.cat?.cor, borderRadius:99}}/>
                <div>
                  <div style={{fontSize: 15, fontWeight: 500}}>{r.cat?.nome}</div>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg3)'}}>limite {fmtEUR(r.valor_limite)}</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:'var(--font-display)', fontSize: 28, color: r.pct > 100 ? '#fda4af' : 'var(--accent)'}}>{r.pct.toFixed(0)}%</div>
                <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg3)'}}>{fmtEUR(r.gasto)}</div>
              </div>
            </div>
            <div className="bar" style={{height: 8}}><div className={'fill'+(r.pct>100?' over':'')} style={{width: Math.min(100, r.pct)+'%', background: r.pct > 100 ? '#fda4af' : r.cat?.cor}}/></div>
            <div style={{display:'flex', justifyContent:'space-between', marginTop: 8, fontFamily:'var(--font-mono)', fontSize: 11, color: 'var(--fg3)'}}>
              <span>{r.pct > 100 ? <span style={{color:'#fda4af'}}>excedido em {fmtEUR(-r.restante)}</span> : `restam ${fmtEUR(r.restante)}`}</span>
              <span>{Math.round((r.gasto / r.valor_limite) * 30)}/30 dias</span>
            </div>
          </div>
        ))}
        <button className="card" style={{border:'1px dashed var(--border)', background:'transparent', color:'var(--fg3)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize: 13, display:'flex', alignItems:'center', justifyContent:'center', gap: 8}}>
          <Icon name="plus" size={14}/> novo orçamento
        </button>
      </div>
    </div>
  );
}

/* ---------------- Gráficos ---------------- */
function GraficosPage({ state }) {
  const { transacoes } = state;
  const [periodo, setPeriodo] = uS('mes');

  // categoria breakdown (mês)
  const now = new Date();
  const mes = now.getMonth()+1, ano = now.getFullYear();
  const despesasMes = transacoes.filter(t => {
    const [y,m] = t.data.split('-').map(Number);
    return y === ano && m === mes && t.tipo === 'despesa';
  });
  const byCat = CATEGORIAS.filter(c => c.tipo === 'despesa').map(c => ({
    label: c.nome,
    value: despesasMes.filter(t => t.categoria_id === c.id).reduce((a,t) => a+t.valor, 0),
    color: c.cor,
  })).filter(x => x.value > 0).sort((a,b) => b.value - a.value);
  const totalCat = byCat.reduce((a,c) => a+c.value, 0) || 1;

  // 6-month R vs D
  const months = [];
  for (let i=5; i>=0; i--) {
    const d = new Date(ano, mes-1-i, 1);
    const m = d.getMonth()+1, y = d.getFullYear();
    const r = transacoes.filter(t => { const [ty,tm] = t.data.split('-').map(Number); return ty===y && tm===m && t.tipo==='receita';}).reduce((a,t)=>a+t.valor,0);
    const de = transacoes.filter(t => { const [ty,tm] = t.data.split('-').map(Number); return ty===y && tm===m && t.tipo==='despesa';}).reduce((a,t)=>a+t.valor,0);
    months.push({ label: MESES[m-1].slice(0,3), receita: r, despesa: de });
  }
  const maxM = Math.max(...months.flatMap(m => [m.receita, m.despesa]), 1);

  return (
    <div>
      <div className="tabs">
        {['mes','3m','ano','custom'].map(p => (
          <button key={p} className={'tab' + (periodo===p?' active':'')} onClick={() => setPeriodo(p)}>
            {p==='mes'?'este mês':p==='3m'?'últimos 3 meses':p==='ano'?'este ano':'personalizado'}
          </button>
        ))}
      </div>

      <div className="grid cols-2" style={{marginBottom: 24}}>
        <div className="card">
          <div className="card-head"><h3 className="card-title">Despesas por categoria</h3><span className="card-hint">{fmtEUR(totalCat)}</span></div>
          <div style={{display:'flex', alignItems:'center', gap: 28}}>
            <Donut segments={byCat} size={180} thickness={18}/>
            <div style={{flex: 1}}>
              {byCat.map(c => {
                const pct = (c.value / totalCat) * 100;
                return (
                  <div key={c.label} style={{marginBottom: 10}}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize: 13}}>
                      <span style={{display:'flex', alignItems:'center', gap: 8}}><span style={{width:8,height:8,background:c.color,borderRadius:99}}/>{c.label}</span>
                      <span className="mono" style={{fontFamily:'var(--font-mono)', fontSize: 11}}>{pct.toFixed(0)}% · {fmtEUR(c.value)}</span>
                    </div>
                    <div className="bar" style={{height: 3, marginTop: 4}}><div className="fill" style={{width: pct+'%', background: c.color}}/></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3 className="card-title">Receitas vs Despesas — 6 meses</h3></div>
          <div style={{display:'flex', alignItems:'flex-end', gap: 10, height: 200}}>
            {months.map((m, i) => (
              <div key={i} style={{flex:1, display:'flex', flexDirection:'column', gap: 4, alignItems:'center'}}>
                <div style={{flex:1, display:'flex', gap: 3, alignItems:'flex-end', width: '100%'}}>
                  <div style={{flex:1, background:'#6ee7b7', height: `${(m.receita/maxM)*100}%`, minHeight: 2}} title={`+${fmtEUR(m.receita)}`}/>
                  <div style={{flex:1, background:'var(--accent)', height: `${(m.despesa/maxM)*100}%`, minHeight: 2}} title={`−${fmtEUR(m.despesa)}`}/>
                </div>
                <span style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg3)', textTransform:'uppercase'}}>{m.label}</span>
              </div>
            ))}
          </div>
          <div style={{display:'flex', justifyContent:'center', gap: 20, marginTop: 14, fontFamily:'var(--font-mono)', fontSize: 11}}>
            <span><span style={{display:'inline-block',width:10,height:10,background:'#6ee7b7',marginRight:6}}/>receitas</span>
            <span><span style={{display:'inline-block',width:10,height:10,background:'var(--accent)',marginRight:6}}/>despesas</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">Fluxo de caixa acumulado</h3></div>
        <LineChart points={(() => {
          const pts = []; let acc = 0;
          for (let i=29; i>=0; i--) {
            const iso = daysAgoIso(i);
            const r = transacoes.filter(t => t.data === iso && t.tipo==='receita').reduce((a,t)=>a+t.valor,0);
            const d = transacoes.filter(t => t.data === iso && t.tipo==='despesa').reduce((a,t)=>a+t.valor,0);
            acc += r - d; pts.push(acc);
          }
          return pts;
        })()} height={160}/>
      </div>
    </div>
  );
}

/* ---------------- Agendadas ---------------- */
function AgendadasPage({ state, actions }) {
  const { agendadas, contas } = state;
  return (
    <div>
      <div className="hint-row"><span className="tag">auto</span>execução automática quando chega a data · {agendadas.filter(a=>a.ativa).length}/{agendadas.length} ativas</div>
      <table className="ledger">
        <thead>
          <tr>
            <th style={{width:30}}></th>
            <th>Descrição</th>
            <th>Frequência</th>
            <th>Próxima</th>
            <th>Conta</th>
            <th>Categoria</th>
            <th className="num">Valor</th>
            <th style={{width:60}}></th>
          </tr>
        </thead>
        <tbody>
          {agendadas.map(a => {
            const cat = CATEGORIAS.find(c => c.id === a.categoria_id);
            const conta = contas.find(c => c.id === a.conta_id);
            return (
              <tr key={a.id} style={{opacity: a.ativa ? 1 : 0.5}}>
                <td><Icon name={a.tipo === 'despesa' ? 'down' : 'up'} size={14}/></td>
                <td>{a.descricao}</td>
                <td className="mono">{a.frequencia} · dia {a.dia_do_mes}</td>
                <td className="mono">{fmtDate(a.proxima)}</td>
                <td className="mono" style={{fontSize: 12}}>{conta?.nome}</td>
                <td>{cat ? <span className="pill"><span className="dot" style={{background:cat.cor}}/>{cat.nome}</span> : '—'}</td>
                <td className="num" style={{color: a.tipo==='despesa'?'#fda4af':'#6ee7b7'}}>{a.tipo==='despesa'?'−':'+'} {fmtEUR(a.valor)}</td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => actions.toggleAgendada(a.id)} title={a.ativa ? 'pausar' : 'retomar'}>
                      <Icon name={a.ativa ? 'pause' : 'play'} size={14}/>
                    </button>
                    <button className="icon-btn"><Icon name="trash" size={14}/></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Contas ---------------- */
function ContasPage({ state }) {
  const { contas, transacoes } = state;
  return (
    <div>
      <div className="grid cols-2">
        {contas.map(c => {
          const txs = transacoes.filter(t => t.conta_id === c.id).length;
          const mov = transacoes.filter(t => t.conta_id === c.id).slice(0,3);
          return (
            <div key={c.id} className="card" style={{borderLeft: `4px solid ${c.cor}`}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--fg3)'}}>{c.tipo.replace('_',' ')}</div>
                  <div style={{fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 500, marginTop: 4}}>{c.nome}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontFamily:'var(--font-display)', fontSize: 36, color: c.saldo < 0 ? '#fda4af' : 'var(--accent)', lineHeight: 1}}>{fmtEUR(c.saldo)}</div>
                  <div style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg3)', marginTop: 4}}>{txs} transações</div>
                </div>
              </div>
              <hr className="divider"/>
              <div style={{fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.1em', color:'var(--fg3)', textTransform:'uppercase', marginBottom: 8}}>últimos movimentos</div>
              {mov.length === 0 ? <div style={{fontFamily:'var(--font-mono)', fontSize: 12, color:'var(--fg3)'}}>—</div> :
                mov.map(t => (
                  <div key={t.id} style={{display:'flex', justifyContent:'space-between', fontSize: 12, padding: '4px 0'}}>
                    <span>{t.descricao}</span>
                    <span className="mono" style={{color: t.tipo==='despesa'?'#fda4af':t.tipo==='receita'?'#6ee7b7':'var(--fg3)'}}>
                      {t.tipo==='despesa'?'−':t.tipo==='receita'?'+':'↔'} {fmtEUR(t.valor)}
                    </span>
                  </div>
                ))
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Dívidas ---------------- */
function DividasPage({ state }) {
  const { dividas } = state;
  const [tipo, setTipo] = uS('todas');
  const filtered = dividas.filter(d => tipo === 'todas' || d.tipo === tipo);
  const totalDevo = dividas.filter(d => d.tipo === 'divida').reduce((a,d) => a + (d.valor_total - d.valor_pago), 0);
  const totalDevemMe = dividas.filter(d => d.tipo === 'credito').reduce((a,d) => a + (d.valor_total - d.valor_pago), 0);

  return (
    <div>
      <div className="grid cols-3" style={{marginBottom: 24}}>
        <div className="card stat"><div className="label">Devo</div><div className="value neg">{fmtEUR(totalDevo)}</div></div>
        <div className="card stat"><div className="label">Devem-me</div><div className="value pos">{fmtEUR(totalDevemMe)}</div></div>
        <div className="card stat"><div className="label">Saldo líquido</div><div className="value accent">{fmtEUR(totalDevemMe - totalDevo)}</div></div>
      </div>

      <div className="tabs">
        {['todas','divida','credito'].map(t => (
          <button key={t} className={'tab'+(tipo===t?' active':'')} onClick={()=>setTipo(t)}>
            {t==='todas'?'todas':t==='divida'?'dívidas':'créditos'}
          </button>
        ))}
      </div>

      <table className="ledger">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Interveniente</th>
            <th>Progresso</th>
            <th>Vencimento</th>
            <th className="num">Total</th>
            <th className="num">Pago</th>
            <th className="num">Restante</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(d => {
            const pct = (d.valor_pago / d.valor_total) * 100;
            const rest = d.valor_total - d.valor_pago;
            return (
              <tr key={d.id}>
                <td><span className="pill" style={{color: d.tipo==='divida'?'#fda4af':'#6ee7b7', borderColor: 'currentColor'}}>{d.tipo}</span></td>
                <td>
                  <div>{d.interveniente}</div>
                  {d.notas && <div style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg3)'}}>{d.notas}</div>}
                </td>
                <td style={{minWidth: 180}}>
                  <div className="bar" style={{height: 4}}><div className="fill" style={{width: pct+'%', background: d.tipo==='divida'?'#fda4af':'#6ee7b7'}}/></div>
                  <div style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg3)', marginTop: 4}}>{pct.toFixed(0)}%</div>
                </td>
                <td className="mono">{fmtDate(d.data_vencimento)}</td>
                <td className="num">{fmtEUR(d.valor_total)}</td>
                <td className="num">{fmtEUR(d.valor_pago)}</td>
                <td className="num" style={{color: rest === 0 ? '#6ee7b7' : 'var(--fg1)'}}>{fmtEUR(rest)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Calendário ---------------- */
function CalendarioPage({ state }) {
  const { transacoes, agendadas } = state;
  const now = new Date();
  const [mes, setMes] = uS(now.getMonth()+1);
  const [ano, setAno] = uS(now.getFullYear());
  const [selDia, setSelDia] = uS(null);

  const firstDay = new Date(ano, mes-1, 1);
  const daysInMonth = new Date(ano, mes, 0).getDate();
  let startDow = firstDay.getDay(); startDow = startDow === 0 ? 6 : startDow - 1; // Mon=0

  const days = [];
  for (let i=0; i<startDow; i++) days.push(null);
  for (let i=1; i<=daysInMonth; i++) days.push(i);
  while (days.length % 7 !== 0) days.push(null);

  const prev = () => { if (mes===1) {setMes(12); setAno(ano-1);} else setMes(mes-1); };
  const next = () => { if (mes===12) {setMes(1); setAno(ano+1);} else setMes(mes+1); };

  const todayStr = todayIso();

  const txsDia = (dia) => {
    const iso = `${ano}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    return transacoes.filter(t => t.data === iso);
  };

  const selIso = selDia ? `${ano}-${String(mes).padStart(2,'0')}-${String(selDia).padStart(2,'0')}` : null;
  const selTxs = selIso ? transacoes.filter(t => t.data === selIso) : [];

  return (
    <div>
      <div className="card" style={{marginBottom: 20}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <button className="icon-btn" onClick={prev}><Icon name="chevleft" size={18}/></button>
          <div style={{fontFamily:'var(--font-display)', fontSize: 32, color: 'var(--accent)'}}>{MESES[mes-1]} {ano}</div>
          <button className="icon-btn" onClick={next}><Icon name="chevright" size={18}/></button>
        </div>
      </div>

      <div className="grid cols-3" style={{alignItems: 'start'}}>
        <div style={{gridColumn: 'span 2'}}>
          <div className="cal">
            {DIAS_SEMANA.map(d => <div key={d} className="dow">{d}</div>)}
            {days.map((d, i) => {
              if (d === null) return <div key={i} className="day muted"/>;
              const iso = `${ano}-${String(mes).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
              const txs = txsDia(d);
              const despesa = txs.filter(t => t.tipo==='despesa').reduce((a,t)=>a+t.valor,0);
              const receita = txs.filter(t => t.tipo==='receita').reduce((a,t)=>a+t.valor,0);
              const isToday = iso === todayStr;
              const isSel = d === selDia;
              return (
                <div key={i} className={'day' + (isToday?' today':'')} onClick={() => setSelDia(d)}
                     style={isSel ? {background: 'rgba(var(--color-accent-rgb), 0.1)'} : {}}>
                  <span className="num" style={{color: isToday ? 'var(--accent)' : undefined, fontWeight: isToday ? 600 : 400}}>{d}</span>
                  <div className="dots">
                    {txs.slice(0,4).map((t, j) => {
                      const cat = CATEGORIAS.find(c => c.id === t.categoria_id);
                      return <span key={j} className="d" style={{background: cat?.cor || 'var(--fg3)'}}/>;
                    })}
                  </div>
                  {receita > 0 && <span className="amt pos">+{receita.toFixed(0)}€</span>}
                  {despesa > 0 && <span className="amt neg">−{despesa.toFixed(0)}€</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <h3 className="card-title" style={{marginBottom: 14}}>
            {selDia ? `${String(selDia).padStart(2,'0')}/${String(mes).padStart(2,'0')}/${ano}` : 'Selecione um dia'}
          </h3>
          {!selDia && <div style={{fontFamily:'var(--font-mono)', fontSize: 12, color:'var(--fg3)'}}>Clique num dia do calendário para ver as transações.</div>}
          {selTxs.length === 0 && selDia && <div style={{fontFamily:'var(--font-mono)', fontSize: 12, color:'var(--fg3)'}}>sem transações</div>}
          {selTxs.map(t => {
            const cat = CATEGORIAS.find(c => c.id === t.categoria_id);
            return (
              <div key={t.id} style={{padding: '10px 0', borderBottom: '1px dashed var(--border)'}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize: 13}}>
                  <span>{t.descricao}</span>
                  <span className="mono" style={{color: t.tipo==='despesa'?'#fda4af':'#6ee7b7'}}>
                    {t.tipo==='despesa'?'−':'+'} {fmtEUR(t.valor)}
                  </span>
                </div>
                {cat && <div style={{marginTop: 4}}><span className="pill"><span className="dot" style={{background:cat.cor}}/>{cat.nome}</span></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Preferências ---------------- */
function PreferenciasPage({ state, actions }) {
  return (
    <div style={{maxWidth: 720}}>
      <div className="card" style={{marginBottom: 16}}>
        <h3 className="card-title" style={{marginBottom: 12}}>Aparência</h3>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding: '10px 0'}}>
          <div>
            <div style={{fontSize: 14}}>Tema</div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg3)', marginTop:2}}>
              claro ou escuro — orange-on-navy é o modo distintivo do Xani
            </div>
          </div>
          <div style={{display:'flex', gap: 0, border: '1px solid var(--border)'}}>
            {['light','dark'].map(t => (
              <button key={t}
                className="btn"
                style={{border: 0, borderRight: t==='light' ? '1px solid var(--border)' : 'none',
                        background: state.theme===t ? 'var(--accent)' : 'transparent',
                        color: state.theme===t ? 'var(--fill)' : 'var(--fg2)'}}
                onClick={() => actions.setTheme(t)}>
                <Icon name={t==='light'?'sun':'moon'} size={14}/> {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{marginBottom: 16}}>
        <h3 className="card-title" style={{marginBottom: 12}}>Categorias personalizadas</h3>
        <div style={{display:'flex', flexWrap:'wrap', gap: 8}}>
          {CATEGORIAS.map(c => (
            <span key={c.id} className="pill"><span className="dot" style={{background:c.cor}}/>{c.nome}</span>
          ))}
          <button className="pill" style={{background:'transparent', cursor:'pointer', color:'var(--fg3)', borderStyle:'dashed'}}><Icon name="plus" size={10}/> adicionar</button>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title" style={{marginBottom: 12}}>Dados</h3>
        <div style={{fontFamily:'var(--font-mono)', fontSize: 12, color:'var(--fg2)', marginBottom: 12}}>
          Base de dados local · SQLite · {state.transacoes.length} transações · {state.contas.length} contas
        </div>
        <div style={{display:'flex', gap: 8}}>
          <button className="btn ghost"><Icon name="file" size={14}/> exportar CSV</button>
          <button className="btn ghost"><Icon name="file" size={14}/> importar CSV</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Marketing home ---------------- */
function MarketingPage({ actions }) {
  return (
    <div className="marketing">
      <div className="kicker">despesas · v1 · pt-PT</div>
      <h1>As tuas finanças<br/><i>sem ruído.</i></h1>
      <p className="lead">
        Uma aplicação local para acompanhar receitas, despesas, orçamentos e dívidas — sem conta, sem sincronização na nuvem,
        sem subscrições. Os teus dados vivem num ficheiro SQLite na tua máquina.
      </p>
      <div style={{display:'flex', gap: 12}}>
        <button className="btn primary" onClick={() => actions.goto('visao-geral')}>
          abrir aplicação <Icon name="chevright" size={14}/>
        </button>
        <a className="btn ghost" href="#">ver no GitHub</a>
      </div>

      <div className="feat-list">
        <div className="feat"><div className="num">01</div><h3>Dashboard</h3><p>Balanço total, receitas e despesas do mês, gráfico dos últimos 7 dias e evolução do saldo.</p></div>
        <div className="feat"><div className="num">02</div><h3>Orçamentos mensais</h3><p>Define um limite por categoria. Renovação automática todos os meses, sem mexer em nada.</p></div>
        <div className="feat"><div className="num">03</div><h3>Transações agendadas</h3><p>Renda, salário, subscrições. São executadas sozinhas quando chega o dia.</p></div>
        <div className="feat"><div className="num">04</div><h3>Dívidas e créditos</h3><p>Regista o que deves e o que te devem. Pagamentos parciais com progresso.</p></div>
        <div className="feat"><div className="num">05</div><h3>Calendário financeiro</h3><p>Vê os teus dias num só olhar. Pontos coloridos marcam a atividade.</p></div>
        <div className="feat"><div className="num">06</div><h3>CSV in &amp; out</h3><p>Traz os dados de outra ferramenta ou leva os teus para análise externa.</p></div>
      </div>

      <div style={{marginTop: 80, fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--fg3)', textAlign:'center'}}>
        <div className="ascii">· · · · · · · · · · · · · · · · · · · ·</div>
        <p style={{marginTop: 16}}>single-user · offline-first · next.js 16 · sqlite · português de portugal</p>
      </div>
    </div>
  );
}

Object.assign(window, { OrcamentosPage, GraficosPage, AgendadasPage, ContasPage, DividasPage, CalendarioPage, PreferenciasPage, MarketingPage });
