// ─────────────────────────────────────────────────────────────────────────────
// useNetworkLayout — fonctions pures de mise en page pour un réseau en couches
//
// Ces fonctions ne dépendent pas de Vue : elles prennent des données et
// retournent des données. Cela les rend testables et réutilisables pour tout
// réseau en couches (pas seulement chat/chien).
// ─────────────────────────────────────────────────────────────────────────────

// ─── Tailles de nœuds par type ───────────────────────────────────────────────
// Le type est dérivé de la position de la couche :
//   première couche → 'input', dernière couche → 'output', autres → 'hidden'
export const NODE_SIZES = {
  input:  { shape: 'ellipse', rx: 70, ry: 36 },
  hidden: { shape: 'circle',  r: 28          },
  output: { shape: 'ellipse', rx: 58, ry: 34 },
}

// ─── Dériver le type d'un nœud depuis sa position dans les couches ───────────
export function deriveNodeTypes(layerOrder, nodes) {
  const lastLayer = layerOrder[layerOrder.length - 1]
  const firstLayer = layerOrder[0]

  return Object.fromEntries(
    Object.entries(nodes).map(([id, node]) => {
      let type = 'hidden'
      if (node.layer === firstLayer) type = 'input'
      if (node.layer === lastLayer)  type = 'output'
      return [id, type]
    })
  )
}

// ─── Calcul des positions (x, y) de chaque nœud ──────────────────────────────
// Paramètres :
//   layerOrder  : ['inputs', 'hidden', 'outputs']
//   nodes       : { E1: { layer: 'inputs', ... }, ... }
//   svgWidth    : largeur du viewBox SVG
//   svgHeight   : hauteur du viewBox SVG
//   padding     : marge intérieure { x, y }
//
// Retourne : { E1: { x, y }, H1: { x, y }, ... }
export function computePositions(layerOrder, nodes, svgWidth, svgHeight, padding = { x: 90, y: 60 }) {
  // Grouper les nœuds par couche en respectant l'ordre d'insertion
  const nodesByLayer = layerOrder.map(layerId =>
    Object.entries(nodes)
      .filter(([, n]) => n.layer === layerId)
      .map(([id]) => id)
  )

  const usableW = svgWidth  - padding.x * 2
  const usableH = svgHeight - padding.y * 2

  // Espacement horizontal entre couches
  // Si une seule couche : la placer au centre
  const xStep = nodesByLayer.length > 1
    ? usableW / (nodesByLayer.length - 1)
    : 0

  const positions = {}

  nodesByLayer.forEach((layerNodes, layerIndex) => {
    const x = padding.x + xStep * layerIndex
    // Espacement vertical : diviser la hauteur utile en (n+1) intervalles
    // pour centrer les nœuds verticalement
    const yStep = usableH / (layerNodes.length + 1)

    layerNodes.forEach((nodeId, nodeIndex) => {
      positions[nodeId] = {
        x,
        y: padding.y + yStep * (nodeIndex + 1),
      }
    })
  })

  return positions
}

// ─── Courbe de Bézier cubique (horizontale) ───────────────────────────────────
// Génère une commande SVG path M...C entre deux points.
// Les points de contrôle sont placés à 45% du déplacement horizontal,
// alignés verticalement avec les points de départ/arrivée.
// Résultat : une courbe en "S" horizontal caractéristique des schémas de réseaux.
export function bezierPath(x1, y1, x2, y2, tension = 0.45) {
  const cp = (x2 - x1) * tension
  return `M ${x1} ${y1} C ${x1 + cp} ${y1}, ${x2 - cp} ${y2}, ${x2} ${y2}`
}

// ─── Point de connexion sur le bord d'un nœud ────────────────────────────────
// Retourne le point (x, y) sur le bord gauche ou droit d'un nœud,
// selon sa taille et sa forme. C'est là qu'on accroche les arêtes.
export function connectionPoint(nodeId, side, positions, nodeTypes) {
  const pos  = positions[nodeId]
  const type = nodeTypes[nodeId]
  const size = NODE_SIZES[type]
  const offset = size.shape === 'circle' ? size.r : size.rx
  return {
    x: pos.x + (side === 'right' ? offset : -offset),
    y: pos.y,
  }
}

// ─── Calcul de toutes les arêtes avec leurs chemins SVG ──────────────────────
// Paramètres :
//   connections : [{ from, to }] — topologie (toutes les arêtes possibles)
//   weights     : { 'E1->H1': 2, ... } — poids sparse (absent = 0)
//   positions   : { E1: { x, y }, ... }
//   nodeTypes   : { E1: 'input', H1: 'hidden', ... }
//
// Retourne une liste d'objets arête enrichis avec path SVG, midpoint, poids.
export function computeEdges(connections, weights, positions, nodeTypes) {
  return connections.map(({ from, to }) => {
    const weight = weights[`${from}->${to}`] ?? 0
    const src    = connectionPoint(from, 'right', positions, nodeTypes)
    const dst    = connectionPoint(to,   'left',  positions, nodeTypes)

    return {
      id:     `${from}->${to}`,
      from,
      to,
      weight,
      path:   bezierPath(src.x, src.y, dst.x, dst.y),
      // Milieu approximatif de la courbe (utilisé pour afficher le label du poids)
      midX: (src.x + dst.x) / 2,
      midY: (src.y + dst.y) / 2,
    }
  })
}
