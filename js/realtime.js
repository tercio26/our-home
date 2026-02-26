// ══════════════════════════════════════════════
// REALTIME
// ══════════════════════════════════════════════
SB.channel('toam-rt')
  .on('postgres_changes',{event:'*',schema:'public',table:'transactions'},()=>{if(cur==='finance')loadTx();loadHomeStats();})
  .on('postgres_changes',{event:'*',schema:'public',table:'chores'},()=>{if(cur==='chores')loadChores();loadHomeStats();})
  .on('postgres_changes',{event:'*',schema:'public',table:'notes'},()=>{if(cur==='notes')loadNotes();})
  .on('postgres_changes',{event:'*',schema:'public',table:'events'},()=>{if(cur==='notes')loadEvents();})
  .on('postgres_changes',{event:'*',schema:'public',table:'dreams'},()=>{if(cur==='dreams')loadDreams();loadHomeStats();})
  .on('postgres_changes',{event:'*',schema:'public',table:'love_notes'},()=>{if(cur==='home')loadLove();})
  .subscribe();

// ── KEYBOARD SHORTCUTS ───────────────────────
document.addEventListener('keydown', e => {
  // Esc closes any open modal
  if (e.key === 'Escape') {
    ['modal-note','modal-event','modal-dream'].forEach(id => {
      if ($( id)?.classList.contains('open')) closeModal(id);
    });
  }
});

// ── INIT
// ══════════════════════════════════════════════
render();
