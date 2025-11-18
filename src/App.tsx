import { useState, useEffect, useMemo, useCallback } from 'react'
import Canvas from './components/Canvas'
import Sidebar from './components/Sidebar'
import { SONGS } from './game/songs'
import type { Player } from './types'
import layoutStyles from './css/layout.module.scss'
import loadingStyles from './css/loading.module.scss'

function App() {
  // UI Loading
  const [isLoading, setIsLoading] = useState(true)
  // Aktueller Song
  const [songId, setSongId] = useState(SONGS[0].id)

  // Responsive Canvas Größe (Breite dynamisch, Höhe = 80% Viewport)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  useEffect(() => {
    const recalc = () => {
      const vh80 = Math.floor(window.innerHeight * 0.8)
      const rightWidth = 260, gap = 20, padding = 40
      const centerWidth = Math.max(300, window.innerWidth - rightWidth - gap - padding)
      setCanvasSize({ width: centerWidth, height: vh80 })
    }
    recalc(); window.addEventListener('resize', recalc)
    return () => window.removeEventListener('resize', recalc)
  }, [])

  // Spieler State
  const [players, setPlayers] = useState<Player[]>([])
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null)
  const activePlayer = useMemo(() => players.find(p => p.id === activePlayerId) || null, [players, activePlayerId])

  // Session Steuerung
  const [startSignal, setStartSignal] = useState(0)
  const [sessionFinished, setSessionFinished] = useState(false)
  const [playersPlayedThisRound, setPlayersPlayedThisRound] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Gewinner (höchster Score)
  const winner = useMemo(() => players.reduce<Player | null>((best, cur) => best == null || cur.score > best.score ? cur : best, null), [players])

  // Eingabe neues Spielername
  const [newPlayerName, setNewPlayerName] = useState('')

  /** Neuen Spieler hinzufügen */
  const addPlayer = () => {
    const name = newPlayerName.trim(); if (!name) return
    const p: Player = { id: Date.now(), name, score: 0 }
    setPlayers(prev => [...prev, p])
    if (activePlayerId == null) setActivePlayerId(p.id)
    setNewPlayerName('')
  }

  /** Score-Update vom Canvas -> aktiven Spieler aktualisieren */
  const onScoreChange = useCallback((score: number) => {
    if (activePlayerId == null) return
    setPlayers(prev => {
      let changed = false
      const next = prev.map(p => {
        if (p.id !== activePlayerId) return p
        if (p.score === score) return p
        changed = true
        return { ...p, score }
      })
      return changed ? next : prev
    })
  }, [activePlayerId])

  /** Nächsten Spieler auswählen oder Session beenden */
  const advanceToNextPlayer = () => {
    if (!players.length || activePlayerId == null) return
    const idx = players.findIndex(p => p.id === activePlayerId); if (idx === -1) return
    const nextPlayedCount = playersPlayedThisRound + 1
    const roundDone = nextPlayedCount >= players.length
    if (roundDone) { 
      setSessionFinished(true); 
      setPlayersPlayedThisRound(0); 
      setSidebarCollapsed(false); // Sidebar wieder öffnen bei Session-Ende
      return 
    }
    const nextIdx = (idx + 1) % players.length
    setActivePlayerId(players[nextIdx].id)
    setPlayersPlayedThisRound(nextPlayedCount)
    setStartSignal(s => s + 1)
  }

  /** Manueller Start -> Session fortsetzen oder neue Runde */
  const onManualStart = () => {
    if (!activePlayerId) return
    setSessionFinished(false)
    setPlayersPlayedThisRound(0)
    setStartSignal(s => s + 1)
    setSidebarCollapsed(true) // Sidebar einklappen wenn Spiel startet
  }

  /** Neues Spiel: Reset Scores & Start bei erstem Spieler */
  const onRestart = () => {
    setPlayers(prev => prev.map(p => ({ ...p, score: 0 })))
    if (players.length) setActivePlayerId(players[0].id)
    setPlayersPlayedThisRound(0)
    setSessionFinished(false)
    setStartSignal(s => s + 1)
  }

  // Loading Spinner Timeout
  useEffect(() => { const t = setTimeout(() => setIsLoading(false), 3500); return () => clearTimeout(t) }, [])

  if (isLoading) {
    return (
      <div className={loadingStyles.loadingScreen}>
        <div className={loadingStyles.spinnerContainer}>
          <div className={loadingStyles.spinner} />
          <h1 className={loadingStyles.gameTitle}>Melody Rush</h1>
          <div className={loadingStyles.keysHint}>Steuere mit den Tasten <span className={loadingStyles.keycap}>A</span><span className={loadingStyles.keycap}>S</span><span className={loadingStyles.keycap}>D</span><span className={loadingStyles.keycap}>F</span></div>
        </div>
      </div>
    )
  }

  return (
    <div className={layoutStyles.app}>
      <div className={`${layoutStyles.layout} ${sidebarCollapsed ? layoutStyles.sidebarCollapsed : ''}`}>
        <main className={layoutStyles.center}>
          <div className={layoutStyles.canvasWrapper}>
            <Canvas
              songId={songId}
              width={canvasSize.width}
              height={canvasSize.height}
              onScoreChange={onScoreChange}
              canStart={activePlayerId != null}
              onFinished={advanceToNextPlayer}
              startSignal={startSignal}
              activePlayerName={activePlayer?.name}
              sessionFinished={sessionFinished}
              onManualStart={onManualStart}
              winnerName={winner?.name}
              winnerScore={winner?.score}
              playerCount={players.length}
              onRestart={onRestart}
            />
          </div>
        </main>

        {!sidebarCollapsed && (
          <Sidebar
            players={players}
            activePlayerId={activePlayerId}
            onSelectPlayer={setActivePlayerId}
            newPlayerName={newPlayerName}
            setNewPlayerName={setNewPlayerName}
            addPlayer={addPlayer}
            songId={songId}
            setSongId={setSongId}
          />
        )}
      </div>
    </div>
  )
}

export default App
