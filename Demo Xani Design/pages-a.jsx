// Page components — each consumes shared state from window.appState
const { useState: useS, useMemo: useM, useEffect: useE } = React;

/* ---------------- Visão Geral (Dashboard) ---------------- */
function VisaoGeralPage({ state, actions }) {
  const { transacoes, contas, orcamentos } = state;
  const now = new Date();
  const mes = now.getMonth()+1, ano = now.getFullYear();

  const doMes = transacoes.filter(t => {
    const [y,m] = t.data.split('-').map(Number);
    return y === ano && m === mes && t.tipo !== 'transferencia';
  });
  const receitas = doMes.filter(t => t.tipo === 'receita').reduce((a,t) => a + t.valor, 0);
  const despesas = doMes.filter(t => t.tipo === 'despesa').reduce((a,t) => a + t.valor, 0);
  const balanco = contas.reduce((a,c) => a + c.saldo, 0);

  // últimos 7 dias
  const last7 = [];
  for (let i=6; i>=0; i--) {
    const iso = daysAgoIso(i);
    const gasto = transacoes.filter(t => t.data === iso && t.tipo === 'despesa').reduce((a,t) => a + t.valor, 0);
    const [,,d] = iso.split('-');
    last7.push({ label: d, value: gasto, cap: gasto ? `€${gasto.toFixed(0)}` : '', showCap: gasto > 0 });
  }

  // donut
  const donutSegs = [
    { label: 'Receitas', value: receitas, color: '#6ee7b7' },
    { label: 'Despesas', value: despesas, color: 'var(--accent)' },
  ];

  // balanço evolução (14d)
  const balancePts = [];
  let running = balanco + despesas - receitas;
  for (let i=29; i>=0; i--) {
    const iso = daysAgoIso(i);
    const receita = transacoes.filter(t => t.data === iso && t.tipo === 'receita').reduce((a,t) => a + t.valor, 0);
    const despesa = transacoes.filter(t => t.data === iso && t.tipo === 'despesa').reduce((a,t) => a + t.valor, 0);
    running += receita - despesa;
    balancePts.push(running);
  }

  // orçamentos com progresso
  const orcWithProgress = orcamentos.map(o => {
    const cat = CATEGORIAS.find(c => c.id === o.categoria_id);
    const gasto = doMes.filter(t => t.categoria_id === o.categoria_id && t.tipo === 'despesa').reduce((a,t) => a + t.valor, 0);
    return { ...o, cat, gasto, pct: Math.min(999, (gasto / o.valor_limite) * 100) };
  });

  const recent = [...transacoes].sort((a,b) => b.data.localeCompare(a.data)).slice(0, 6);

  return (
    <div>
      {/* top stats */}
      <div className="grid cols-3" style={{marginBottom: 24}}>
        <div className="card stat">
          <div className="label">Balanço Total</div>
          <div className="value accent">{fmtEUR(balanco)}</div>
          <div className="delta">Somatório de {contas.length} contas</div>
        </div>
        <div className="card stat">
          <div className="label">Receitas · {MESES[mes-1]}</div>
          <div className="value pos">+{fmtEUR(receitas)}</div>
          <div className="delta">{doMes.filter(t=>t.tipo==='receita').length} transações</div>
        </div>
        <div className="card stat">
          <div className="label">Despesas · {MESES[mes-1]}</div>
          <div className="value neg">−{fmtEUR(despesas)}</div>
          <div className="delta">{doMes.filter(t=>t.tipo==='despesa').length} transações</div>
        </div>
      </div>

      {/* contas */}
      <div className="section-head"><h2>Contas</h2><div className="sep"/><span className="card-hint">{contas.length} ativas</span></div>
      <div className="grid cols-4" style={{marginBottom: 24}}>
        {contas.map(c => (
          <div key={c.id} className="card" style={{borderLeft: `3px solid ${c.cor}`}}>
            <div className="card-hint" style={{textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 10}}>{c.tipo.replace('_',' ')}</div>
            <div style={{fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, margin: '4px 0 10px'}}>{c.nome}</div>
            <div className="mono" style={{fontFamily: 'var(--font-mono)', fontSize: 18, color: c.saldo < 0 ? '#fda4af' : 'var(--fg1)'}}>{fmtEUR(c.saldo)}</div>
          </div>
        ))}
      </div>

      {/* charts row */}
      <div className="grid cols-3" style={{marginBottom: 24}}>
        <div className="card" style={{gridColumn: 'span 2'}}>
          <div className="card-head">
            <h3 className="card-title">Despesas — últimos 7 dias</h3>
            <span className="card-hint">total {fmtEUR(last7.reduce((a,b) => a+b.value, 0))}</span>
          </div>
          <BarChart bars={last7} height={140}/>
        </div>
        <div className="card">
          <div className="card-head"><h3 className="card-title">Receitas vs Despesas</h3></div>
          <Donut segments={donutSegs} size={160} thickness={14}/>
          <div style={{display:'flex', justifyContent:'center', gap: 16, marginTop: 12, fontFamily:'var(--font-mono)', fontSize: 11}}>
            <span><span className="dot" style={{display:'inline-block',width:8,height:8,background:'#6ee7b7',marginRight:6,borderRadius:99}}/>+{fmtEUR(receitas)}</span>
            <span><span className="dot" style={{display:'inline-block',width:8,height:8,background:'var(--accent)',marginRight:6,borderRadius:99}}/>−{fmtEUR(despesas)}</span>
          </div>
        </div>
      </div>

      {/* balance line */}
      <div className="card" style={{marginBottom: 24}}>
        <div className="card-head">
          <h3 className="card-title">Evolução do Balanço — 30 dias</h3>
          <span className="card-hint">{fmtEUR(balancePts[0])} → {fmtEUR(balancePts[balancePts.length-1])}</span>
        </div>
        <LineChart points={balancePts} height={120}/>
      </div>

      {/* orçamentos + recent */}
      <div className="grid cols-2">
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Orçamentos · {MESES[mes-1]}</h3>
            <a className="link card-hint" href="#" onClick={(e)=>{e.preventDefault(); actions.goto('orcamentos');}}>ver todos</a>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
            {orcWithProgress.map(o => (
              <div key={o.id}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 4}}>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <span style={{width:8,height:8,borderRadius:99,background:o.cat?.cor}}/>
                    <span style={{fontSize:13}}>{o.cat?.nome}</span>
                  </div>
                  <div className="mono" style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg3)'}}>
                    <span style={{color: o.pct > 100 ? '#fda4af' : 'var(--fg2)'}}>{fmtEUR(o.gasto)}</span> / {fmtEUR(o.valor_limite)}
                  </div>
                </div>
                <div className="bar"><div className={'fill' + (o.pct > 100 ? ' over' : '')} style={{width: Math.min(100, o.pct) + '%', background: o.pct > 100 ? '#fda4af' : o.cat?.cor}}/></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Transações recentes</h3>
            <a className="link card-hint" href="#" onClick={(e)=>{e.preventDefault(); actions.goto('transacoes');}}>ver todas</a>
          </div>
          <div>
            {recent.map(t => {
              const cat = CATEGORIAS.find(c => c.id === t.categoria_id);
              const conta = contas.find(c => c.id === t.conta_id);
              const sign = t.tipo === 'despesa' ? '−' : t.tipo === 'receita' ? '+' : '↔';
              const colorClass = t.tipo === 'despesa' ? '#fda4af' : t.tipo === 'receita' ? '#6ee7b7' : 'var(--fg3)';
              return (
                <div key={t.id} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom: '1px dashed var(--border)'}}>
                  <div>
                    <div style={{fontSize: 13}}>{t.descricao}</div>
                    <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg3)', marginTop: 2}}>{fmtDate(t.data)} · {conta?.nome} · {cat?.nome || '—'}</div>
                  </div>
                  <div className="mono" style={{fontFamily:'var(--font-mono)', fontSize:13, color: colorClass, whiteSpace:'nowrap'}}>{sign} {fmtEUR(t.valor)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Transações ---------------- */
function TransacoesPage({ state, actions }) {
  const { transacoes, contas } = state;
  const now = new Date();
  const [mes, setMes] = useS(now.getMonth()+1);
  const [ano, setAno] = useS(now.getFullYear());
  const [tiposSel, setTiposSel] = useS(new Set());
  const [conta, setConta] = useS('todas');
  const [cat, setCat] = useS('todas');
  const [q, setQ] = useS('');
  const [modal, setModal] = useS(null); // null | { editing }

  const filtered = useM(() => {
    return transacoes.filter(t => {
      const [y,m] = t.data.split('-').map(Number);
      if (y !== ano || m !== mes) return false;
      if (tiposSel.size && !tiposSel.has(t.tipo)) return false;
      if (conta !== 'todas' && t.conta_id !== Number(conta)) return false;
      if (cat !== 'todas' && t.categoria_id !== Number(cat)) return false;
      if (q && !(t.descricao.toLowerCase().includes(q.toLowerCase()) || t.notas.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    }).sort((a,b) => b.data.localeCompare(a.data));
  }, [transacoes, mes, ano, tiposSel, conta, cat, q]);

  const receitas = filtered.filter(t => t.tipo === 'receita').reduce((a,t) => a+t.valor, 0);
  const despesas = filtered.filter(t => t.tipo === 'despesa').reduce((a,t) => a+t.valor, 0);

  const toggleTipo = (t) => {
    setTiposSel(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  };
  const prevMes = () => { if (mes === 1) { setMes(12); setAno(ano-1); } else setMes(mes-1); };
  const nextMes = () => { if (mes === 12) { setMes(1); setAno(ano+1); } else setMes(mes+1); };

  return (
    <div>
      {/* month nav */}
      <div className="card" style={{marginBottom: 20}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <button className="icon-btn" onClick={prevMes}><Icon name="chevleft" size={18}/></button>
          <div style={{fontFamily:'var(--font-display)', fontSize: 28, color: 'var(--accent)'}}>{MESES[mes-1]} {ano}</div>
          <button className="icon-btn" onClick={nextMes}><Icon name="chevright" size={18}/></button>
        </div>
        <div style={{display:'flex', justifyContent:'center', gap: 32, marginTop: 10, fontFamily:'var(--font-mono)', fontSize: 12}}>
          <span>receitas <span style={{color:'#6ee7b7'}}>+{fmtEUR(receitas)}</span></span>
          <span>despesas <span style={{color:'#fda4af'}}>−{fmtEUR(despesas)}</span></span>
          <span>saldo <span style={{color: (receitas-despesas)>=0 ? '#6ee7b7':'#fda4af'}}>{fmtEUR(receitas - despesas)}</span></span>
        </div>
      </div>

      {/* filters */}
      <div className="grid cols-4" style={{marginBottom: 20}}>
        <div>
          <label className="field-label">Tipo</label>
          <div className="checkbox-group" style={{paddingTop: 6}}>
            {['despesa','receita','transferencia'].map(t => (
              <label key={t} className="check">
                <input type="checkbox" checked={tiposSel.has(t)} onChange={() => toggleTipo(t)}/>
                {t}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="field-label">Conta</label>
          <select className="select" value={conta} onChange={e => setConta(e.target.value)}>
            <option value="todas">todas</option>
            {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Categoria</label>
          <select className="select" value={cat} onChange={e => setCat(e.target.value)}>
            <option value="todas">todas</option>
            {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Pesquisa</label>
          <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="descrição ou notas…"/>
        </div>
      </div>

      {/* table */}
      {filtered.length === 0 ? (
        <div className="empty">Nenhuma transação encontrada.</div>
      ) : (
        <table className="ledger">
          <thead>
            <tr>
              <th style={{width: 24}}></th>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Conta</th>
              <th className="num">Valor</th>
              <th style={{width: 60}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const categoria = CATEGORIAS.find(c => c.id === t.categoria_id);
              const conta = contas.find(c => c.id === t.conta_id);
              const destino = t.conta_destino_id ? contas.find(c => c.id === t.conta_destino_id) : null;
              const sign = t.tipo === 'despesa' ? '−' : t.tipo === 'receita' ? '+' : '';
              const colorHex = t.tipo === 'despesa' ? '#fda4af' : t.tipo === 'receita' ? '#6ee7b7' : '#6bb5ff';
              return (
                <tr key={t.id}>
                  <td><Icon name={t.tipo === 'despesa' ? 'down' : t.tipo === 'receita' ? 'up' : 'swap'} size={14}/></td>
                  <td className="mono">{fmtDate(t.data)}</td>
                  <td>
                    <div>{t.descricao || <span style={{color:'var(--fg3)', fontStyle:'italic'}}>{t.tipo}</span>}</div>
                    {t.notas && <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg3)', marginTop:2}}>{t.notas}</div>}
                  </td>
                  <td>
                    {categoria ? (
                      <span className="pill"><span className="dot" style={{background: categoria.cor}}/>{categoria.nome}</span>
                    ) : <span style={{color:'var(--fg3)'}}>—</span>}
                  </td>
                  <td className="mono" style={{fontSize: 12}}>
                    {conta?.nome}{destino && <span style={{color:'var(--fg3)'}}> → {destino.nome}</span>}
                  </td>
                  <td className="num" style={{color: colorHex}}>{sign} {fmtEUR(t.valor)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => setModal({editing: t})}><Icon name="edit" size={14}/></button>
                      <button className="icon-btn" onClick={() => actions.delTx(t.id)}><Icon name="trash" size={14}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* FAB */}
      <button className="btn primary" style={{position:'fixed', bottom: 32, right: 32, zIndex: 30, padding: '14px 20px'}}
              onClick={() => setModal({editing: null})}>
        <Icon name="plus" size={16}/> Nova transação
      </button>

      {modal && <TransacaoModal editing={modal.editing} onClose={() => setModal(null)} onSave={(data) => { actions.saveTx(data, modal.editing); setModal(null); }} contas={contas}/>}
    </div>
  );
}

function TransacaoModal({ editing, onClose, onSave, contas }) {
  const [tipo, setTipo] = useS(editing?.tipo || 'despesa');
  const [valor, setValor] = useS(editing?.valor || '');
  const [data, setData] = useS(editing?.data || todayIso());
  const [descricao, setDescricao] = useS(editing?.descricao || '');
  const [contaId, setContaId] = useS(editing?.conta_id || contas[0]?.id);
  const [contaDestinoId, setContaDestinoId] = useS(editing?.conta_destino_id || '');
  const [catId, setCatId] = useS(editing?.categoria_id || '');
  const [notas, setNotas] = useS(editing?.notas || '');

  const submit = (e) => {
    e.preventDefault();
    onSave({
      tipo, valor: parseFloat(valor), data, descricao, notas,
      conta_id: Number(contaId),
      categoria_id: tipo === 'transferencia' ? null : (catId ? Number(catId) : null),
      conta_destino_id: tipo === 'transferencia' ? Number(contaDestinoId) : null,
    });
  };

  const catsForTipo = CATEGORIAS.filter(c => c.tipo === tipo || c.tipo === 'ambos');

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
            <h2 className="modal-title">{editing ? 'editar' : 'nova'}</h2>
            <div className="modal-sub">{editing ? `transação #${editing.id}` : 'registar movimento'}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={18}/></button>
        </div>
        <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap: 14}}>
          <div>
            <label className="field-label">Tipo</label>
            <div className="checkbox-group">
              {['despesa','receita','transferencia'].map(t => (
                <label key={t} className="check" style={{padding:'6px 10px', border: '1px solid ' + (tipo===t ? 'var(--accent)' : 'var(--border)'), color: tipo===t ? 'var(--accent)' : 'var(--fg2)'}}>
                  <input type="radio" name="tipo" checked={tipo===t} onChange={() => { setTipo(t); setCatId(''); setContaDestinoId(''); }}/>
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div className="grid cols-2">
            <div><label className="field-label">Valor (€)</label><input className="input" type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} required/></div>
            <div><label className="field-label">Data</label><input className="input" type="date" value={data} onChange={e => setData(e.target.value)} required/></div>
          </div>
          <div><label className="field-label">Descrição</label><input className="input" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Mercadona"/></div>
          <div>
            <label className="field-label">{tipo==='transferencia' ? 'Conta de origem' : 'Conta'}</label>
            <select className="select" value={contaId} onChange={e => setContaId(e.target.value)}>
              {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          {tipo === 'transferencia' && (
            <div>
              <label className="field-label">Conta de destino</label>
              <select className="select" value={contaDestinoId} onChange={e => setContaDestinoId(e.target.value)} required>
                <option value="">—</option>
                {contas.filter(c => c.id !== Number(contaId)).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          )}
          {tipo !== 'transferencia' && (
            <div>
              <label className="field-label">Categoria</label>
              <select className="select" value={catId} onChange={e => setCatId(e.target.value)}>
                <option value="">—</option>
                {catsForTipo.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          )}
          <div><label className="field-label">Notas</label><input className="input" value={notas} onChange={e => setNotas(e.target.value)} placeholder="(opcional)"/></div>
          <div style={{display:'flex', gap: 10, justifyContent:'flex-end', marginTop: 6}}>
            <button type="button" className="btn ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn primary">{editing ? 'guardar' : 'criar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

Object.assign(window, { VisaoGeralPage, TransacoesPage });
